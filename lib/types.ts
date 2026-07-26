export type MediaType = "image" | "video";

/** Modo global del proyecto: qué tipo de archivos se aceptan al subir */
export type UploadMode = "image" | "video" | "mixed";

export interface MediaAsset {
  url: string;
  type: MediaType;
  publicId?: string;
  /** dataURL de baja resolución solo para preview local mientras sube */
  previewUrl?: string;
}

export interface ButtonConfig {
  enabled: boolean;
  text: string;
  link: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  shadowIntensity: number; // 0-100
  shadowTransparency: number; // 0-100
  positionX: number; // % o px
  positionY: number; // % o px
}

export interface PageSection {
  id: string;
  order: number;
  mobile?: MediaAsset;
  desktop?: MediaAsset;
  button: ButtonConfig;
}

export interface ProjectState {
  title: string;
  whatsappLink: string;
  /** Imagen / Video / Mixto — controla qué formatos se pueden subir */
  mode: UploadMode;
  /** Calidad de exportación WebP (0-100) para las imágenes mobile */
  qualityMobile: number;
  /** Calidad de exportación WebP (0-100) para las imágenes desktop */
  qualityDesktop: number;
  pages: PageSection[];
}

/**
* Credenciales de Cloudinary. OJO: solo Cloud Name + Upload Preset
* (unsigned). Nunca se guarda API Secret acá — ver components/CloudinarySettings.tsx
*/
export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export function createEmptyPage(order: number): PageSection {
  return {
    id: crypto.randomUUID(),
    order,
    button: {
      enabled: false,
      text: "ENTRAR EN CONTACTO",
      link: "",
      bgColor: "#10b981",
      borderColor: "#10b981",
      textColor: "#ffffff",
      shadowIntensity: 43,
      shadowTransparency: 50,
      positionX: 50,
      positionY: 80,
    },
  };
}

export function createEmptyProject(): ProjectState {
  return {
    title: "Landing Page",
    whatsappLink: "",
    mode: "mixed",
    qualityMobile: 100,
    qualityDesktop: 85,
    pages: [createEmptyPage(0)],
  };
}

/** Acepta según el modo elegido, usado en el <input type="file" accept="..."> */
export function acceptForMode(mode: UploadMode): string {
  if (mode === "image") return "image/png,image/jpeg,image/webp";
  if (mode === "video") return "video/mp4";
  return "image/png,image/jpeg,image/webp,video/mp4";
}
