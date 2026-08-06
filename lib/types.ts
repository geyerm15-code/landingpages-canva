export type MediaType = "image" | "video";

export type UploadMode = "image" | "video" | "mixed";

export interface MediaAsset {
  url: string;
  type: MediaType;
  publicId?: string;
  previewUrl?: string;
}

export interface ButtonConfig {
  enabled: boolean;
  text: string;
  link: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  shadowIntensity: number;
  shadowTransparency: number;
  positionX: number;
  positionY: number;
}

export interface PageSection {
  id: string;
  order: number;
  mobile?: MediaAsset;
  desktop?: MediaAsset;
  button: ButtonConfig;
  frameUrls?: string[]; // ← Agregado para frames
}

export interface ProjectState {
  title: string;
  whatsappLink: string;
  mode: UploadMode;
  qualityMobile: number;
  qualityDesktop: number;
  pages: PageSection[];
}

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

export function acceptForMode(mode: UploadMode): string {
  if (mode === "image") return "image/png,image/jpeg,image/webp";
  if (mode === "video") return "video/mp4";
  return "image/png,image/jpeg,image/webp,video/mp4";
}
