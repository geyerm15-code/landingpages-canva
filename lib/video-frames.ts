export async function extractVideoFrames(
  videoFile: File,
  frameCount: number = 60
): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = "anonymous";
    
    const frames: Blob[] = [];
    let framesCaptured = 0;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const interval = duration / frameCount;

      const captureFrame = (index: number) => {
        if (index >= frameCount) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = index * interval;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) frames.push(blob);
            framesCaptured++;
            captureFrame(framesCaptured);
          }, "image/jpeg", 0.8);
        }
      };

      captureFrame(0);
    };

    video.onerror = () => reject(new Error("Error loading video"));
  });
}

export async function uploadFramesToCloudinary(
  frames: Blob[],
  cloudName: string,
  uploadPreset: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < frames.length; i++) {
    const formData = new FormData();
    formData.append("file", frames[i]);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (response.ok) {
        const data = await response.json();
        urls.push(data.secure_url);
      }

      if (onProgress) onProgress(i + 1, frames.length);
    } catch (err) {
      console.error(`Error uploading frame ${i}:`, err);
    }
  }

  return urls;
}
