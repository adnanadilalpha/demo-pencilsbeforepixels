import type { PageViewRow } from "@/lib/admin/analytics";

function rowActivityTime(view: PageViewRow): number {
  return new Date(view.last_seen_at ?? view.created_at).getTime();
}

/** Collapse duplicate session+path rows (ingest races) into one row per session path. */
export function dedupePageViewRows(views: PageViewRow[]): PageViewRow[] {
  const latest = new Map<string, PageViewRow>();

  for (const view of views) {
    const key = `${view.session_id}|${view.path}`;
    const existing = latest.get(key);

    if (!existing) {
      latest.set(key, view);
      continue;
    }

    const existingTime = rowActivityTime(existing);
    const nextTime = rowActivityTime(view);
    const mergedLoads = (existing.view_count ?? 1) + (view.view_count ?? 1);

    if (nextTime >= existingTime) {
      latest.set(key, {
        ...view,
        view_count: mergedLoads,
        is_internal: Boolean(existing.is_internal) || Boolean(view.is_internal),
        duration_seconds: Math.max(
          existing.duration_seconds ?? 0,
          view.duration_seconds ?? 0,
        ),
      });
    } else {
      latest.set(key, {
        ...existing,
        view_count: mergedLoads,
        is_internal: Boolean(existing.is_internal) || Boolean(view.is_internal),
        duration_seconds: Math.max(
          existing.duration_seconds ?? 0,
          view.duration_seconds ?? 0,
        ),
      });
    }
  }

  return [...latest.values()];
}

export function getPageViewLoadCount(view: PageViewRow): number {
  return Math.max(1, view.view_count ?? 1);
}

export function getPageViewActivityDate(view: PageViewRow): Date {
  return new Date(view.last_seen_at ?? view.created_at);
}
