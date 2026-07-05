import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { fetchAdminBrandLogoDarkUrl } from "@/lib/admin/settings/fetch";

const MAX_LOGO_WIDTH_PX = 1200;

function isSvgBuffer(buffer: Buffer) {
  const head = buffer.subarray(0, 256).toString("utf8").trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

async function readLogoSource(url: string): Promise<Buffer> {
  const trimmed = url.trim();

  if (trimmed.startsWith("/")) {
    return readFile(join(process.cwd(), "public", trimmed));
  }

  const response = await fetch(trimmed);
  if (!response.ok) {
    throw new Error(`Failed to fetch brand logo (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function resolveRasterSource(url: string, source: Buffer): Promise<Buffer> {
  if (!isSvgBuffer(source)) {
    return source;
  }

  const svgText = source.toString("utf8");
  const hrefMatch = svgText.match(/(?:href|xlink:href)="([^"]+)"/);
  const nestedHref = hrefMatch?.[1]?.trim();

  if (nestedHref?.startsWith("/")) {
    return readFile(join(process.cwd(), "public", nestedHref));
  }

  return sharp(source, { density: 300 }).png().toBuffer();
}

/** Solid brand logo from admin settings, rasterized for DOCX/PDF embedding. */
export async function loadBrandLogoDarkPng(): Promise<Buffer> {
  const url = await fetchAdminBrandLogoDarkUrl();
  const source = await resolveRasterSource(url, await readLogoSource(url));

  return sharp(source)
    .resize({ width: MAX_LOGO_WIDTH_PX, withoutEnlargement: true })
    .png()
    .toBuffer();
}
