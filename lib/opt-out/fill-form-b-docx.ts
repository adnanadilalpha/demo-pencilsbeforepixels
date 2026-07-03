import "server-only";

import { renderFormBDocx } from "@/lib/opt-out/render-form-b-docx";
import type { OptOutDefaultAnswers, OptOutLetterForm } from "@/lib/opt-out/types";

/** Code-built Form B DOCX — same layout engine as the PDF renderer. */
export async function fillFormBDocx(
  _templatePath: string,
  form: OptOutLetterForm,
  answers: OptOutDefaultAnswers,
): Promise<Buffer> {
  return renderFormBDocx(form, answers);
}
