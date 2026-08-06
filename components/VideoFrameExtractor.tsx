"use client";

import { useState } from "react";
import FrameExtractorModal from "./FrameExtractorModal";
import type { MediaAsset } from "@/lib/types";

interface VideoFrameExtractorProps {
  video: MediaAsset;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
  onFramesReady: (frameUrls: string[]) => void;
}

export default function VideoFrameExtractor({
  video,
  cloudinaryConfig,
  onFramesReady,
}: VideoFrameExtractorProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="frame-extractor">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          🎬 Extraer frames para scrolleo
        </button>
        <p className="frame-extractor-hint">
          Convierte tu video en frames interactivos para scroll vertical
        </p>
      </div>

      {showModal && (
        <FrameExtractorModal
          video={video}
          cloudinaryConfig={cloudinaryConfig}
          onFramesReady={onFramesReady}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
