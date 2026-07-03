export function packageFilename(studentName: string, extension: "pdf" | "docx") {
  const slug =
    studentName.trim().replace(/\s+/g, "-").toLowerCase() || "student";
  return `westside-form-b-opt-out-${slug}.${extension}`;
}
