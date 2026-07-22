import type { CloudinaryConfig, MediaAsset, MediaType } from "./types";

/**
 * Sube un archivo directo del navegador a Cloudinary usando un "unsigned
 * upload preset". Esto evita pasar el archivo por una función serverless de
 * Vercel (que tiene límites de tamaño de payload y de duración).
 *
 * IMPORTANTE: unsigned upload solo necesita Cloud Name + Upload Preset.
 * Nunca uses acá el API Secret de Cloudinary — expuesto en el navegador,
 * cualquiera podría usarlo para subir contenido a tu cuenta o gastar tu
 * cuota. La config (cloudName/uploadPreset) se recibe como parámetro y la
 * carga la UI desde localStorage — ver lib/cloudinary-config.ts.
 */
export async function uploadToCloudinary(
  file: File,
  config: CloudinaryConfig,
  onProgress?: (percent: number) => void
): Promise<MediaAsset> {
  const { cloudName, uploadPreset } = config;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Falta configurar Cloudinary. Abrí '⚙️ Configuración' y cargá tu Cloud Name y Upload Preset."
    );
  }

  const mediaType: MediaType = file.type.startsWith("video/") ? "video" : "image";
  const resourceType = mediaType === "video" ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Cloudinary genera automáticamente una versión .webp optimizada de las
  // imágenes cuando se piden con f_auto,q_auto en la URL de entrega.

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url as string,
          publicId: data.public_id as string,
          type: mediaType,
        });
      } else {
        reject(new Error(`Error subiendo a Cloudinary (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red subiendo a Cloudinary"));
    xhr.send(formData);
  });
}

/**
 * Devuelve una URL de Cloudinary forzada a WebP con la calidad indicada
 * (0-100). Cloudinary hace la conversión y la compresión al vuelo, sin
 * necesidad de procesar nada vos mismo ni instalar librerías de imagen.
 */
export function optimizedUrl(url: string, quality: number = 85): string {
  if (!url.includes("/upload/")) return url;
  const clampedQuality = Math.max(1, Math.min(100, Math.round(quality)));
  return url.replace("/upload/", `/upload/f_webp,q_${clampedQuality}/`);
}
