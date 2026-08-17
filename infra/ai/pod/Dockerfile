# FreeSurf consolidated AI — RunPod pod (runtime)
# HTTP server (FastAPI) on port 8000. Models are mounted from a Network Volume
# at /models (HF_HOME=/models), populated separately by volume/Dockerfile.

FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04

ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev git curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1 \
    && python3 -m ensurepip --upgrade \
    && python3 -m pip install --upgrade pip setuptools wheel

# STT + LLM + TTS + Vision + HTTP server deps
RUN pip install faster-whisper transformers accelerate bitsandbytes \
    kokoro>=0.8.4 misaki[en] soundfile numpy==1.26.4 \
    langdetect pillow json-repair \
    fastapi uvicorn pyannote.audio chatterbox-tts==0.1.7

# PyTorch with CUDA 12.4 — installed AFTER deps and force-reinstalled so
# torch/torchvision/torchaudio end up as a matching cu124 set. (pyannote.audio
# pulls a mismatched torchvision from PyPI, which breaks the build with
# "operator torchvision::nms does not exist".)
RUN pip install --force-reinstall torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Pre-download small models only (Whisper, Kokoro) — LLMs are volume mounted
RUN python3 -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu', compute_type='int8'); print('Whisper cached')"
RUN python3 -c "from kokoro import KPipeline; KPipeline(lang_code='a'); print('Kokoro cached')"

COPY handler.py /handler.py
COPY app.py /app.py

# Models live on the mounted Network Volume
ENV HF_HOME=/models
ENV HF_HUB_ENABLE_HF_TRANSFER=1

EXPOSE 8000
CMD ["python3", "-u", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
