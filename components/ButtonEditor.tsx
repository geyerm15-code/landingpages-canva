"use client";

import { ButtonConfig, PageSection } from "@/lib/types";
import { useState } from "react";

interface ButtonEditorProps {
  page: PageSection;
  onUpdate: (button: ButtonConfig) => void;
}

export default function ButtonEditor({ page, onUpdate }: ButtonEditorProps) {
  const [showEditor, setShowEditor] = useState(false);
  const button = page.button;

  const handleChange = (key: keyof ButtonConfig, value: any) => {
    onUpdate({ ...button, [key]: value });
  };

  return (
    <div className="button-editor">
      <div className="button-editor-header">
        <label>
          <input
            type="checkbox"
            checked={button.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
          />
          {" "}Agregar botón sobre esta sección
        </label>
        {button.enabled && (
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowEditor(!showEditor)}
          >
            {showEditor ? "Cerrar editor" : "Editar botón"}
          </button>
        )}
      </div>

      {button.enabled && (
        <>
          {/* Preview del botón */}
          <div className="button-preview-container">
            <div className="button-preview-bg"></div>
            <button
              type="button"
              style={{
                position: "absolute",
                left: `${button.positionX}%`,
                top: `${button.positionY}%`,
                transform: "translate(-50%, -50%)",
                backgroundColor: button.bgColor,
                borderColor: button.borderColor,
                borderWidth: "2px",
                color: button.textColor,
                padding: "12px 24px",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: `0 ${Math.round(button.shadowIntensity / 20)}px ${Math.round(button.shadowIntensity / 10)}px rgba(0,0,0,${button.shadowTransparency / 100})`,
              }}
            >
              {button.text || "BOTÓN"}
            </button>
          </div>

          {showEditor && (
            <div className="button-editor-form">
              <div className="field">
                <label>Texto del botón</label>
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => handleChange("text", e.target.value)}
                  placeholder="ENTRAR EN CONTACTO"
                />
              </div>

              <div className="field">
                <label>Link del botón</label>
                <input
                  type="url"
                  value={button.link}
                  onChange={(e) => handleChange("link", e.target.value)}
                  placeholder="https://wa.me/..."
                />
              </div>

              <div className="color-grid">
                <div className="field">
                  <label>Color de fondo</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={button.bgColor}
                      onChange={(e) => handleChange("bgColor", e.target.value)}
                    />
                    <span>{button.bgColor}</span>
                  </div>
                </div>

                <div className="field">
                  <label>Color de borde</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={button.borderColor}
                      onChange={(e) => handleChange("borderColor", e.target.value)}
                    />
                    <span>{button.borderColor}</span>
                  </div>
                </div>

                <div className="field">
                  <label>Color de texto</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={button.textColor}
                      onChange={(e) => handleChange("textColor", e.target.value)}
                    />
                    <span>{button.textColor}</span>
                  </div>
                </div>
              </div>

              <div className="slider-group">
                <div>
                  <label>Intensidad de sombra: {button.shadowIntensity}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={button.shadowIntensity}
                    onChange={(e) => handleChange("shadowIntensity", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Transparencia de sombra: {button.shadowTransparency}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={button.shadowTransparency}
                    onChange={(e) => handleChange("shadowTransparency", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="position-grid">
                <div className="field">
                  <label>Posición horizontal: {button.positionX}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={button.positionX}
                    onChange={(e) => handleChange("positionX", Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label>Posición vertical: {button.positionY}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={button.positionY}
                    onChange={(e) => handleChange("positionY", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
