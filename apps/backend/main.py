"""
HighlightHero Backend — Video processing API.
Transforms sports moments into stylized, viral-ready animations
with high-fidelity sound synchronization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HighlightHero API",
    description="Video processing backend for stylized sports highlight animations",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "highlight-hero-backend"}


@app.get("/")
def root():
    return {
        "message": "HighlightHero API",
        "docs": "/docs",
    }
