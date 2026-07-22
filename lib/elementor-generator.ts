import type { PageSection, ProjectState } from "./types";
import { optimizedUrl } from "./cloudinary";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomId(): number {
  return Math.floor(1000000000 + Math.random() * 8999999999);
}

const ZERO_SPACING = {
  unit: "px",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  isLinked: false,
};

function px(size: number) {
  return { unit: "px", size };
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

function buildButtonWidget(text: string, link: string) {
  return {
    id: randomId(),
    elType: "widget",
    widgetType: "button",
    settings: {
      text,
      align: "center",
      link: { url: link || "#", is_external: "", nofollow: "" },
      background_color: "#000000",
      button_text_color: "#ffffff",
      border_radius: { unit: "px", top: "6", right: "6", bottom: "6", left: "6", isLinked: true },
    },
    elements: [],
    isInner: false,
  };
}

function buildWhatsappWidget(link: string) {
  const html = `<a href="${link}" target="_blank" rel="noopener" class="wa-float">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
</a>
<style>
.wa-float{position:fixed;right:20px;bottom:20px;width:56px;height:56px;z-index:999;display:block;}
.wa-float img{width:100%;height:100%;}
</style>`;
  return {
    id: randomId(),
    elType: "widget",
    widgetType: "html",
    settings: { html },
    elements: [],
    isInner: false,
  };
}

// ---------------------------------------------------------------------------
// Container por página/dispositivo (background nativo, no <img>/<video> crudo)
// ---------------------------------------------------------------------------

function buildDeviceContainer(
  page: PageSection,
  device: "mobile" | "desktop",
  quality: number
) {
  const asset = device === "mobile" ? page.mobile : page.desktop;
  if (!asset) return null;

  const settings: Record<string, unknown> = {
    content_width: "full",
    flex_direction: "column",
    flex_justify_content: "flex-end",
    flex_align_items: "center",
    padding: { ...ZERO_SPACING, bottom: "40" },
    padding_mobile: { ...ZERO_SPACING, bottom: "24" },
    margin: ZERO_SPACING,
    margin_mobile: ZERO_SPACING,
  };

  if (asset.type === "image") {
    settings.background_background = "classic";
    settings.background_image = { url: optimizedUrl(asset.url, quality), id: "" };
    settings.background_position = "center center";
    settings.background_size = "cover";
    settings.background_repeat = "no-repeat";
  } else {
    settings.background_background = "video";
    settings.background_video_link = asset.url;
    settings.background_play_on_mobile = "yes";
    settings.background_privacy_mode = "yes";
  }

  if (device === "mobile") {
    settings.hide_desktop = "hidden-desktop";
  } else {
    settings.hide_mobile = "hidden-mobile";
  }

  const elements = [];
  if (page.addButton && page.buttonText) {
    elements.push(buildButtonWidget(page.buttonText, page.buttonLink));
  }

  return {
    id: randomId(),
    elType: "container",
    settings,
    elements,
    isInner: false,
  };
}

// ---------------------------------------------------------------------------
// Documento completo
// ---------------------------------------------------------------------------

export function generateElementorJSON(project: ProjectState) {
  const content: unknown[] = [];

  const sortedPages = [...project.pages].sort((a, b) => a.order - b.order);

  for (const page of sortedPages) {
    const mobileContainer = buildDeviceContainer(page, "mobile", project.qualityMobile);
    const desktopContainer = buildDeviceContainer(page, "desktop", project.qualityDesktop);
    if (mobileContainer) content.push(mobileContainer);
    if (desktopContainer) content.push(desktopContainer);
  }

  if (project.whatsappLink) {
    content.push({
      id: randomId(),
      elType: "container",
      settings: { padding: ZERO_SPACING, margin: ZERO_SPACING },
      elements: [buildWhatsappWidget(project.whatsappLink)],
      isInner: false,
    });
  }

  return {
    version: "0.4",
    title: project.title || "Landing Page",
    type: "page",
    content,
    page_settings: {},
  };
}

export function downloadElementorJSON(project: ProjectState) {
  const json = generateElementorJSON(project);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = (project.title || "landing-page")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  a.href = url;
  a.download = `${slug || "landing-page"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
