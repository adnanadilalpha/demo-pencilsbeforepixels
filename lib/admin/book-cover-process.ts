import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  BOOK_COVER_CANVAS_HEIGHT,
  BOOK_COVER_CANVAS_WIDTH,
  BOOK_COVER_TARGET_FILL,
  DEFAULT_BOOK_COVER_PROCESS,
  type BookCoverProcessOptions,
} from "@/lib/admin/book-cover-spec";

export {
  BOOK_COVER_CANVAS_HEIGHT,
  BOOK_COVER_CANVAS_WIDTH,
  BOOK_COVER_TARGET_FILL,
  DEFAULT_BOOK_COVER_PROCESS,
  type BookCoverProcessOptions,
} from "@/lib/admin/book-cover-spec";

function parseFormFlag(value: FormDataEntryValue | null, defaultValue: boolean) {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "string") {
    if (value === "false" || value === "0") return false;
    if (value === "true" || value === "1") return true;
  }
  return defaultValue;
}

export function parseBookCoverProcessOptions(
  formData: FormData,
  folder: string,
): BookCoverProcessOptions | undefined {
  if (folder !== "library") return undefined;

  return {
    removeBackground: parseFormFlag(formData.get("bookCoverRemoveBg"), false),
    resizeToCanvas: parseFormFlag(formData.get("bookCoverResize"), true),
  };
}

type Rgb = { r: number; g: number; b: number; a: number };

function readPixel(data: Buffer, width: number, x: number, y: number): Rgb {
  const offset = (y * width + x) * 4;
  return {
    r: data[offset]!,
    g: data[offset + 1]!,
    b: data[offset + 2]!,
    a: data[offset + 3]!,
  };
}

function writeAlpha(data: Buffer, width: number, x: number, y: number, alpha: number) {
  data[(y * width + x) * 4 + 3] = alpha;
}

function colorDistance(a: Rgb, b: Pick<Rgb, "r" | "g" | "b">) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function sampleEdgeBackground(
  data: Buffer,
  width: number,
  height: number,
): Rgb {
  const samples: Rgb[] = [];

  const collect = (x: number, y: number) => {
    const pixel = readPixel(data, width, x, y);
    if (pixel.a < 12) return;
    samples.push(pixel);
  };

  for (let x = 0; x < width; x++) {
    collect(x, 0);
    collect(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    collect(0, y);
    collect(width - 1, y);
  }

  if (samples.length === 0) {
    return { r: 255, g: 255, b: 255, a: 255 };
  }

  samples.sort(
    (a, b) =>
      0.2126 * a.r +
      0.7152 * a.g +
      0.0722 * a.b -
      (0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b),
  );

  const mid = samples[Math.floor(samples.length / 2)]!;
  return { r: mid.r, g: mid.g, b: mid.b, a: 255 };
}

function matchesBorderColor(pixel: Rgb, border: Rgb, tolerance: number) {
  if (pixel.a < 12) return true;
  return colorDistance(pixel, border) <= tolerance;
}

/** Strip margin on each scanline without touching interior content. */
function scanlineStripBackground(
  data: Buffer,
  width: number,
  height: number,
  border: Rgb,
  tolerance: number,
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!matchesBorderColor(readPixel(data, width, x, y), border, tolerance)) break;
      writeAlpha(data, width, x, y, 0);
    }
    for (let x = width - 1; x >= 0; x--) {
      if (!matchesBorderColor(readPixel(data, width, x, y), border, tolerance)) break;
      writeAlpha(data, width, x, y, 0);
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (!matchesBorderColor(readPixel(data, width, x, y), border, tolerance)) break;
      writeAlpha(data, width, x, y, 0);
    }
    for (let y = height - 1; y >= 0; y--) {
      if (!matchesBorderColor(readPixel(data, width, x, y), border, tolerance)) break;
      writeAlpha(data, width, x, y, 0);
    }
  }
}

function floodRemoveEdgeBackground(
  data: Buffer,
  width: number,
  height: number,
  border: Rgb,
  tolerance: number,
) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const index = (x: number, y: number) => y * width + x;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = index(x, y);
    if (visited[idx]) return;
    if (!matchesBorderColor(readPixel(data, width, x, y), border, tolerance)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    data[idx * 4 + 3] = 0;

    const x = idx % width;
    const y = Math.floor(idx / width);
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

function pixelLuminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pixelSaturation(r: number, g: number, b: number) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

const NEIGHBORS8 = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

/** Light / gray spill left from anti-aliased white or black margins. */
function isBackgroundSpill(r: number, g: number, b: number, border: Rgb) {
  const lum = pixelLuminance(r, g, b);
  const sat = pixelSaturation(r, g, b);

  if (colorDistance({ r, g, b, a: 255 }, border) <= 62) return true;
  if (lum > 165 && sat < 55) return true;
  if (lum > 140 && sat < 24) return true;

  return false;
}

function touchesTransparency(
  data: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  for (const [dx, dy] of NEIGHBORS8) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
    if (readPixel(data, width, nx, ny).a < 20) return true;
  }
  return false;
}

/** Remove white/gray halos and decontaminate edge pixels after background strip. */
function cleanupWhiteMatteFringe(
  data: Buffer,
  width: number,
  height: number,
  border: Rgb,
) {
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = readPixel(data, width, x, y);
        if (pixel.a < 8) continue;
        if (!isBackgroundSpill(pixel.r, pixel.g, pixel.b, border)) continue;

        if (pixel.a < 252 || touchesTransparency(data, width, height, x, y)) {
          writeAlpha(data, width, x, y, 0);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3]!;
      if (alpha === 0 || alpha === 255) continue;

      const r = data[offset]!;
      const g = data[offset + 1]!;
      const b = data[offset + 2]!;
      if (!isBackgroundSpill(r, g, b, border) && alpha > 64) continue;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let weight = 0;

      for (const [dx, dy] of NEIGHBORS8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const neighbor = readPixel(data, width, nx, ny);
        if (neighbor.a < 180) continue;
        if (isBackgroundSpill(neighbor.r, neighbor.g, neighbor.b, border)) continue;

        rSum += neighbor.r * neighbor.a;
        gSum += neighbor.g * neighbor.a;
        bSum += neighbor.b * neighbor.a;
        weight += neighbor.a;
      }

      if (weight > 0) {
        data[offset] = Math.round(rSum / weight);
        data[offset + 1] = Math.round(gSum / weight);
        data[offset + 2] = Math.round(bSum / weight);
        if (isBackgroundSpill(data[offset]!, data[offset + 1]!, data[offset + 2]!, border)) {
          data[offset + 3] = 0;
        }
      } else {
        data[offset + 3] = 0;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = readPixel(data, width, x, y);
      if (pixel.a === 0) continue;
      if (
        isBackgroundSpill(pixel.r, pixel.g, pixel.b, border) &&
        touchesTransparency(data, width, height, x, y)
      ) {
        writeAlpha(data, width, x, y, 0);
      }
    }
  }
}

async function polishMatteFringe(buffer: Buffer, border?: Rgb) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const spillBorder =
    border ?? sampleEdgeBackground(data, info.width, info.height);
  cleanupWhiteMatteFringe(data, info.width, info.height, spillBorder);

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

function rawBufferToPng(
  data: Buffer,
  width: number,
  height: number,
) {
  return sharp(data, {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();
}

async function removeLetterboxBackground(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const border = sampleEdgeBackground(data, info.width, info.height);

  for (const tolerance of [32, 44, 54]) {
    scanlineStripBackground(data, info.width, info.height, border, tolerance);
    floodRemoveEdgeBackground(data, info.width, info.height, border, tolerance);
  }

  cleanupWhiteMatteFringe(data, info.width, info.height, border);

  let current = await rawBufferToPng(data, info.width, info.height);
  current = await polishMatteFringe(current, border);

  for (const threshold of [32, 42, 52]) {
    try {
      current = await sharp(current)
        .trim({
          background: {
            r: border.r,
            g: border.g,
            b: border.b,
            alpha: border.a,
          },
          threshold,
        })
        .png()
        .toBuffer();
    } catch {
      break;
    }
  }

  return current;
}

async function trimTransparentEdges(buffer: Buffer) {
  try {
    return await sharp(buffer).trim({ threshold: 12 }).png().toBuffer();
  } catch {
    return buffer;
  }
}

async function fitBookCoverToCanvas(buffer: Buffer) {
  const trimmed = await trimTransparentEdges(buffer);
  const meta = await sharp(trimmed).metadata();
  const sourceWidth = meta.width ?? 1;
  const sourceHeight = meta.height ?? 1;

  const maxWidth = Math.round(BOOK_COVER_CANVAS_WIDTH * BOOK_COVER_TARGET_FILL);
  const maxHeight = Math.round(BOOK_COVER_CANVAS_HEIGHT * BOOK_COVER_TARGET_FILL);
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);

  const resized = await sharp(trimmed)
    .resize({
      width: Math.max(1, Math.round(sourceWidth * scale)),
      height: Math.max(1, Math.round(sourceHeight * scale)),
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: BOOK_COVER_CANVAS_WIDTH,
      height: BOOK_COVER_CANVAS_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9, effort: 7 })
    .toBuffer();
}

export async function normalizeBookCoverImage(
  buffer: Buffer,
  options: BookCoverProcessOptions = DEFAULT_BOOK_COVER_PROCESS,
): Promise<Buffer> {
  const removeBackground =
    options.removeBackground ?? DEFAULT_BOOK_COVER_PROCESS.removeBackground;
  const resizeToCanvas =
    options.resizeToCanvas ?? DEFAULT_BOOK_COVER_PROCESS.resizeToCanvas;

  let current = await sharp(buffer).rotate().ensureAlpha().png().toBuffer();

  if (removeBackground) {
    current = Buffer.from(await removeLetterboxBackground(current));
  }

  current = Buffer.from(await trimTransparentEdges(current));

  if (resizeToCanvas) {
    current = Buffer.from(await fitBookCoverToCanvas(current));
    if (removeBackground) {
      current = Buffer.from(await polishMatteFringe(current));
    }
  } else {
    current = Buffer.from(
      await sharp(current).png({ compressionLevel: 9, effort: 7 }).toBuffer(),
    );
  }

  return current;
}

export async function readImageBytesFromUrl(url: string): Promise<Buffer> {
  const trimmed = url.trim();

  if (trimmed.startsWith("/")) {
    return readFile(join(process.cwd(), "public", trimmed));
  }

  const response = await fetch(trimmed);
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
}
