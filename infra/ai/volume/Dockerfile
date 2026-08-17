# FreeSurf consolidated AI — model downloader (RunPod Network Volume)
# Run once with the volume mounted at /models to populate it with the LLMs.
# The runtime (pod/Dockerfile) then loads them from the volume.
#
# Usage: build this image, then run it on a pod with a Network Volume mounted
# at /models and HF_TOKEN set (Llama 3.1 is gated).

FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04

ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev git curl \
    && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1 \
    && python3 -m ensurepip --upgrade \
    && python3 -m pip install --upgrade pip

RUN pip install huggingface_hub[hf_transfer]

COPY download.py /download.py

CMD ["python3", "-u", "/download.py"]
