"use client";

import UploadZone from "./UploadZone";
import ButtonEditor from "./ButtonEditor";
import type { PageSection, MediaAsset, UploadMode, CloudinaryConfig, ButtonConfig } from "@/lib/types";

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

  function updateButton(button: ButtonConfig) {
    onUpdate({ ...page, button });
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

      <ButtonEditor 
        page={page} 
        onUpdate={updateButton}
      />
    </div>
  );
}
