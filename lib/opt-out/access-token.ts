import { randomBytes, timingSafeEqual } from "crypto";

export function createOptOutDownloadToken(): string {
  return randomBytes(32).toString("hex");
}

export function verifyOptOutDownloadToken(
  stored: string | undefined,
  provided: string | undefined,
): boolean {
  if (!stored || !provided) return false;
  if (stored.length !== provided.length) return false;

  try {
    return timingSafeEqual(Buffer.from(stored), Buffer.from(provided));
  } catch {
    return false;
  }
}
