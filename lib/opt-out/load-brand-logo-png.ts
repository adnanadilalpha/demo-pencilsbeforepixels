import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { BRAND_LOGO_DARK_FALLBACK } from "@/lib/admin/settings/brand-media";
import { fetchAdminBrandLogoDarkUrl } from "@/lib/admin/settings/fetch";

const MAX_LOGO_WIDTH_PX = 1200;

let cachedLogoPng: Buffer | null = null;
let cachedLogoSource = "";

function isSvgBuffer(buffer: Buffer) {
  const head = buffer.subarray(0, 256).toString("utf8").trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

async function readLogoSource(url: string): Promise<Buffer> {
  const trimmed = url.trim();

  if (trimmed.startsWith("/")) {
    return readFile(join(process.cwd(), "public", trimmed));
  }

  try {
    const parsed = new URL(trimmed);
    const isLocalhost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1";

    if (isLocalhost && parsed.pathname.startsWith("/")) {
      const localPath = join(process.cwd(), "public", parsed.pathname);
      return readFile(localPath);
    }
  } catch {
    // Fall through to remote fetch.
  }

  const response = await fetch(trimmed, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Failed to fetch brand logo (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Rasterize an SVG directly at the target output width. Rendering at high
 * density and downscaling later can produce a 60+ megapixel intermediate for
 * large artboards, which takes minutes of CPU.
 */
async function rasterizeSvgAtTargetWidth(svg: Buffer): Promise<Buffer> {
  const metadata = await sharp(svg).metadata();
  const svgWidth = metadata.width && metadata.width > 0 ? metadata.width : MAX_LOGO_WIDTH_PX;
  const density = Math.max(1, Math.min(300, (72 * MAX_LOGO_WIDTH_PX) / svgWidth));

  return sharp(svg, { density })
    .resize({ width: MAX_LOGO_WIDTH_PX, withoutEnlargement: true })
    .png()
    .toBuffer();
}

async function rasterizeLogo(source: Buffer): Promise<Buffer> {
  if (isSvgBuffer(source)) {
    const svgText = source.toString("utf8");
    const hrefMatch = svgText.match(/(?:href|xlink:href)="([^"]+)"/);
    const nestedHref = hrefMatch?.[1]?.trim();

    if (nestedHref?.startsWith("/")) {
      source = await readFile(join(process.cwd(), "public", nestedHref));
    } else {
      return rasterizeSvgAtTargetWidth(source);
    }
  }

  return sharp(source)
    .resize({ width: MAX_LOGO_WIDTH_PX, withoutEnlargement: true })
    .png()
    .toBuffer();
}

/** Solid brand logo from admin settings, rasterized for DOCX/PDF embedding. */
export async function loadBrandLogoDarkPng(): Promise<Buffer> {
  let url = BRAND_LOGO_DARK_FALLBACK;
  try {
    url = await fetchAdminBrandLogoDarkUrl();
  } catch {
    // Use bundled fallback when settings are unavailable.
  }

  if (cachedLogoPng && cachedLogoSource === url) {
    return cachedLogoPng;
  }

  cachedLogoPng = await rasterizeLogo(await readLogoSource(url));
  cachedLogoSource = url;

  return cachedLogoPng;
}
