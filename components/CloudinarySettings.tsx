"use client";

import { useState } from "react";
import type { CloudinaryConfig } from "@/lib/types";
import { saveCloudinaryConfig, isCloudinaryConfigured } from "@/lib/cloudinary-config";

interface CloudinarySettingsProps {
  config: CloudinaryConfig;
  onSave: (config: CloudinaryConfig) => void;
}

export default function CloudinarySettings({ config, onSave }: CloudinarySettingsProps) {
  const [open, setOpen] = useState(!isCloudinaryConfigured(config));
  const [cloudName, setCloudName] = useState(config.cloudName);
  const [uploadPreset, setUploadPreset] = useState(config.uploadPreset);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const next: CloudinaryConfig = { cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() };
    saveCloudinaryConfig(next);
    onSave(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-panel">
      <button type="button" className="settings-toggle" onClick={() => setOpen((o) => !o)}>
        ⚙️ Configuración de Cloudinary
        {isCloudinaryConfigured(config) ? (
          <span className="status-ok">● conectado</span>
        ) : (
          <span className="status-missing">● falta configurar</span>
        )}
      </button>

      {open && (
        <div className="settings-body">
          <p className="settings-hint">
            Solo necesitás el <strong>Cloud Name</strong> y un <strong>Upload Preset</strong> en modo
            "Unsigned" (Cloudinary → Settings → Upload → Upload presets). Nunca pegues acá tu API
            Secret: esta app sube los archivos directo desde tu navegador, y cualquier clave que
            escribas queda visible para quien inspeccione la página.
          </p>

          <div className="field">
            <label>Cloud Name</label>
            <input
              type="text"
              placeholder="ej: dxxxxxxx"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Upload Preset (unsigned)</label>
            <input
              type="text"
              placeholder="ej: misto-landing-unsigned"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
            />
          </div>

          <button type="button" className="btn-primary" onClick={handleSave}>
            {saved ? "✓ Guardado" : "Guardar"}
          </button>

          <p className="settings-note">
            Se guarda solo en este navegador (localStorage), no se envía a ningún servidor propio.
          </p>
        </div>
      )}
    </div>
  );
}
