export const SIGNATURE_MAX_WIDTH_PT = 200;
export const SIGNATURE_MAX_HEIGHT_PT = 36;
export const SIGNATURE_ROW_HEIGHT_PT = 34;

export function readPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) return null;
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export function fitSignatureDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth = SIGNATURE_MAX_WIDTH_PT,
  maxHeight = SIGNATURE_MAX_HEIGHT_PT,
) {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return { width: maxWidth * 0.55, height: maxHeight * 0.7 };
  }

  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

/** docx ImageRun uses pixel dimensions at 96 DPI. */
export function pointsToDocxImagePixels(points: number) {
  return Math.round((points * 96) / 72);
}

export function signatureImagePixels(png: Buffer) {
  const source = readPngDimensions(png);
  const fitted = fitSignatureDimensions(source?.width ?? 0, source?.height ?? 0);
  return {
    width: pointsToDocxImagePixels(fitted.width),
    height: pointsToDocxImagePixels(fitted.height),
  };
}
