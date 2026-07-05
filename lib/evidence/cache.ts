"use client";

import { isClientSiteCacheEnabled } from "@/lib/cache/client-state";
import type {
  DistrictOption,
  EvidenceBootstrap,
  EvidencePanelResponse,
  EvidenceVersion,
  StudentGroup,
} from "@/lib/evidence/types";

const VERSION_KEY = "pbp:evidence-version";
const BOOTSTRAP_KEY = "pbp:evidence-bootstrap";
const LOOKUPS_KEY = "pbp:evidence-lookups-v2";
const PANELS_KEY = "pbp:evidence-panels";

type LookupsEntry = {
  districts?: DistrictOption[];
  schools?: DistrictOption[];
  schoolYears?: string[];
};

type LookupsCache = {
  version: string;
  entries: Record<string, LookupsEntry>;
};

type PanelsCache = {
  version: string;
  entries: Record<string, EvidencePanelResponse>;
};

function readJson<T>(key: string): T | null {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function readCachedEvidenceVersion(): string | null {
  if (!isClientSiteCacheEnabled() || typeof window === "undefined") return null;
  return localStorage.getItem(VERSION_KEY);
}

export function readCachedEvidenceBootstrap(): EvidenceBootstrap | null {
  return readJson<EvidenceBootstrap>(BOOTSTRAP_KEY);
}

export function writeCachedEvidenceBootstrap(
  bootstrap: EvidenceBootstrap,
  version: EvidenceVersion,
): void {
  writeJson(BOOTSTRAP_KEY, bootstrap);
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSION_KEY, version.version);
}

export function clearEvidenceCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VERSION_KEY);
  localStorage.removeItem(BOOTSTRAP_KEY);
  localStorage.removeItem(LOOKUPS_KEY);
  localStorage.removeItem(PANELS_KEY);
}

function lookupKey(tab: string, subject: string, studentGroup: StudentGroup = "all") {
  return `${tab}:${subject}:${studentGroup}`;
}

export function readCachedLookups(
  version: string,
  tab: string,
  subject: string,
  studentGroup: StudentGroup = "all",
): LookupsEntry | null {
  const cache = readJson<LookupsCache>(LOOKUPS_KEY);
  if (!cache || cache.version !== version) return null;
  return cache.entries[lookupKey(tab, subject, studentGroup)] ?? null;
}

export function writeCachedLookups(
  version: string,
  tab: string,
  subject: string,
  entry: LookupsEntry,
  studentGroup: StudentGroup = "all",
) {
  const cache = readJson<LookupsCache>(LOOKUPS_KEY);
  const next: LookupsCache =
    cache?.version === version
      ? cache
      : { version, entries: {} };

  const key = lookupKey(tab, subject, studentGroup);
  next.entries[key] = {
    ...next.entries[key],
    ...entry,
  };

  writeJson(LOOKUPS_KEY, next);
}

export function readCachedPanel(
  version: string,
  cacheKey: string,
): EvidencePanelResponse | null {
  const cache = readJson<PanelsCache>(PANELS_KEY);
  if (!cache || cache.version !== version) return null;
  return cache.entries[cacheKey] ?? null;
}

export function writeCachedPanel(
  version: string,
  cacheKey: string,
  panel: EvidencePanelResponse,
) {
  const cache = readJson<PanelsCache>(PANELS_KEY);
  const entries = cache?.version === version ? { ...cache.entries } : {};
  entries[cacheKey] = panel;

  const keys = Object.keys(entries);
  if (keys.length > 40) {
    for (const staleKey of keys.slice(0, keys.length - 40)) {
      delete entries[staleKey];
    }
  }

  writeJson(PANELS_KEY, { version, entries });
}
