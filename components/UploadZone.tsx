"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { CloudinaryConfig, MediaAsset, UploadMode } from "@/lib/types";
import { acceptForMode } from "@/lib/types";

interface UploadZoneProps {
  label: string;
  asset?: MediaAsset;
  mode: UploadMode;
  cloudinaryConfig: CloudinaryConfig;
  onChange: (asset: MediaAsset | undefined) => void;
}

export default function UploadZone({ label, asset, mode, cloudinaryConfig, onChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);
    try {
      const uploaded = await uploadToCloudinary(file, cloudinaryConfig, setProgress);
      onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setProgress(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <p className="upload-label">{label}</p>

      {asset ? (
        <div className="upload-preview">
          {asset.type === "image" ? (
            <img src={asset.url} alt={label} />
          ) : (
            <video src={asset.url} muted loop autoPlay playsInline />
          )}
          <button
            type="button"
            className="btn-remove"
            onClick={() => onChange(undefined)}
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-upload"
          onClick={() => inputRef.current?.click()}
        >
          {progress !== null ? `Subiendo… ${progress}%` : "↑ Seleccionar archivo"}
        </button>
      )}

      {error && <p className="upload-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={acceptForMode(mode)}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
