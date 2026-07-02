import type { OptOutLetterForm } from "./types";

export type OptOutSubmissionResult = {
  id: string;
  downloadToken: string;
};

export async function createOptOutSubmission(
  letter: OptOutLetterForm,
): Promise<OptOutSubmissionResult> {
  const response = await fetch("/api/opt-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to generate letter");
  }

  return (await response.json()) as OptOutSubmissionResult;
}

export async function trackOptOutDownload(
  id: string,
  format: "pdf" | "docx",
  downloadToken: string,
): Promise<void> {
  const response = await fetch(`/api/opt-out/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "download", format, downloadToken }),
  });

  if (!response.ok) {
    console.warn("Failed to track opt-out download");
  }
}

export async function downloadOptOutDocx(
  id: string,
  filename: string,
  downloadToken: string,
) {
  const params = new URLSearchParams({ token: downloadToken });
  const response = await fetch(`/api/opt-out/${id}/docx?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to download DOCX");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
