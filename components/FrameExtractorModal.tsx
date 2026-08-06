"use client";

import { useState, useEffect } from "react";
import { extractVideoFrames, uploadFramesToCloudinary } from "@/lib/video-frames";
import type { MediaAsset } from "@/lib/types";

interface FrameExtractorModalProps {
  video: MediaAsset;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
  onFramesReady: (frameUrls: string[]) => void;
  onClose: () => void;
}

export default function FrameExtractorModal({
  video,
  cloudinaryConfig,
  onFramesReady,
  onClose,
}: FrameExtractorModalProps) {
  const [frameCount, setFrameCount] = useState(60);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<Blob[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [step, setStep] = useState<"config" | "extracting" | "uploading" | "done">("config");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Extraer frames de muestra cuando cambia frameCount
  useEffect(() => {
    if (step === "config") {
      extractSampleFrames();
    }
  }, [frameCount]);

  async function extractSampleFrames() {
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const file = new File([blob], "video.mp4", { type: "video/mp4" });

      const frames = await extractVideoFrames(file, Math.min(frameCount, 10));
      setExtractedFrames(frames);

      if (frames.length > 0) {
        const url = URL.createObjectURL(frames[0]);
        setThumbnailUrl(url);
        setThumbnailIndex(0);
      }
    } catch (err) {
      setError("Error extrayendo frames: " + String(err));
    }
  }

  function handleThumbnailSelect(index: number) {
    if (extractedFrames[index]) {
      setThumbnailIndex(index);
      const url = URL.createObjectURL(extractedFrames[index]);
      setThumbnailUrl(url);
    }
  }

  async function handleExtract() {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      setError("⚠️ Configura Cloudinary primero");
      return;
    }

    setStep("extracting");
    setProgress(0);
    setError("");
    setStatus("Extrayendo frames...");

    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const file = new File([blob], "video.mp4", { type: "video/mp4" });

      const frames = await extractVideoFrames(file, frameCount);
      setExtractedFrames(frames);

      setStep("uploading");
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
      setStep("done");

      setTimeout(() => {
        onFramesReady(frameUrls);
        onClose();
      }, 1500);
    } catch (err) {
      setError("Error: " + String(err));
      setStep("config");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {step === "config" && (
          <>
            <h2>Configurar Extracción de Frames</h2>

            {thumbnailUrl && (
              <div className="thumbnail-preview">
                <img src={thumbnailUrl} alt="Frame preview" />
              </div>
            )}

            <div className="frame-config">
              <label>Cantidad de frames por video</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{frameCount}</span>
              </div>
              <p className="slider-hint">20 (mín) — 120 (máx)</p>
            </div>

            {extractedFrames.length > 0 && (
              <div className="frames-preview">
                <label>Selecciona frame para thumbnail</label>
                <div className="frames-grid">
                  {extractedFrames.slice(0, 8).map((frame, idx) => {
                    const url = URL.createObjectURL(frame);
                    return (
                      <button
                        key={idx}
                        className={`frame-thumb ${idx === thumbnailIndex ? "selected" : ""}`}
                        onClick={() => handleThumbnailSelect(idx)}
                      >
                        <img src={url} alt={`Frame ${idx}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="error-text">{error}</p>}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleExtract}>
                OK
              </button>
            </div>
          </>
        )}

        {(step === "extracting" || step === "uploading") && (
          <div className="progress-container">
            <h2>{status}</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">{progress}%</p>
          </div>
        )}

        {step === "done" && (
          <div className="success-container">
            <h2>✓ Frames extraídos exitosamente</h2>
            <p>Los {frameCount} frames se están subiendo a tu Cloudinary...</p>
          </div>
        )}
      </div>
    </div>
  );
}
