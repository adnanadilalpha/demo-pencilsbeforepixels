import "server-only";

import PizZip from "pizzip";

const DEFAULT_ENTRY_REGEX =
  /<Default[^>]*Extension="([^"]+)"[^>]*\/>/g;
const OVERRIDE_ENTRY_REGEX =
  /<Override[^>]*PartName="([^"]+)"[^>]*\/>/g;

function mergeContentTypes(baseXml: string, partXml: string) {
  let merged = baseXml;
  const existingDefaults = new Set(
    [...baseXml.matchAll(DEFAULT_ENTRY_REGEX)].map((match) => match[1]),
  );
  const existingOverrides = new Set(
    [...baseXml.matchAll(OVERRIDE_ENTRY_REGEX)].map((match) => match[1]),
  );

  for (const match of partXml.matchAll(DEFAULT_ENTRY_REGEX)) {
    const extension = match[1];
    if (existingDefaults.has(extension)) continue;

    merged = merged.replace("</Types>", `${match[0]}</Types>`);
    existingDefaults.add(extension);
  }

  for (const match of partXml.matchAll(OVERRIDE_ENTRY_REGEX)) {
    const partName = match[1];
    if (existingOverrides.has(partName)) continue;

    merged = merged.replace("</Types>", `${match[0]}</Types>`);
    existingOverrides.add(partName);
  }

  return merged;
}

function ensureImageContentTypes(contentTypesXml: string) {
  let next = contentTypesXml;

  if (!next.includes('Extension="png"')) {
    next = next.replace(
      "</Types>",
      '<Default Extension="png" ContentType="image/png"/></Types>',
    );
  }

  if (!next.includes('Extension="jpeg"')) {
    next = next.replace(
      "</Types>",
      '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>',
    );
  }

  if (!next.includes('Extension="jpg"')) {
    next = next.replace(
      "</Types>",
      '<Default Extension="jpg" ContentType="image/jpeg"/></Types>',
    );
  }

  return next;
}

/** Copy theme, fonts, settings, and content types needed to preserve part formatting. */
export function copyPartPackageAssets(baseZip: PizZip, partZip: PizZip) {
  const baseContentTypes =
    baseZip.file("[Content_Types].xml")?.asText() ??
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>';
  const partContentTypes = partZip.file("[Content_Types].xml")?.asText() ?? baseContentTypes;

  let mergedContentTypes = mergeContentTypes(baseContentTypes, partContentTypes);
  mergedContentTypes = ensureImageContentTypes(mergedContentTypes);
  baseZip.file("[Content_Types].xml", mergedContentTypes);

  for (const [path, file] of Object.entries(partZip.files)) {
    if (file.dir) continue;
    if (!path.startsWith("word/")) continue;
    if (path === "word/document.xml") continue;
    if (path.startsWith("word/_rels/document.xml.rels")) continue;
    if (path.startsWith("word/media/")) continue;
    if (baseZip.files[path]) continue;

    baseZip.file(path, file.asNodeBuffer());
  }
}
