"use client";

import { useEffect, useState } from "react";
import PageCard from "@/components/PageCard";
import CloudinarySettings from "@/components/CloudinarySettings";
import ProjectOptions from "@/components/ProjectOptions";
import { createEmptyPage, createEmptyProject } from "@/lib/types";
import type { CloudinaryConfig, PageSection, ProjectState } from "@/lib/types";
import { downloadElementorJSON } from "@/lib/elementor-generator";
import { loadCloudinaryConfig, isCloudinaryConfigured } from "@/lib/cloudinary-config";

export default function Home() {
  const [project, setProject] = useState<ProjectState>(() => createEmptyProject());
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>({
    cloudName: "",
    uploadPreset: "",
  });

  // La config de Cloudinary vive en localStorage del navegador, se carga
  // recién en el cliente (por eso useEffect, no directo en useState).
  useEffect(() => {
    setCloudinaryConfig(loadCloudinaryConfig());
  }, []);

  function updatePage(updated: PageSection) {
    setProject((p) => ({
      ...p,
      pages: p.pages.map((pg) => (pg.id === updated.id ? updated : pg)),
    }));
  }

  function addPage() {
    setProject((p) => ({
      ...p,
      pages: [...p.pages, createEmptyPage(p.pages.length)],
    }));
  }

  function removePage(id: string) {
    setProject((p) => ({
      ...p,
      pages: p.pages
        .filter((pg) => pg.id !== id)
        .map((pg, i) => ({ ...pg, order: i })),
    }));
  }

  function movePage(id: string, direction: "up" | "down") {
    setProject((p) => {
      const pages = [...p.pages].sort((a, b) => a.order - b.order);
      const idx = pages.findIndex((pg) => pg.id === id);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= pages.length) return p;
      [pages[idx], pages[swapWith]] = [pages[swapWith], pages[idx]];
      return { ...p, pages: pages.map((pg, i) => ({ ...pg, order: i })) };
    });
  }

  const sortedPages = [...project.pages].sort((a, b) => a.order - b.order);
  const readyCount = sortedPages.filter((pg) => pg.mobile || pg.desktop).length;

  return (
    <main className="container">
      <header className="app-header">
        <h1>Generador de Landing Page</h1>
        <p className="subtitle">Sube tus secciones de Canva (mobile y desktop) y exporta el JSON para Elementor</p>
      </header>

      <CloudinarySettings config={cloudinaryConfig} onSave={setCloudinaryConfig} />

      <section className="project-settings">
        <div className="field">
          <label>Nombre del proyecto</label>
          <input
            type="text"
            value={project.title}
            onChange={(e) => setProject((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Link de WhatsApp (opcional, botón flotante)</label>
          <input
            type="text"
            placeholder="https://wa.me/57..."
            value={project.whatsappLink}
            onChange={(e) => setProject((p) => ({ ...p, whatsappLink: e.target.value }))}
          />
        </div>
      </section>

      <ProjectOptions
        mode={project.mode}
        qualityMobile={project.qualityMobile}
        qualityDesktop={project.qualityDesktop}
        onModeChange={(mode) => setProject((p) => ({ ...p, mode }))}
        onQualityMobileChange={(qualityMobile) => setProject((p) => ({ ...p, qualityMobile }))}
        onQualityDesktopChange={(qualityDesktop) => setProject((p) => ({ ...p, qualityDesktop }))}
      />

      {!isCloudinaryConfigured(cloudinaryConfig) && (
        <p className="warning-banner">
          ⚠️ Configurá tu Cloud Name y Upload Preset de Cloudinary arriba antes de subir archivos.
        </p>
      )}

      <section className="pages-list">
        {sortedPages.map((page, index) => (
          <PageCard
            key={page.id}
            page={page}
            index={index}
            total={sortedPages.length}
            mode={project.mode}
            cloudinaryConfig={cloudinaryConfig}
            onUpdate={updatePage}
            onRemove={() => removePage(page.id)}
            onMove={(dir) => movePage(page.id, dir)}
          />
        ))}
      </section>

      <div className="toolbar">
        <button type="button" className="btn-secondary" onClick={addPage}>
          + Agregar página
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={readyCount === 0}
          onClick={() => downloadElementorJSON(project)}
        >
          ⬇ Exportar JSON ({readyCount} {readyCount === 1 ? "página" : "páginas"})
        </button>
      </div>
    </main>
  );
}
