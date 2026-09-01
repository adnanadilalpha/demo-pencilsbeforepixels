/** GA-style client identity: persistent visitor + 30-minute inactivity session timeout. */

import { pruneSessionAnalyticsData } from "@/lib/analytics/session-analytics-storage";

export const VISITOR_STORAGE_KEY = "pbp.analytics.visitor";
export const SESSION_STORAGE_KEY = "pbp.analytics.session";
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type StoredSession = {
  id: string;
  visitorId: string;
  startedAt: number;
  lastActivityAt: number;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.visitorId === "string" &&
      typeof parsed.lastActivityAt === "number"
    ) {
      return parsed;
    }
  } catch {
    // ignore corrupt storage
  }

  return null;
}

function writeStoredSession(session: StoredSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // private mode / blocked storage
  }
}

export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;

    const visitorId = createId();
    localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return createId();
  }
}

/** Returns the active session or starts a new one after 30 minutes of inactivity. */
export function getOrRefreshSession(now = Date.now()): StoredSession {
  const visitorId = getVisitorId();
  const existing = readStoredSession();

  if (
    existing &&
    existing.visitorId === visitorId &&
    now - existing.lastActivityAt < SESSION_TIMEOUT_MS
  ) {
    const refreshed = { ...existing, lastActivityAt: now };
    writeStoredSession(refreshed);
    return refreshed;
  }

  if (existing?.id) {
    pruneSessionAnalyticsData(existing.id);
  }

  const session: StoredSession = {
    id: createId(),
    visitorId,
    startedAt: now,
    lastActivityAt: now,
  };
  writeStoredSession(session);
  return session;
}

export function touchSession(now = Date.now()) {
  const session = readStoredSession();
  if (!session) return;
  writeStoredSession({ ...session, lastActivityAt: now });
}
