"use client";

import {
  clearEvidenceCache,
  readCachedEvidenceBootstrap,
  readCachedEvidenceVersion,
  readCachedLookups,
  readCachedPanel,
  writeCachedEvidenceBootstrap,
  writeCachedLookups,
  writeCachedPanel,
} from "@/lib/evidence/cache";
import type {
  DistrictOption,
  EvidenceBootstrap,
  EvidencePanelResponse,
  EvidenceSubject,
  EvidenceTab,
  EvidenceVersion,
} from "@/lib/evidence/types";

export async function fetchEvidenceVersion(): Promise<EvidenceVersion> {
  const res = await fetch("/api/evidence/version", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch evidence version");
  return res.json() as Promise<EvidenceVersion>;
}

export async function fetchEvidenceBootstrap(): Promise<EvidenceBootstrap> {
  const res = await fetch("/api/evidence/bootstrap", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch evidence bootstrap");
  return res.json() as Promise<EvidenceBootstrap>;
}

export async function getClientEvidenceBootstrap(
  initial: EvidenceBootstrap,
): Promise<EvidenceBootstrap> {
  const remoteVersion = await fetchEvidenceVersion();
  const cachedVersion = readCachedEvidenceVersion();

  if (cachedVersion === remoteVersion.version) {
    const cached = readCachedEvidenceBootstrap();
    if (cached) return cached;
  } else {
    clearEvidenceCache();
  }

  const bundle =
    initial.version === remoteVersion.version
      ? initial
      : await fetchEvidenceBootstrap();

  writeCachedEvidenceBootstrap(bundle, remoteVersion);
  return bundle;
}

export async function fetchCachedDistricts(
  version: string,
  subject: EvidenceSubject,
): Promise<DistrictOption[]> {
  const cached = readCachedLookups(version, "nebraska", subject);
  if (cached?.districts) return cached.districts;

  const res = await fetch(`/api/evidence/districts?subject=${subject}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load districts");
  const districts = (await res.json()) as DistrictOption[];
  writeCachedLookups(version, "nebraska", subject, { districts });
  return districts;
}

export async function fetchCachedSchools(
  version: string,
  subject: EvidenceSubject,
): Promise<DistrictOption[]> {
  const cached = readCachedLookups(version, "district-66", subject);
  if (cached?.schools) return cached.schools;

  const res = await fetch(`/api/evidence/schools?subject=${subject}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load schools");
  const schools = (await res.json()) as DistrictOption[];
  writeCachedLookups(version, "district-66", subject, { schools });
  return schools;
}

export async function fetchCachedSchoolYears(
  version: string,
  subject: EvidenceSubject,
  tab: EvidenceTab,
): Promise<string[]> {
  const cached = readCachedLookups(version, tab, subject);
  if (cached?.schoolYears) return cached.schoolYears;

  const params = new URLSearchParams({ subject, tab });
  const res = await fetch(`/api/evidence/school-years?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load school years");
  const schoolYears = (await res.json()) as string[];
  writeCachedLookups(version, tab, subject, { schoolYears });
  return schoolYears;
}

export async function fetchCachedEvidencePanel(
  version: string,
  params: URLSearchParams,
): Promise<EvidencePanelResponse | null> {
  const cacheKey = params.toString();
  const cached = readCachedPanel(version, cacheKey);
  if (cached) return cached;

  const res = await fetch(`/api/evidence?${cacheKey}`, { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as EvidencePanelResponse;
  writeCachedPanel(version, cacheKey, data);
  return data;
}
