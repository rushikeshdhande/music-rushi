const FALLBACK = "#ffffff";

export function extractAlbumColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(defaultTheme());

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(defaultTheme());
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        const color = pickDominant(data);
        resolve(buildTheme(color));
      } catch {
        resolve(defaultTheme());
      }
    };

    img.onerror = () => resolve(defaultTheme());
  });
}

function pickDominant(pixelData) {
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < pixelData.length; i += 4) {
    const R = pixelData[i], G = pixelData[i + 1], B = pixelData[i + 2], A = pixelData[i + 3];
    if (A < 128) continue;
    const brightness = (R * 299 + G * 587 + B * 114) / 1000;
    if (brightness > 240 || brightness < 20) continue;
    r += R; g += G; b += B; count++;
  }
  if (count === 0) return { r: 40, g: 40, b: 40 };
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

function buildTheme({ r, g, b }) {
  const blend = (c1, c2, alpha) => {
    const R = Math.round(c1.r * alpha + c2.r * (1 - alpha));
    const G = Math.round(c1.g * alpha + c2.g * (1 - alpha));
    const B = Math.round(c1.b * alpha + c2.b * (1 - alpha));
    return { r: R, g: G, b: B };
  };

  const base = { r, g, b };
  const black = { r: 15, g: 15, b: 18 };

  const primaryRgb = blend(base, black, 0.55);
  const secondaryRgb = blend(base, black, 0.85);
  const subtleRgb = blend(base, black, 0.35);
  const toCss = (c) => `rgb(${c.r},${c.g},${c.b})`;

  return {
    primary: toCss(primaryRgb),
    secondary: toCss(secondaryRgb),
    subtle: toCss(subtleRgb),
    accent: `rgb(${r},${g},${b})`,
    text: pickTextColor(primaryRgb),
    textMuted: "rgba(255,255,255,0.7)",
  };
}

function pickTextColor({ r, g, b }) {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "#111" : "#ffffff";
}

function defaultTheme() {
  return {
    primary: FALLBACK,
    secondary: "#fafafa",
    subtle: "#f0f0f0",
    accent: "#f92c47",
    text: "#111",
    textMuted: "rgba(0,0,0,0.7)",
  };
}

export function applyAlbumTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--album-primary", theme.primary);
  root.style.setProperty("--album-secondary", theme.secondary);
  root.style.setProperty("--album-subtle", theme.subtle);
  root.style.setProperty("--album-accent", theme.accent);
  root.style.setProperty("--album-text", theme.text);
  root.style.setProperty("--album-text-muted", theme.textMuted);
  root.classList.add("album-theme-active");
}

export function clearAlbumTheme() {
  const root = document.documentElement;
  for (const p of [
    "--album-primary", "--album-secondary", "--album-subtle",
    "--album-accent", "--album-text", "--album-text-muted",
  ]) root.style.removeProperty(p);
  root.classList.remove("album-theme-active");
}