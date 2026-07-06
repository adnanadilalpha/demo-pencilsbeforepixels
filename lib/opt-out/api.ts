import type { OptOutLetterForm } from "./types";

export type OptOutSubmissionResult = {
  id: string;
  downloadToken: string;
};

const DOWNLOAD_TIMEOUT_MS = 30_000;

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
    throw new Error(body.error ?? "Failed to generate form package");
  }

  const body = (await response.json()) as {
    id?: string;
    downloadToken?: string;
  };

  if (!body.id || !body.downloadToken) {
    throw new Error("The server did not return a download link. Please try again.");
  }

  return {
    id: body.id,
    downloadToken: body.downloadToken,
  };
}

export async function trackOptOutDownload(
  id: string,
  downloadToken: string,
): Promise<void> {
  const response = await fetch(`/api/opt-out/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "download", downloadToken }),
  });

  if (!response.ok) {
    console.warn("Failed to track opt-out download");
  }
}

async function readDownloadError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    return body.error ?? `Download failed (${response.status})`;
  }

  return `Download failed (${response.status})`;
}

export async function downloadOptOutPdf(
  id: string,
  filename: string,
  downloadToken: string,
) {
  const params = new URLSearchParams({ token: downloadToken });
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`/api/opt-out/${id}/pdf?${params.toString()}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Download timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(await readDownloadError(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
