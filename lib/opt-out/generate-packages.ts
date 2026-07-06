import "server-only";

import { buildOptOutPackageParts } from "@/lib/opt-out/build-package-docx";
import { buildOptOutPackagePdfFromParts } from "@/lib/opt-out/build-package-pdf";
import { mergeDocxBuffers } from "@/lib/opt-out/merge-docx";
import type {
  OptOutCachedPackages,
  OptOutFormConfig,
  OptOutLetterForm,
} from "@/lib/opt-out/types";

export async function generateOptOutPackages(
  letter: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<OptOutCachedPackages> {
  const parts = await buildOptOutPackageParts(letter, config);
  const docx = mergeDocxBuffers(parts.map((part) => part.buffer));
  const pdf = await buildOptOutPackagePdfFromParts(parts, letter, config);

  return {
    docx: docx.toString("base64"),
    pdf: pdf.toString("base64"),
  };
}

export function readCachedOptOutPackage(
  cached: OptOutCachedPackages | undefined,
  format: "pdf" | "docx",
): Buffer | null {
  const encoded = format === "pdf" ? cached?.pdf : cached?.docx;
  if (!encoded) return null;

  return Buffer.from(encoded, "base64");
}

export function areOptOutPackagesReady(
  cached: OptOutCachedPackages | undefined,
): boolean {
  return Boolean(cached?.pdf && cached?.docx);
}
