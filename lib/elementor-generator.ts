import type { PageSection, ProjectState, ButtonConfig } from "./types";
import { optimizedUrl } from "./cloudinary";

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function buildMediaWidget(page: PageSection, device: "mobile" | "desktop", quality: number) {
  const asset = device === "mobile" ? page.mobile : page.desktop;
  if (!asset) return null;

  let html = "";

  if (asset.type === "image") {
    const url = optimizedUrl(asset.url, quality);
    html = `<div class="media-container" style="width:100%;height:100%;overflow:hidden;">
  <img src="${url}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
</div>`;
  } else if (asset.type === "video") {
    html = `<div class="media-container" style="width:100%;height:100%;overflow:hidden;background:#000;">
  <video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="${asset.url}" type="video/mp4">
  </video>
</div>`;
  }

  return {
    id: randomId(),
    elType: "widget",
    widgetType: "html",
    settings: {
      html,
    },
    elements: [],
    isInner: false,
  };
}

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
      _position: "absolute",
      _offset_x: { unit: "%", size: buttonConfig.positionX },
      _offset_y: { unit: "%", size: buttonConfig.positionY },
    },
    elements: [],
    isInner: false,
  };
}

function buildPageContainer(page: PageSection, device: "mobile" | "desktop", quality: number) {
  const mediaWidget = buildMediaWidget(page, device, quality);
  if (!mediaWidget) return null;

  const elements: unknown[] = [mediaWidget];

  const buttonWidget = buildButtonWidget(page.button);
  if (buttonWidget) {
    elements.push(buttonWidget);
  }

  const settings: Record<string, unknown> = {
    width: { unit: "%", size: "100" },
    height: device === "mobile" ? { unit: "px", size: "700" } : { unit: "px", size: "1120" },
    padding: {
      unit: "px",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      isLinked: false,
    },
    margin: {
      unit: "px",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      isLinked: false,
    },
  };

  if (device === "desktop") {
    settings.hide_mobile = "hidden-mobile";
  } else {
    settings.hide_desktop = "hidden-desktop";
  }

  return {
    id: randomId(),
    elType: "container",
    settings,
    elements,
    isInner: false,
  };
}

export function generateElementorJSON(project: ProjectState) {
  const content: unknown[] = [];

  const sortedPages = [...project.pages].sort((a, b) => a.order - b.order);

  for (const page of sortedPages) {
    const mobileContainer = buildPageContainer(page, "mobile", project.qualityMobile);
    const desktopContainer = buildPageContainer(page, "desktop", project.qualityDesktop);

    if (mobileContainer) content.push(mobileContainer);
    if (desktopContainer) content.push(desktopContainer);
  }

  return {
    version: "0.4",
    title: project.title || "Landing Page",
    type: "page",
    content,
    page_settings: [],
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
