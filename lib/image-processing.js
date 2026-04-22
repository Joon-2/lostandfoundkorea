const HEIC_MIME = new Set(["image/heic", "image/heif"]);
const HEIC_EXT = /\.(heic|heif)$/i;

function isHeic(file) {
  return HEIC_MIME.has(file.type) || HEIC_EXT.test(file.name || "");
}

async function loadImage(blob) {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Could not decode image in the browser"));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function compressToJpeg(blob, maxSide, quality) {
  const img = await loadImage(blob);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  // white background so transparent PNGs don't go black in JPEG
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas encode failed"))),
      "image/jpeg",
      quality
    );
  });
}

export async function processImage(file, onStatus = () => {}) {
  let working = file;

  if (isHeic(file)) {
    onStatus("Converting iPhone photo…");
    const mod = await import("heic2any");
    const converted = await mod.default({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    working = Array.isArray(converted) ? converted[0] : converted;
  }

  onStatus("Compressing…");
  let out = await compressToJpeg(working, 1200, 0.7);
  if (out.size > 1024 * 1024) {
    out = await compressToJpeg(working, 800, 0.5);
  }
  return out;
}
