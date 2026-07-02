export type LibraryFileKind =
  | "pdf"
  | "word"
  | "powerpoint"
  | "spreadsheet"
  | "document"
  | "other";

export function inferLibraryFileKind(
  mimeType: string | null | undefined,
  url: string | null | undefined,
): LibraryFileKind {
  const mime = (mimeType ?? "").toLowerCase();

  if (mime.includes("pdf")) return "pdf";
  if (
    mime.includes("word") ||
    mime.includes("msword") ||
    mime.includes("wordprocessing")
  ) {
    return "word";
  }
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    mime.includes("ms-powerpoint")
  ) {
    return "powerpoint";
  }
  if (
    mime.includes("sheet") ||
    mime.includes("excel") ||
    mime.includes("spreadsheet")
  ) {
    return "spreadsheet";
  }

  const extension = url?.split("/").pop()?.split("?")[0]?.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";
  if (extension && ["doc", "docx"].includes(extension)) return "word";
  if (extension && ["ppt", "pptx"].includes(extension)) return "powerpoint";
  if (extension && ["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
  if (extension && ["txt", "rtf", "odt"].includes(extension)) return "document";

  if (mime.startsWith("application/") || mime.startsWith("text/")) {
    return "document";
  }

  return "other";
}

export function libraryFileKindLabel(kind: LibraryFileKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "word":
      return "DOC";
    case "powerpoint":
      return "PPT";
    case "spreadsheet":
      return "XLS";
    case "document":
      return "FILE";
    default:
      return "FILE";
  }
}

export function fileNameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const segment = url.split("/").pop()?.split("?")[0];
  return segment || null;
}

export function isPdfFile(
  kind: LibraryFileKind | null | undefined,
  mimeType?: string | null,
): boolean {
  if (kind === "pdf") return true;
  return (mimeType ?? "").toLowerCase().includes("pdf");
}
