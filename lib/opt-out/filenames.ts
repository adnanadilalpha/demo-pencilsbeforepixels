export function packageFilename(studentName: string, extension: "pdf") {
  const slug =
    studentName.trim().replace(/\s+/g, "-").toLowerCase() || "student";
  return `westside-form-b-opt-out-${slug}.${extension}`;
}
