"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type UploadStatus = "idle" | "getting-url" | "uploading" | "registering" | "success" | "error";

export function UploadButton() {
  const { user } = useUser();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid video file (MP4, MOV, WebM, or AVI)");
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 500MB");
      return;
    }

    setError(null);
    setStatus("getting-url");
    setProgress(0);

    try {
      // Step 1: Get presigned URL from backend
      const presignedRes = await fetch(
        `${API_URL}/upload/presigned-url?filename=${encodeURIComponent(file.name)}&content_type=${encodeURIComponent(file.type)}`
      );

      if (!presignedRes.ok) {
        const errData = await presignedRes.json();
        throw new Error(errData.detail || "Failed to get upload URL");
      }

      const { uploadUrl, objectKey } = await presignedRes.json();

      // Step 2: Upload directly to S3
      setStatus("uploading");

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Wrap XHR in a promise
      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Register the video with backend
      setStatus("registering");

      const registerRes = await fetch(`${API_URL}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_key: objectKey,
          user_id: user.id,
          filename: file.name,
        }),
      });

      if (!registerRes.ok) {
        throw new Error("Failed to register video");
      }

      setStatus("success");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isUploading = status === "getting-url" || status === "uploading" || status === "registering";

  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm
          transition-all duration-200
          ${isUploading 
            ? "bg-gray-600 cursor-not-allowed" 
            : "bg-violet-600 hover:bg-violet-700 cursor-pointer"
          }
          text-white
        `}
      >
        {status === "idle" && (
          <>
            <UploadIcon />
            Upload Video
          </>
        )}
        {status === "getting-url" && "Preparing..."}
        {status === "uploading" && `Uploading... ${progress}%`}
        {status === "registering" && "Finishing..."}
        {status === "success" && (
          <>
            <CheckIcon />
            Upload Complete!
          </>
        )}
        {status === "error" && "Try Again"}
      </button>

      {/* Progress bar */}
      {status === "uploading" && (
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Success message */}
      {status === "success" && (
        <p className="text-green-500 text-sm">Your video has been uploaded successfully!</p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
