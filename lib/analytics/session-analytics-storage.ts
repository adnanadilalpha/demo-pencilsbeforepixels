import { capPageViewDuration } from "@/lib/analytics/duration";

/** Client-side analytics maps stored in sessionStorage. */

const SESSION_VIEWS_KEY = "pbp.analytics.session-views";
const SESSION_PATHS_KEY = "pbp.analytics.session-paths";
const VIEW_DURATION_KEY = "pbp.analytics.view-durations";

type SessionViewMap = Record<string, Record<string, string>>;
type SessionPathMap = Record<string, string[]>;
type ViewDurationMap = Record<string, number>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / blocked storage
  }
}

export function getSessionViewId(sessionId: string, path: string): string | null {
  const map = readJson<SessionViewMap>(SESSION_VIEWS_KEY, {});
  return map[sessionId]?.[path] ?? null;
}

export function setSessionViewId(sessionId: string, path: string, viewId: string) {
  const map = readJson<SessionViewMap>(SESSION_VIEWS_KEY, {});
  map[sessionId] = { ...(map[sessionId] ?? {}), [path]: viewId };
  writeJson(SESSION_VIEWS_KEY, map);
}

export function rememberSessionPath(sessionId: string, path: string) {
  const map = readJson<SessionPathMap>(SESSION_PATHS_KEY, {});
  const paths = new Set(map[sessionId] ?? []);
  paths.add(path);
  map[sessionId] = [...paths];
  writeJson(SESSION_PATHS_KEY, map);
}

export function getSessionPathCount(sessionId: string): number {
  const map = readJson<SessionPathMap>(SESSION_PATHS_KEY, {});
  return new Set(map[sessionId] ?? []).size;
}

export function appendViewDuration(viewId: string, segmentSeconds: number): number {
  const map = readJson<ViewDurationMap>(VIEW_DURATION_KEY, {});
  const next = Math.max(0, Math.round(segmentSeconds));
  if (next <= 0) return capPageViewDuration(map[viewId] ?? 0);

  map[viewId] = capPageViewDuration((map[viewId] ?? 0) + next);
  writeJson(VIEW_DURATION_KEY, map);
  return map[viewId];
}

export function getViewDurationTotal(viewId: string): number {
  const map = readJson<ViewDurationMap>(VIEW_DURATION_KEY, {});
  return map[viewId] ?? 0;
}

export function pruneSessionAnalyticsData(sessionId: string) {
  const views = readJson<SessionViewMap>(SESSION_VIEWS_KEY, {});
  const paths = readJson<SessionPathMap>(SESSION_PATHS_KEY, {});
  delete views[sessionId];
  delete paths[sessionId];
  writeJson(SESSION_VIEWS_KEY, views);
  writeJson(SESSION_PATHS_KEY, paths);
}
