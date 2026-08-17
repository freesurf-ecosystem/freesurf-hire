"""
FreeSurf consolidated AI inference handler.

Routes by `input.task_type`:
  - "tutor"       : Whisper (STT) + Llama 3.1 8B (LLM) + TTS (Kokoro/Chatterbox)
  - "analyze"     : Llama 3.2 11B Vision (food identification + macro estimation)
  - "tts"         : TTS (Kokoro/Chatterbox) — text + voice → audio
  - "transcribe"  : Whisper (STT) — audio → segments + text

Model IDs are env-configurable so they can be swapped without editing code:
  - TUTOR_MODEL_ID    (default: meta-llama/Llama-3.1-8B-Instruct)
  - VISION_MODEL_ID   (default: meta-llama/Llama-3.2-11B-Vision-Instruct)

TTS backend is selectable via env: TTS_BACKEND=kokoro (default) | chatterbox

Models load lazily per task_type to keep cold starts as small as possible.
"""
print("BOOT: consolidated handler.py starting", flush=True)

import base64
import io
import os
import re
import json
import time
import traceback
import sys
import subprocess
import tempfile
from json_repair import repair_json

os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "1")

try:
    import torch
    import numpy as np
    import soundfile as sf
    from PIL import Image
    from faster_whisper import WhisperModel
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        AutoProcessor,
        MllamaForConditionalGeneration,
        BitsAndBytesConfig,
    )
    from kokoro import KPipeline
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0

    print(f"CUDA available: {torch.cuda.is_available()}", flush=True)
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}", flush=True)
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.0f}GB", flush=True)
    print("All imports OK", flush=True)
except Exception:
    traceback.print_exc()
    sys.stderr.flush()
    raise

TUTOR_MODEL_ID = os.environ.get("TUTOR_MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct")
VISION_MODEL_ID = os.environ.get("VISION_MODEL_ID", "meta-llama/Llama-3.2-11B-Vision-Instruct")
TTS_BACKEND = os.environ.get("TTS_BACKEND", "kokoro")

# ---------------------------------------------------------------------------
# Tutor: language mapping + Kokoro voices
# ---------------------------------------------------------------------------
LANG_MAP = {
    "en": "a", "es": "e", "fr": "f", "it": "i",
    "pt": "p", "de": "d", "hi": "h", "ja": "j",
}
REVERSE_LANG_MAP = {v: k for k, v in LANG_MAP.items()}

VOICE_MAP = {
    "a": "af_heart",   # American English
    "b": "bf_emma",    # British English
    "e": "ef_dora",    # Spanish
    "f": "ff_siwis",   # French
    "i": "if_sara",    # Italian
    "p": "pf_dora",    # Portuguese
    "d": "df_anna",    # German
    "h": "hf_alpha",   # Hindi
    "j": "jf_alpha",   # Japanese
}

TUTOR_PROMPT = """You teach English. Only speak English and {native_lang}.{marking_instruction}
Keep replies short. Be encouraging. No JSON."""

_whisper = None
_llm = None
_tokenizer = None
_kokoro = {}
_diarization_pipeline = None
_chatterbox = None

# ---------------------------------------------------------------------------
# Tutor: model loading
# ---------------------------------------------------------------------------
def get_whisper():
    global _whisper
    if _whisper is None:
        print("Loading Whisper...", flush=True)
        _whisper = WhisperModel("base", device="cuda" if torch.cuda.is_available() else "cpu", compute_type="float16")
        print("Whisper ready", flush=True)
    return _whisper


def get_llm():
    global _llm, _tokenizer
    if _llm is None:
        print(f"Loading LLM {TUTOR_MODEL_ID}...", flush=True)
        quant = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16)
        _llm = AutoModelForCausalLM.from_pretrained(
            TUTOR_MODEL_ID,
            dtype=torch.bfloat16,
            device_map="auto",
            quantization_config=quant,
            token=os.environ.get("HF_TOKEN"),
        )
        _tokenizer = AutoTokenizer.from_pretrained(TUTOR_MODEL_ID, token=os.environ.get("HF_TOKEN"))
        print("LLM ready", flush=True)
    return _llm, _tokenizer


def get_kokoro(lang_code="a"):
    if lang_code not in _kokoro:
        _kokoro[lang_code] = KPipeline(lang_code=lang_code)
    return _kokoro[lang_code]


def get_chatterbox():
    global _chatterbox
    if _chatterbox is None:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        print("Loading Chatterbox Multilingual V3...", flush=True)
        _chatterbox = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
        print("Chatterbox ready", flush=True)
    return _chatterbox


def speak_chatterbox(text: str, lang_iso: str = "en"):
    model = get_chatterbox()
    wav = model.generate(text, language_id=lang_iso, cfg_weight=0.3)
    if hasattr(wav, "cpu"):
        wav = wav.cpu().numpy()
    audio_array = np.squeeze(wav)
    buf = io.BytesIO()
    sf.write(buf, audio_array, model.sr, format="WAV")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def get_diarization_pipeline():
    global _diarization_pipeline
    if _diarization_pipeline is None:
        hf_token = os.environ.get("HF_TOKEN", "")
        if not hf_token:
            print("WARNING: HF_TOKEN not set — diarization will be skipped", flush=True)
            return None
        try:
            from pyannote.audio import Pipeline
            print("Loading pyannote diarization pipeline...", flush=True)
            _diarization_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                token=hf_token,
            )
            print("Diarization pipeline ready", flush=True)
        except Exception as e:
            print(f"WARNING: diarization unavailable: {e}", flush=True)
            return None
    return _diarization_pipeline


def merge_diarization(whisper_segments, diarization):
    turns = list(diarization.itertracks(yield_label=True))
    merged = []
    for seg in whisper_segments:
        seg_start = seg.start
        seg_end = seg.end
        best_speaker = "SPEAKER_0"
        max_overlap = 0.0
        for turn, _, speaker in turns:
            overlap_start = max(seg_start, turn.start)
            overlap_end = min(seg_end, turn.end)
            overlap = max(0.0, overlap_end - overlap_start)
            if overlap > max_overlap:
                max_overlap = overlap
                best_speaker = speaker
        merged.append({
            "speaker": best_speaker,
            "start": round(seg_start, 2),
            "end": round(seg_end, 2),
            "text": seg.text.strip(),
        })
    return merged


def build_plain_text(segments):
    lines = []
    current_speaker = None
    for seg in segments:
        speaker = seg["speaker"]
        text = seg["text"]
        if speaker != current_speaker:
            lines.append(f"\n{speaker}: {text}")
            current_speaker = speaker
        else:
            lines.append(text)
    return "\n".join(lines).strip()


# ---------------------------------------------------------------------------
# Tutor: STT + LLM + TTS logic
# ---------------------------------------------------------------------------
def transcribe_audio(audio_base64: str):
    """Returns (text, language_code)"""
    audio_bytes = base64.b64decode(audio_base64)
    wav_path = None
    input_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".audio", delete=False) as f:
            f.write(audio_bytes)
            input_path = f.name
        wav_path = input_path + ".wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", wav_path],
            capture_output=True, check=True, timeout=30,
        )
        model = get_whisper()
        segments, info = model.transcribe(
            wav_path,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                threshold=0.3,
                min_speech_duration_ms=200,
                min_silence_duration_ms=300,
                speech_pad_ms=200,
            ),
        )
        text = " ".join(s.text.strip() for s in segments)
        print(f"[Whisper] transcribed: '{text}' lang={info.language}", flush=True)
        return text, info.language
    finally:
        if wav_path and os.path.exists(wav_path):
            os.unlink(wav_path)
        if input_path and os.path.exists(input_path):
            os.unlink(input_path)


def tutor_response(text: str, lang: str, native_lang: str = "", history: list = None):
    """Returns (correction, tutor_reply)"""
    model, tokenizer = get_llm()
    lang_names = {"en": "English", "es": "Spanish", "fr": "French", "de": "German",
                  "it": "Italian", "pt": "Portuguese", "ja": "Japanese"}
    lang_name = lang_names.get(lang, lang)

    native_name = lang_names.get(native_lang, native_lang)
    marking = ""
    if native_lang and native_lang != lang:
        marking = (
            f"When you use a word or phrase in {native_name}, "
            f"wrap it exactly like this: [lang:{native_lang}]word[/lang]. "
        )

    prompt = TUTOR_PROMPT.replace("{native_lang}", native_name if native_lang else "their language").replace(
        "{marking_instruction}", marking
    )
    messages = [{"role": "system", "content": prompt}]
    for turn in (history or [])[-10:]:
        role = "assistant" if turn.get("role") == "tutor" else "user"
        content = (turn.get("text") or "").strip()
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": text})
    formatted = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(formatted, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=256, temperature=0.7, do_sample=True)
    response = tokenizer.decode(output[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    print(f"[LLM] raw: {response[:300]}", flush=True)

    # Strip any JSON artifacts Qwen may still spit out
    response = re.sub(r'\{[\s"]*"(?:correction|response)"[\s:,"\{\}a-zA-Z0-9]*\}', '', response)
    response = response.strip()
    return None, response.strip()


def strip_lang_tags(text: str):
    """Remove [lang:XX] and [/lang] tags from display text while keeping content."""
    return re.sub(r'\[/?lang(?::\w*)?\]', '', text).strip()


def split_by_language(text: str, default_lang_iso: str = "en"):
    """Split mixed-language text into [(segment, kokoro_lang_code), ...]."""
    marker_re = re.compile(r'\[lang:(\w+)\](.*?)\[/lang\]', re.DOTALL)
    if marker_re.search(text):
        return _split_by_markers(text, marker_re, default_lang_iso)

    return _split_by_sentences(text, default_lang_iso)


def _split_by_markers(text, marker_re, default_iso):
    segments = []
    last_end = 0
    for m in marker_re.finditer(text):
        before = text[last_end:m.start()].strip()
        if before:
            kcode = LANG_MAP.get(default_iso, "a")
            if segments and segments[-1][1] == kcode:
                segments[-1] = (segments[-1][0] + " " + before, kcode)
            else:
                segments.append((before, kcode))
        iso = m.group(1)
        word = m.group(2).strip()
        if word:
            kcode = LANG_MAP.get(iso, LANG_MAP.get(default_iso, "a"))
            if segments and segments[-1][1] == kcode:
                segments[-1] = (segments[-1][0] + " " + word, kcode)
            else:
                segments.append((word, kcode))
        last_end = m.end()
    after = text[last_end:].strip()
    if after:
        kcode = LANG_MAP.get(default_iso, "a")
        if segments and segments[-1][1] == kcode:
            segments[-1] = (segments[-1][0] + " " + after, kcode)
        else:
            segments.append((after, kcode))
    if not segments:
        segments.append((text, LANG_MAP.get(default_iso, "a")))
    return segments


def _split_by_sentences(text, default_iso):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    segments = []
    for sent in sentences:
        if not sent.strip():
            continue
        try:
            iso = detect(sent)
        except Exception:
            iso = default_iso
        kcode = LANG_MAP.get(iso, "a")
        if segments and segments[-1][1] == kcode:
            segments[-1] = (segments[-1][0] + " " + sent, kcode)
        else:
            segments.append((sent, kcode))
    if not segments:
        segments.append((text, LANG_MAP.get(default_iso, "a")))
    return segments


def speak_mixed(text: str, default_lang_iso: str = "en"):
    """Returns base64 WAV audio, auto-switching Kokoro voices by detected language."""
    segments = split_by_language(text, default_lang_iso)
    chunks = []
    for seg_text, kcode in segments:
        audio_b64 = speak(seg_text, kcode)
        if audio_b64:
            audio_bytes = base64.b64decode(audio_b64)
            audio_np, sr = sf.read(io.BytesIO(audio_bytes))
            chunks.append(audio_np)
    if not chunks:
        return None
    combined = np.concatenate(chunks)
    buf = io.BytesIO()
    sf.write(buf, combined, 24000, format="WAV")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def speak(text: str, lang_code: str = "a"):
    """Returns base64 WAV audio for a single-language segment."""
    if TTS_BACKEND == "chatterbox":
        iso = REVERSE_LANG_MAP.get(lang_code, "en")
        return speak_chatterbox(text, iso)

    pipeline = get_kokoro(lang_code)
    voice = VOICE_MAP.get(lang_code, "af_heart")
    generator = pipeline(text, voice=voice, speed=1.0)
    all_samples = []
    for _, _, audio in generator:
        all_samples.append(audio)
    if not all_samples:
        return None
    audio_array = np.concatenate(all_samples)

    buf = io.BytesIO()
    sf.write(buf, audio_array, 24000, format="WAV")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def handle_tutor(job_input: dict):
    audio_b64 = job_input.get("audio_base64", "")
    if not audio_b64:
        return {"error": "No audio_base64 provided"}

    native_language = job_input.get("native_language", "")
    history = job_input.get("history", [])

    text, detected_lang = transcribe_audio(audio_b64)
    if not text.strip():
        reply = "I didn't hear you. Can you say that again?"
        audio_b64_out = speak(reply, "a")
        return {
            "audio_base64": audio_b64_out,
            "original": "",
            "correction": "",
            "response": reply,
            "language": "en",
        }

    correction, reply = tutor_response(text, detected_lang, native_language, history)
    default_iso = "en"
    audio = speak_mixed(reply, default_iso) if reply else None
    display_reply = strip_lang_tags(reply) if reply else reply

    return {
        "original": text,
        "correction": correction,
        "response": display_reply,
        "audio_base64": audio,
        "language": detected_lang,
    }


# ---------------------------------------------------------------------------
# Analyze (calorie tracker): vision prompts + model loading
# ---------------------------------------------------------------------------
VISION_SYSTEM_PROMPT = """You are a nutrition database. Respond with ONLY a JSON array. No text before or after.

Format: [{"name":"food","amount":1,"unit":"whole","protein":30,"carbs":40,"fat":30}]

RULES:
- FIRST character must be [
- LAST character must be ]
- NO markdown, NO explanation, NO "Here is...", NO notes
- Units: whole (single items), cup, oz, g, tbsp, tsp, slice, piece, bowl
- Calories are NOT needed — they are calculated from macros"""

TEXT_SYSTEM_PROMPT = """You are a nutrition database. Respond with ONLY a JSON array. No text before or after.

Format: [{"name":"food","amount":1,"unit":"whole","protein":30,"carbs":40,"fat":30}]

RULES:
- FIRST character must be [
- LAST character must be ]
- NO markdown, NO explanation, NO "Here is...", NO notes
- Units: whole (single items), cup, oz, g, tbsp, tsp, slice, piece, bowl
- Calories are NOT needed — they are calculated from macros"""

_vision_model = None
_vision_processor = None


def get_vision_model():
    global _vision_model, _vision_processor
    if _vision_model is None:
        t0 = time.time()
        hf_cache = os.environ.get("HF_HOME", os.path.expanduser("~/.cache/huggingface"))
        repo_dir = os.path.join(hf_cache, "hub", f"models--{VISION_MODEL_ID.replace('/', '--')}")
        was_cached = os.path.isdir(repo_dir)
        print(f"Loading {VISION_MODEL_ID}... cached={was_cached}", flush=True)

        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        if vram_gb >= 40:
            print(f"VRAM {vram_gb:.0f}GB — loading in bfloat16 (no quantization needed)", flush=True)
            _vision_model = MllamaForConditionalGeneration.from_pretrained(
                VISION_MODEL_ID,
                torch_dtype=torch.bfloat16,
                device_map="auto",
                attn_implementation="sdpa",
                token=os.environ.get("HF_TOKEN"),
            )
        else:
            print(f"VRAM {vram_gb:.0f}GB — using 4-bit quantization", flush=True)
            quant = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16)
            _vision_model = MllamaForConditionalGeneration.from_pretrained(
                VISION_MODEL_ID,
                quantization_config=quant,
                device_map="auto",
                attn_implementation="sdpa",
                token=os.environ.get("HF_TOKEN"),
            )
        _vision_processor = AutoProcessor.from_pretrained(
            VISION_MODEL_ID,
            token=os.environ.get("HF_TOKEN"),
        )
        elapsed = time.time() - t0
        verb = "Loaded from cache" if was_cached else "Downloaded and loaded"
        print(f"{verb} in {elapsed:.0f}s", flush=True)
    return _vision_model, _vision_processor


# ---------------------------------------------------------------------------
# Analyze (calorie tracker): JSON parsing + calorie math
# ---------------------------------------------------------------------------
def strip_markdown(text: str) -> str:
    """Remove markdown code fences and surrounding whitespace."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*\n?', '', text)
    text = re.sub(r'\n?```\s*$', '', text)
    return text.strip()


def _repair_with_lib(text: str):
    """Use json_repair to fix common LLM output errors."""
    text = strip_markdown(text)

    start = text.find('[')
    if start == -1:
        start = text.find('{')
    if start == -1:
        return None
    end = text.rfind(']')
    if end == -1:
        end = text.rfind('}')
    if end == -1:
        return None

    candidate = text[start:end + 1]
    try:
        repaired = repair_json(candidate)
        parsed = json.loads(repaired)
        return parsed if isinstance(parsed, list) else [parsed]
    except Exception:
        return None


def _calc_calories(items):
    result = []
    for item in items:
        if not isinstance(item, dict):
            continue
        p = float(item.get("protein", 0) or 0)
        c = float(item.get("carbs", 0) or 0)
        f = float(item.get("fat", 0) or 0)
        item["calories"] = round(p * 4 + c * 4 + f * 9)
        result.append(item)
    return result


def _extract_balanced_array(text: str, repair: bool = False):
    """Extract JSON array by tracking brace depth. If repair=True, try inserting missing } before ]."""
    start = text.find('[')
    if start == -1:
        return None
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                candidate = text[start:i + 1]
                try:
                    parsed = json.loads(candidate)
                    return parsed if isinstance(parsed, list) else [parsed]
                except Exception:
                    if repair:
                        repaired = candidate[:-1] + "}" + candidate[-1]
                        try:
                            parsed = json.loads(repaired)
                            return parsed if isinstance(parsed, list) else [parsed]
                        except Exception:
                            pass
                    return None
    return None


def _repair_garbled(text: str):
    """Handle malformed output like ["{","name":"Rice",...] — remove the stray "{" entry."""
    start = text.find('[')
    if start == -1:
        return None
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                candidate = text[start:i + 1]
                try:
                    return json.loads(candidate)
                except Exception:
                    pass
                if candidate.startswith('["{",') or candidate.startswith('["{", '):
                    inner = candidate[4:].strip().lstrip(",").strip()
                    reconstructed = "[{" + inner[:-1] + "}]"
                    try:
                        parsed = json.loads(reconstructed)
                        return parsed if isinstance(parsed, list) else [parsed]
                    except Exception:
                        pass
                return None
    return None


def _parse_markdown_nutrition(text: str):
    """Fallback: extract nutrition from markdown lists when model ignores JSON prompt."""
    items = []
    food_pattern = re.compile(r'[\*\-\+]\s*(.+?)\s*:?\s*$')

    lines = text.split('\n')
    current = None
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        food_match = food_pattern.match(stripped)
        if food_match and not any(kw in stripped.lower() for kw in ['calories', 'protein', 'carb', 'fat', 'total']):
            if current and current.get('name'):
                _fill_macros_from_text(current, '\n'.join(current.pop('_raw', [])))
                items.append(current)
            current = {'name': food_match.group(1).strip(), '_raw': []}
            continue
        if current:
            current.setdefault('_raw', []).append(stripped)

    if current and current.get('name'):
        _fill_macros_from_text(current, '\n'.join(current.pop('_raw', [])))
        items.append(current)

    return items if items else None


def _fill_macros_from_text(item, text):
    protein_pattern = re.compile(r'Protein[:\s]*([\d.]+)', re.IGNORECASE)
    carbs_pattern = re.compile(r'Carb(?:ohydrate)?s?[:\s]*([\d.]+)', re.IGNORECASE)
    fat_pattern = re.compile(r'(?:Total )?Fat[:\s]*([\d.]+)', re.IGNORECASE)

    for pattern, key in [(protein_pattern, 'protein'), (carbs_pattern, 'carbs'), (fat_pattern, 'fat')]:
        m = pattern.search(text)
        if m:
            try:
                item[key] = round(float(m.group(1)) * 10) / 10
            except ValueError:
                pass

    if not item.get('protein') and not item.get('carbs') and not item.get('fat'):
        return

    item.setdefault('protein', 0)
    item.setdefault('carbs', 0)
    item.setdefault('fat', 0)
    item['amount'] = 1
    item['unit'] = 'whole'


def _try_raw_json(text: str):
    """Try parsing raw text as JSON."""
    try:
        result = json.loads(text)
        return result if isinstance(result, list) else [result]
    except Exception:
        return None


def parse_response(text: str):
    """Try multiple strategies to extract JSON from LLM output."""
    text = strip_markdown(text)

    strategies = [
        lambda t: _repair_with_lib(t),
        lambda t: _extract_balanced_array(t),
        lambda t: re.search(r'\[\s*\{.*\}\s*\]', t, re.DOTALL),
        lambda t: _extract_balanced_array(t, repair=True),
        lambda t: _repair_garbled(t),
        lambda t: _parse_markdown_nutrition(t),
        lambda t: re.search(r'\[.*?\]', t, re.DOTALL),
        lambda t: _try_raw_json(t),
    ]

    for strategy in strategies:
        result = strategy(text)
        if result is None:
            continue
        if isinstance(result, list):
            return _calc_calories(result)
        if hasattr(result, 'group'):
            try:
                parsed = json.loads(result.group(0))
                parsed = parsed if isinstance(parsed, list) else [parsed]
                return _calc_calories(parsed)
            except Exception:
                pass

    return None


def handle_analyze(job_input: dict):
    image_base64 = job_input.get("image_base64", "")
    food_description = job_input.get("food_description", "")

    if not image_base64 and not food_description:
        return {"error": "No image_base64 or food_description provided"}

    model, processor = get_vision_model()

    if image_base64:
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image"},
                {"type": "text", "text": "What are the nutrition facts for each food in this photo?"},
            ]},
        ]
        text = processor.apply_chat_template(messages, add_generation_prompt=True)
        inputs = processor(image, text, return_tensors="pt").to(model.device)
    else:
        messages = [
            {"role": "system", "content": TEXT_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": food_description},
            ]},
        ]
        text = processor.apply_chat_template(messages, add_generation_prompt=True)
        inputs = processor(text=text, return_tensors="pt").to(model.device)

    output = model.generate(**inputs, max_new_tokens=400, temperature=0.2, do_sample=True)
    response = processor.decode(output[0], skip_special_tokens=True)

    assistant_part = response
    for delimiter in ["<|start_header_id|>assistant<|end_header_id|>", "assistant\n", "assistant"]:
        if delimiter in response:
            parts = response.split(delimiter)
            assistant_part = parts[-1].strip()
            if assistant_part.startswith("\n"):
                assistant_part = assistant_part[1:]
            break

    print(f"[Vision] Raw: {response[:500]}", flush=True)

    items = parse_response(assistant_part)
    if items:
        return {"items": items}

    print(f"[Vision] Failed to parse. Cleaned text: {strip_markdown(assistant_part)[:500]}", flush=True)
    return {"error": "Model did not return valid JSON", "raw": response[:500]}


# ---------------------------------------------------------------------------
# TTS (reader): Kokoro / Chatterbox (selected via TTS_BACKEND)
# ---------------------------------------------------------------------------
def handle_tts(job_input: dict):
    text = job_input.get("text", "")
    if not text:
        return {"error": "No text provided"}
    voice = job_input.get("voice", "af_heart")
    speed = float(job_input.get("speed", 1.0) or 1.0)
    lang_code = voice[0] if voice else "a"
    try:
        if TTS_BACKEND == "chatterbox":
            iso = REVERSE_LANG_MAP.get(lang_code, "en")
            return {"audio_base64": speak_chatterbox(text, iso)}

        pipeline = get_kokoro(lang_code)
        generator = pipeline(text, voice=voice, speed=speed)
        all_samples = []
        for _, _, audio in generator:
            all_samples.append(audio)
        if not all_samples:
            return {"error": "No audio generated"}
        audio_array = np.concatenate(all_samples)
        buf = io.BytesIO()
        sf.write(buf, audio_array, 24000, format="WAV")
        buf.seek(0)
        return {"audio_base64": base64.b64encode(buf.read()).decode("utf-8")}
    except Exception as e:
        return {"error": f"TTS error: {str(e)}"}


# ---------------------------------------------------------------------------
# Transcribe (transcriber): Whisper (no diarization)
# ---------------------------------------------------------------------------
def handle_transcribe(job_input: dict):
    audio_base64 = job_input.get("audio_base64", "")
    language = job_input.get("language", None)
    if not audio_base64:
        return {"error": "No audio_base64 provided"}

    wav_path = None
    input_path = None
    try:
        audio_bytes = base64.b64decode(audio_base64)
        with tempfile.NamedTemporaryFile(suffix=".audio", delete=False) as f:
            f.write(audio_bytes)
            input_path = f.name
        wav_path = input_path + ".wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", wav_path],
            capture_output=True, check=True, timeout=120,
        )
        model = get_whisper()
        segments, info = model.transcribe(wav_path, beam_size=5, language=language, vad_filter=True)
        raw_segments = list(segments)

        pipeline = get_diarization_pipeline()
        if pipeline is not None:
            try:
                out_segments = merge_diarization(raw_segments, pipeline(wav_path))
            except Exception:
                out_segments = [
                    {"speaker": "SPEAKER_0", "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
                    for s in raw_segments
                ]
        else:
            out_segments = [
                {"speaker": "SPEAKER_0", "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
                for s in raw_segments
            ]

        plain_text = build_plain_text(out_segments)
        return {
            "segments": out_segments,
            "text": plain_text,
            "language": info.language,
            "duration": round(info.duration, 2),
        }
    except Exception:
        return {"error": traceback.format_exc()}
    finally:
        if wav_path and os.path.exists(wav_path):
            os.unlink(wav_path)
        if input_path and os.path.exists(input_path):
            os.unlink(input_path)


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
def handler(event):
    job_input = event.get("input", {})
    task_type = job_input.get("task_type", "tutor")

    try:
        if task_type == "analyze":
            return handle_analyze(job_input)
        if task_type == "tts":
            return handle_tts(job_input)
        if task_type == "transcribe":
            return handle_transcribe(job_input)
        return handle_tutor(job_input)
    except Exception:
        return {"error": traceback.format_exc()}


if __name__ == "__main__":
    import runpod  # only needed for RunPod serverless, not the HTTP (Salad) path
    try:
        print("Pre-warming models...", flush=True)
        get_whisper()
        print("Whisper OK", flush=True)
        get_llm()
        print("LLM OK", flush=True)
        get_kokoro("a")
        print("Kokoro OK", flush=True)
        get_vision_model()
        print("Vision OK", flush=True)
        print("All models ready!", flush=True)
        runpod.serverless.start({"handler": handler})
    except Exception:
        traceback.print_exc()
        sys.stderr.flush()
        raise
