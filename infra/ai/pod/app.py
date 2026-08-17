"""
FreeSurf consolidated AI — HTTP server entrypoint.

For the Salad Container Engine (and RunPod pods): a plain HTTP server that
reuses handler.py's model logic + lazy loading. Salad routes requests to this
container's port (see Dockerfile.salad / the container-group config).

Endpoints:
  POST /         {"task_type": "tutor"|"analyze", ...} -> same output dict
  GET  /health   readiness check
"""
from fastapi import FastAPI, Request
from starlette.concurrency import run_in_threadpool

from handler import handler

app = FastAPI()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/")
async def infer(request: Request):
    try:
        body = await request.json()
    except Exception:
        return {"error": "Invalid JSON body"}

    # handler() is a blocking sync function — run it off the event loop so
    # concurrent requests don't stall each other.
    return await run_in_threadpool(handler, {"input": body})
