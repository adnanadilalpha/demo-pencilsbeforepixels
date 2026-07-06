import { NextResponse } from "next/server";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";
import {
  getRequestAnalyticsContext,
  isValidAnalyticsId,
} from "@/lib/analytics/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEDUPE_WINDOW_MS = 10_000;

type PageViewBody = {
  sessionId?: string;
  visitorId?: string | null;
  path?: string;
  pageTitle?: string;
  referrer?: string;
  durationSeconds?: number;
  isBounce?: boolean;
  viewId?: string;
};

export async function POST(request: Request) {
  const context = await getRequestAnalyticsContext(request);

  if (!context.shouldRecord) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: PageViewBody;

  try {
    body = (await request.json()) as PageViewBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { sessionId, visitorId, path, pageTitle, referrer, durationSeconds, isBounce } =
    body;

  if (!isValidAnalyticsId(sessionId) || !path) {
    return NextResponse.json({ error: "Missing session or path." }, { status: 400 });
  }

  const normalizedPath = normalizeAnalyticsPath(path);

  if (normalizedPath.startsWith("/admin")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createAdminClient();
  const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();

  const { data: recentRows, error: recentError } = await supabase
    .from("page_views")
    .select("id")
    .eq("session_id", sessionId)
    .eq("path", normalizedPath)
    .gte("created_at", dedupeSince)
    .order("created_at", { ascending: false })
    .limit(1);

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  const recent = recentRows?.[0];
  if (recent?.id) {
    return NextResponse.json({ ok: true, id: recent.id, deduped: true });
  }

  const { data, error } = await supabase
    .from("page_views")
    .insert({
      session_id: sessionId,
      visitor_id: isValidAnalyticsId(visitorId ?? undefined) ? visitorId : null,
      visitor_key: context.visitorKey,
      path: normalizedPath,
      page_title: pageTitle ?? null,
      referrer: referrer ?? null,
      country_code: context.countryCode,
      region: context.region,
      city: context.city,
      duration_seconds:
        typeof durationSeconds === "number" ? Math.round(durationSeconds) : null,
      is_bounce: typeof isBounce === "boolean" ? isBounce : true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

export async function PATCH(request: Request) {
  const context = await getRequestAnalyticsContext(request);

  if (!context.shouldRecord) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: PageViewBody;

  try {
    body = (await request.json()) as PageViewBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { viewId, durationSeconds, isBounce } = body;

  if (!isValidAnalyticsId(viewId)) {
    return NextResponse.json({ error: "Missing view id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};

  if (typeof durationSeconds === "number") {
    updates.duration_seconds = Math.round(durationSeconds);
  }

  if (typeof isBounce === "boolean") {
    updates.is_bounce = isBounce;
  }

  const { error } = await supabase.from("page_views").update(updates).eq("id", viewId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
