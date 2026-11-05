import { saveMedia } from "@/lib/server/store";

function canvasToJpeg(img: CanvasImageSource, width: number, height: number, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function fit(w: number, h: number, max: number) {
  const scale = Math.min(1, max / Math.max(w, h, 1));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

async function fileToDataUrl(file: File): Promise<string> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      const srcW = bmp.width;
      const srcH = bmp.height;
      const a = fit(srcW, srcH, 1200);
      let url = canvasToJpeg(bmp, a.width, a.height, 0.72);
      bmp.close();
      if (url.length > 1_600_000) {
        const bmp2 = await createImageBitmap(file);
        const b = fit(srcW, srcH, 900);
        url = canvasToJpeg(bmp2, b.width, b.height, 0.55);
        bmp2.close();
      }
      return url;
    } catch {
      /* fall through */
    }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not open that photo. Try JPEG or PNG."));
      el.src = objectUrl;
    });
    const a = fit(img.naturalWidth || img.width, img.naturalHeight || img.height, 1200);
    return canvasToJpeg(img, a.width, a.height, 0.72);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function fileToWebpThumb(file: File): Promise<{ dataUrl: string; width: number; height: number } | undefined> {
  let source: CanvasImageSource;
  let width = 0;
  let height = 0;
  let bitmap: ImageBitmap | undefined;
  let objectUrl: string | undefined;

  try {
    if (typeof createImageBitmap === "function") {
      try {
        bitmap = await createImageBitmap(file);
        source = bitmap;
        width = bitmap.width;
        height = bitmap.height;
      } catch {
        bitmap = undefined;
      }
    }

    if (!bitmap) {
      objectUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not open photo."));
        el.src = objectUrl!;
      });
      source = img;
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
    }

    const size = fit(width, height, 480);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.drawImage(source!, 0, 0, size.width, size.height);

    const result = canvas.toDataURL("image/webp", 0.68);
    if (!result.startsWith("data:image/webp;base64,") || result.length > 600_000) {
      return undefined;
    }
    return { dataUrl: result, width: size.width, height: size.height };
  } catch {
    return undefined;
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadStudioPhoto(file: File, includeDimensions = false): Promise<string> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Please choose a photo.");
  }
  const [dataUrl, thumb] = await Promise.all([
    fileToDataUrl(file),
    fileToWebpThumb(file),
  ]);
  if (!dataUrl.startsWith("data:image/")) throw new Error("Could not read that photo.");
  const saved = await saveMedia({ data: { dataUrl, thumbDataUrl: thumb?.dataUrl } });
  if (!saved?.url) throw new Error("Could not store that photo.");
  return includeDimensions && thumb
    ? `${saved.url}?w=${thumb.width}&h=${thumb.height}`
    : saved.url;
}

export async function uploadStudioIcon(file: File): Promise<string> {
  if (file.type && !file.type.startsWith("image/")) throw new Error("Please choose a PNG or photo.");
  if (file.size > 1_400_000) throw new Error("That image is too large. Use a smaller PNG.");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
  if (!dataUrl.startsWith("data:image/")) throw new Error("Could not read that image.");
  const saved = await saveMedia({ data: { dataUrl } });
  if (!saved?.url) throw new Error("Could not store that image.");
  return saved.url;
}
