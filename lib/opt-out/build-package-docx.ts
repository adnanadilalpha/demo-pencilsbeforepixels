import "server-only";

import { readFile } from "node:fs/promises";
import { fillFormBDocx } from "@/lib/opt-out/fill-form-b-docx";
import { fillCoverDocx } from "@/lib/opt-out/fill-cover-docx";
import { mergeDocxBuffers } from "@/lib/opt-out/merge-docx";
import { resolveTemplatePath } from "@/lib/opt-out/template-path";
import type { OptOutFormConfig, OptOutLetterForm } from "@/lib/opt-out/types";

export { packageFilename } from "@/lib/opt-out/filenames";

export type OptOutPackagePartKind = "cover" | "formB" | "essay";

export type OptOutPackagePart = {
  kind: OptOutPackagePartKind;
  buffer: Buffer;
};

/** Cover → Form B → Essay, each as its own filled template buffer. */
export async function buildOptOutPackageParts(
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<OptOutPackagePart[]> {
  const formB = await fillFormBDocx(
    config.formBTemplatePath,
    form,
    config.defaultAnswers,
  );
  const essay = await readFile(resolveTemplatePath(config.essayTemplatePath));
  const cover = await fillCoverDocx(config.coverTemplatePath, {
    schoolName: form.schoolName,
    principalName: form.principalName,
    principalEmail: form.principalEmail,
  });

  return [
    { kind: "cover", buffer: cover },
    { kind: "formB", buffer: formB },
    { kind: "essay", buffer: essay },
  ];
}

export async function buildOptOutPackageDocx(
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<Buffer> {
  const parts = await buildOptOutPackageParts(form, config);
  return mergeDocxBuffers(parts.map((part) => part.buffer));
}
