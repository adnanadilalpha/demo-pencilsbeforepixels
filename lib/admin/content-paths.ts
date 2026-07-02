import type { ResearchChartsData } from "@/lib/research/types";

export function getNestedValue(
  source: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function setNestedValue(
  source: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split(".");
  const next = structuredClone(source);
  let cursor: Record<string, unknown> = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    const existing = cursor[key];
    if (!existing || typeof existing !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }

  cursor[keys[keys.length - 1]] = value;
  return next;
}

export function getResearchFieldValue(
  research: ResearchChartsData,
  path: string,
): unknown {
  if (!path.startsWith("research.")) return undefined;
  return getNestedValue(
    { research: research as unknown as Record<string, unknown> },
    path,
  );
}

export function setResearchFieldValue(
  research: ResearchChartsData,
  path: string,
  value: unknown,
): ResearchChartsData {
  if (!path.startsWith("research.")) return research;
  const next = structuredClone(research) as unknown as Record<string, unknown>;
  const updated = setNestedValue({ research: next }, path, value);
  return updated.research as ResearchChartsData;
}
