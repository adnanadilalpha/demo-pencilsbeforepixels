import { NextResponse } from "next/server";
import { isInternalAnalyticsRequest } from "@/lib/analytics/internal-traffic";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";
import {
  getRequestAnalyticsContext,
  isValidAnalyticsId,
} from "@/lib/analytics/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const isInternal = isInternalAnalyticsRequest(context.visitorKey, request);
  const now = new Date().toISOString();

  const { data: sessionView, error: sessionViewError } = await supabase
    .from("page_views")
    .select("id")
    .eq("session_id", sessionId)
    .eq("path", normalizedPath)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionViewError) {
    return NextResponse.json({ error: sessionViewError.message }, { status: 500 });
  }

  if (sessionView?.id) {
    const { error: touchError } = await supabase
      .from("page_views")
      .update({
        last_seen_at: now,
        page_title: pageTitle ?? null,
        referrer: referrer ?? null,
        is_bounce: false,
        is_internal: isInternal,
      })
      .eq("id", sessionView.id);

    if (touchError) {
      return NextResponse.json({ error: touchError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: sessionView.id, deduped: true });
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
      latitude: context.latitude,
      longitude: context.longitude,
      duration_seconds:
        typeof durationSeconds === "number" ? Math.round(durationSeconds) : null,
      is_bounce: typeof isBounce === "boolean" ? isBounce : true,
      is_internal: isInternal,
      view_count: 1,
      last_seen_at: now,
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
  const updates: Record<string, unknown> = {
    last_seen_at: new Date().toISOString(),
  };

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
