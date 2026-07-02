export type MediaUploadResult = {
  id: string;
  publicUrl: string;
  storagePath?: string;
};

export type UploadProgressUpdate = {
  loaded: number;
  total: number;
  percent: number;
};

export function uploadMediaWithProgress(
  formData: FormData,
  onProgress?: (progress: UploadProgressUpdate) => void,
): Promise<MediaUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;

      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: Math.min(100, Math.round((event.loaded / event.total) * 100)),
      });
    });

    xhr.addEventListener("load", () => {
      let body: MediaUploadResult & { error?: string };

      try {
        body = JSON.parse(xhr.responseText) as MediaUploadResult & {
          error?: string;
        };
      } catch {
        reject(new Error("Upload failed."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
        return;
      }

      reject(new Error(body.error ?? "Upload failed."));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    xhr.send(formData);
  });
}
