"use client";

import { useState } from "react";
import { extractVideoFrames, uploadFramesToCloudinary } from "@/lib/video-frames";
import type { MediaAsset } from "@/lib/types";

interface VideoFrameExtractorProps {
  video: MediaAsset;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
  onFramesReady: (frameUrls: string[]) => void;
}

export default function VideoFrameExtractor({
  video,
  cloudinaryConfig,
  onFramesReady,
}: VideoFrameExtractorProps) {
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleExtractAndUpload() {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      setError("⚠️ Configura Cloudinary primero");
      return;
    }

    setExtracting(true);
    setProgress(0);
    setError("");
    setStatus("Extrayendo frames del video...");

    try {
      // Descargar el video
      const response = await fetch(video.url);
      const blob = await response.blob();
      const file = new File([blob], "video.mp4", { type: "video/mp4" });

      // Extraer frames
      setStatus("Extrayendo 60 frames...");
      const frames = await extractVideoFrames(file, 60);

      // Subir a Cloudinary
      setStatus("Subiendo frames a Cloudinary...");
      const frameUrls = await uploadFramesToCloudinary(
        frames,
        cloudinaryConfig.cloudName,
        cloudinaryConfig.uploadPreset,
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
        }
      );

      setStatus("✓ Frames listos");
      setProgress(100);
      onFramesReady(frameUrls);

      setTimeout(() => {
        setExtracting(false);
        setStatus("");
      }, 2000);
    } catch (err) {
      setError("Error: " + String(err));
      setExtracting(false);
    }
  }

  return (
    <div className="frame-extractor">
      <button
        type="button"
        className="btn-primary"
        onClick={handleExtractAndUpload}
        disabled={extracting}
      >
        {extracting ? "Procesando..." : "Extraer frames para scrolleo"}
      </button>

      {extracting && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {status} {progress > 0 && `(${progress}%)`}
          </p>
        </div>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p>}
    </div>
  );
}
