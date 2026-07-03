import path from "node:path";

export function resolveTemplatePath(templatePath: string) {
  if (path.isAbsolute(templatePath)) {
    return templatePath;
  }

  if (templatePath.startsWith("/")) {
    return path.join(process.cwd(), "public", templatePath.replace(/^\//, ""));
  }

  if (templatePath.startsWith("public/")) {
    return path.join(process.cwd(), templatePath);
  }

  return path.join(process.cwd(), templatePath);
}
