"use client";

import UploadZone from "./UploadZone";
import type { PageSection, MediaAsset, UploadMode, CloudinaryConfig } from "@/lib/types";

interface PageCardProps {
  page: PageSection;
  index: number;
  total: number;
  mode: UploadMode;
  cloudinaryConfig: CloudinaryConfig;
  onUpdate: (page: PageSection) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

export default function PageCard({
  page,
  index,
  total,
  mode,
  cloudinaryConfig,
  onUpdate,
  onRemove,
  onMove,
}: PageCardProps) {
  function setAsset(device: "mobile" | "desktop", asset: MediaAsset | undefined) {
    onUpdate({ ...page, [device]: asset });
  }

  return (
    <div className="page-card">
      <div className="page-card-header">
        <span className="page-badge">Página {index + 1}</span>
        <div className="page-card-actions">
          <button type="button" disabled={index === 0} onClick={() => onMove("up")}>
            ↑
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove("down")}>
            ↓
          </button>
          <button type="button" className="btn-danger" onClick={onRemove}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="page-card-body">
        <UploadZone
          label="Versión mobile"
          asset={page.mobile}
          mode={mode}
          cloudinaryConfig={cloudinaryConfig}
          onChange={(asset) => setAsset("mobile", asset)}
        />
        <UploadZone
          label="Versión desktop"
          asset={page.desktop}
          mode={mode}
          cloudinaryConfig={cloudinaryConfig}
          onChange={(asset) => setAsset("desktop", asset)}
        />
      </div>

      <div className="page-card-footer">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={page.addButton}
            onChange={(e) => onUpdate({ ...page, addButton: e.target.checked })}
          />
          Agregar botón sobre esta sección
        </label>

        {page.addButton && (
          <div className="button-fields">
            <input
              type="text"
              placeholder="Texto del botón"
              value={page.buttonText}
              onChange={(e) => onUpdate({ ...page, buttonText: e.target.value })}
            />
            <input
              type="text"
              placeholder="Link (https://wa.me/... o URL)"
              value={page.buttonLink}
              onChange={(e) => onUpdate({ ...page, buttonLink: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
