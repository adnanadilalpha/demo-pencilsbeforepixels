/** Upper bound for a single page-view segment or stored page duration. */
export const MAX_PAGE_VIEW_DURATION_SECONDS = 30 * 60;

/** Upper bound when summing page durations into a session total. */
export const MAX_SESSION_DURATION_SECONDS = 60 * 60;

/** GA4-style engaged session threshold. */
export const ENGAGED_SESSION_MIN_SECONDS = 10;

export function capPageViewDuration(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(Math.round(seconds), MAX_PAGE_VIEW_DURATION_SECONDS);
}

export function capSessionDuration(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(Math.round(seconds), MAX_SESSION_DURATION_SECONDS);
}

export function getStoredPageViewDuration(view: {
  duration_seconds: number | null;
}): number {
  if (typeof view.duration_seconds === "number" && view.duration_seconds > 0) {
    return capPageViewDuration(view.duration_seconds);
  }

  return 0;
}

export type SessionEngagement = {
  pathCount: number;
  durationSeconds: number;
};

export function isEngagedSession(session: SessionEngagement): boolean {
  return (
    session.pathCount > 1 ||
    session.durationSeconds >= ENGAGED_SESSION_MIN_SECONDS
  );
}
