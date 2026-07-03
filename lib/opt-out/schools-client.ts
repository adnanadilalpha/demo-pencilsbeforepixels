import type { OptOutSchool } from "@/lib/opt-out/types";

export async function fetchOptOutSchools(): Promise<OptOutSchool[]> {
  const response = await fetch("/api/opt-out/schools", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load schools");
  }

  const body = (await response.json()) as { schools: OptOutSchool[] };
  return body.schools;
}
