import type { PageSection, ProjectState, ButtonConfig } from "./types";
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

function buildButtonWidget(buttonConfig: ButtonConfig) {
  if (!buttonConfig.enabled) return null;

  return {
    id: randomId(),
    elType: "widget",
    widgetType: "button",
    settings: {
      text: buttonConfig.text,
      align: "center",
      link: { url: buttonConfig.link || "#", is_external: "", nofollow: "" },
      background_color: buttonConfig.bgColor,
      button_text_color: buttonConfig.textColor,
      border_color: buttonConfig.borderColor,
      border_width: { unit: "px", size: "2" },
      border_radius: { unit: "px", top: "25", right: "25", bottom: "25", left: "25", isLinked: true },
      button_shadow_box_shadow_type: "yes",
      button_shadow_box_shadow: {
        horizontal: 0,
        vertical: Math.round(buttonConfig.shadowIntensity / 20),
        blur: Math.round(buttonConfig.shadowIntensity / 10),
        spread: 0,
        color: `rgba(0,0,0,${buttonConfig.shadowTransparency / 100})`,
      },
      _margin: {
        unit: "px",
        top: `${buttonConfig.positionY}%`,
        right: "auto",
        bottom: "auto",
        left: `${buttonConfig.positionX}%`,
        isLinked: false,
      },
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
// Container por página/dispositivo
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
    width: { unit: "%", size: "100" },
    height: device === "mobile" ? { unit: "px", size: "700" } : { unit: "px", size: "1120" },
    background_background: "classic",
    background_color: "#000000",
    padding: ZERO_SPACING,
    margin: ZERO_SPACING,
  };

  if (asset.type === "image") {
    settings.background_image = {
      id: 0,
      url: optimizedUrl(asset.url, quality),
    };
    settings.background_size = "cover";
    settings.background_position = "center center";
  } else if (asset.type === "video") {
    settings.background_video_link = asset.url;
  }

  const elements: unknown[] = [];

  const buttonWidget = buildButtonWidget(page.button);
  if (buttonWidget) {
    elements.push(buttonWidget);
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
      elType: "widget",
      widgetType: "html",
      settings: {},
      elements: [buildWhatsappWidget(project.whatsappLink)],
      isInner: false,
    });
  }

  return {
    version: "1.0.0",
    title: project.title,
    type: "page",
    content,
  };
}

export function downloadElementorJSON(project: ProjectState) {
  const json = generateElementorJSON(project);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.title.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
