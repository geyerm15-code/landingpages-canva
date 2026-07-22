"use client";

import type { UploadMode } from "@/lib/types";

interface ProjectOptionsProps {
  mode: UploadMode;
  qualityMobile: number;
  qualityDesktop: number;
  onModeChange: (mode: UploadMode) => void;
  onQualityMobileChange: (value: number) => void;
  onQualityDesktopChange: (value: number) => void;
}

const MODE_OPTIONS: { value: UploadMode; label: string }[] = [
  { value: "image", label: "Solo imagen" },
  { value: "video", label: "Solo video" },
  { value: "mixed", label: "Mixto (imagen + video)" },
];

export default function ProjectOptions({
  mode,
  qualityMobile,
  qualityDesktop,
  onModeChange,
  onQualityMobileChange,
  onQualityDesktopChange,
}: ProjectOptionsProps) {
  return (
    <section className="project-options">
      <div className="field">
        <label>Tipo de archivos del proyecto</label>
        <div className="mode-toggle">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={mode === opt.value ? "mode-btn active" : "mode-btn"}
              onClick={() => onModeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="quality-row">
        <div className="field">
          <label>Calidad WebP — Mobile ({qualityMobile})</label>
          <input
            type="range"
            min={1}
            max={100}
            value={qualityMobile}
            onChange={(e) => onQualityMobileChange(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label>Calidad WebP — Desktop ({qualityDesktop})</label>
          <input
            type="range"
            min={1}
            max={100}
            value={qualityDesktop}
            onChange={(e) => onQualityDesktopChange(Number(e.target.value))}
          />
        </div>
      </div>
      <p className="settings-note">
        Aplica solo a imágenes (los videos se suben tal cual). Calidad más alta = más peso de archivo.
      </p>
    </section>
  );
}
