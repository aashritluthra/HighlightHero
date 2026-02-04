"""
HighlightHero Backend — Video processing API.
Transforms sports moments into stylized, viral-ready animations
with high-fidelity sound synchronization.
"""

import os
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

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

# S3 client configuration with Signature Version 4
from botocore.config import Config

AWS_REGION = os.getenv("AWS_REGION", "us-east-2")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION,
    endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com",
    config=Config(signature_version="s3v4"),
)
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Allowed video content types
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",  # .mov
    "video/webm",
    "video/x-msvideo",  # .avi
}


class VideoRegistration(BaseModel):
    object_key: str
    user_id: str
    filename: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "highlight-hero-backend"}


@app.get("/")
def root():
    return {
        "message": "HighlightHero API",
        "docs": "/docs",
    }


@app.get("/upload/presigned-url")
def get_presigned_url(filename: str, content_type: str = "video/mp4"):
    """
    Generate a presigned URL for uploading a video directly to S3.
    """
    if not S3_BUCKET_NAME:
        raise HTTPException(status_code=500, detail="S3 bucket not configured")

    if content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}",
        )

    # Generate unique object key
    object_key = f"uploads/{uuid4()}/{filename}"

    try:
        # Generate presigned URL without ContentType constraint for better CORS compatibility
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET_NAME,
                "Key": object_key,
            },
            ExpiresIn=900,  # 15 minutes
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate URL: {str(e)}")

    return {
        "uploadUrl": presigned_url,
        "objectKey": object_key,
        "contentType": content_type,  # Return content type for client to use
    }


@app.post("/videos")
def register_video(video: VideoRegistration):
    """
    Register a video after successful upload to S3.
    For now, just returns success. Later, save to database.
    """
    # TODO: Save video metadata to database
    # TODO: Trigger video processing pipeline

    return {
        "status": "success",
        "message": "Video registered successfully",
        "objectKey": video.object_key,
        "userId": video.user_id,
        "filename": video.filename,
    }
