import "server-only";

import { buildOptOutPackageParts } from "@/lib/opt-out/build-package-docx";
import { buildOptOutPackagePdfFromParts } from "@/lib/opt-out/build-package-pdf";
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
  const pdf = await buildOptOutPackagePdfFromParts(parts, letter, config);

  return {
    pdf: pdf.toString("base64"),
  };
}

export function readCachedOptOutPackage(
  cached: OptOutCachedPackages | undefined,
): Buffer | null {
  if (!cached?.pdf) return null;

  return Buffer.from(cached.pdf, "base64");
}

export function areOptOutPackagesReady(
  cached: OptOutCachedPackages | undefined,
): boolean {
  return Boolean(cached?.pdf);
}
