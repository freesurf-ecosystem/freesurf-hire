import os, sys, glob
from huggingface_hub import snapshot_download

token = os.environ.get("HF_TOKEN")
cache_dir = os.environ.get("CACHE_DIR", "/models/hub")

MODELS = [
    os.environ.get("TUTOR_MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct"),
    os.environ.get("VISION_MODEL_ID", "meta-llama/Llama-3.2-11B-Vision-Instruct"),
    os.environ.get("CHATTERBOX_MODEL_ID", "ResembleAI/chatterbox"),
]

print(f"HF_TOKEN {'set' if token else 'NOT SET'}", flush=True)

for model_id in MODELS:
    print(f"Downloading {model_id} to {cache_dir}", flush=True)
    snapshot_download(
        model_id,
        token=token,
        cache_dir=cache_dir,
        ignore_patterns=["original/*", "*.pth"],
        tqdm_class=None,
    )
    print(f"Download complete: {model_id}", flush=True)

files = glob.glob(f"{cache_dir}/**", recursive=True)
print(f"Total files downloaded: {len(files)}", flush=True)
