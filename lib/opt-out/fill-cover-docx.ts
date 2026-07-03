import "server-only";

import { readFile } from "node:fs/promises";
import { renderDocxTemplate } from "@/lib/opt-out/docx-templater";
import { resolveTemplatePath } from "@/lib/opt-out/template-path";

type CoverPlaceholders = {
  schoolName: string;
  principalName: string;
  principalEmail: string;
};

export async function fillCoverDocx(
  templatePath: string,
  placeholders: CoverPlaceholders,
): Promise<Buffer> {
  const resolved = resolveTemplatePath(templatePath);
  const template = await readFile(resolved);

  return renderDocxTemplate(template, {
    SchoolName: placeholders.schoolName.trim(),
    PrincipalName: placeholders.principalName.trim(),
    EmailAddress: placeholders.principalEmail.trim(),
  });
}
