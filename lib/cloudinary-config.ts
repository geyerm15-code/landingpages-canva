import type { CloudinaryConfig } from "./types";

const STORAGE_KEY = "misto-cloudinary-config";

/**
 * Carga la config de Cloudinary guardada en el navegador del usuario.
 * Si no hay nada guardado, usa las variables de entorno del deploy como
 * valor por defecto (opcional — podés dejarlas vacías en Vercel y forzar
 * a que cada usuario cargue su propia cuenta).
 */
export function loadCloudinaryConfig(): CloudinaryConfig {
  if (typeof window === "undefined") {
    return { cloudName: "", uploadPreset: "" };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CloudinaryConfig;
      if (parsed.cloudName && parsed.uploadPreset) return parsed;
    }
  } catch {
    // localStorage corrupto o bloqueado, seguimos al fallback
  }
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  };
}

export function saveCloudinaryConfig(config: CloudinaryConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isCloudinaryConfigured(config: CloudinaryConfig): boolean {
  return Boolean(config.cloudName && config.uploadPreset);
}
