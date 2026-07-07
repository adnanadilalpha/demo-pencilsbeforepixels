import { NextResponse } from "next/server";
import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analytics/event-types";
import { isInternalAnalyticsRequest } from "@/lib/analytics/internal-traffic";
import { normalizeAnalyticsPath } from "@/lib/analytics/normalize-path";
import {
  getRequestAnalyticsContext,
  isValidAnalyticsId,
} from "@/lib/analytics/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EVENTS = new Set<string>(Object.values(ANALYTICS_EVENTS));

type EventBody = {
  sessionId?: string;
  visitorId?: string | null;
  eventName?: string;
  eventLabel?: string | null;
  path?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: Request) {
  const context = await getRequestAnalyticsContext(request);

  if (!context.shouldRecord) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: EventBody;

  try {
    body = (await request.json()) as EventBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { sessionId, visitorId, eventName, eventLabel, path, metadata } = body;

  if (!isValidAnalyticsId(sessionId) || !eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  const normalizedPath = normalizeAnalyticsPath(path ?? "/");

  if (normalizedPath.startsWith("/admin")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const safeMetadata: Record<string, string> = {};
  if (metadata && typeof metadata === "object") {
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "string" && value.length <= 200) {
        safeMetadata[key] = value;
      }
    }
  }

  const supabase = createAdminClient();
  const isInternal = isInternalAnalyticsRequest(context.visitorKey, request);

  const { error } = await supabase.from("analytics_events").insert({
    session_id: sessionId,
    visitor_id: isValidAnalyticsId(visitorId ?? undefined) ? visitorId : null,
    visitor_key: context.visitorKey,
    event_name: eventName as AnalyticsEventName,
    event_label: eventLabel?.slice(0, 200) ?? null,
    path: normalizedPath,
    metadata: safeMetadata,
    country_code: context.countryCode,
    region: context.region,
    city: context.city,
    is_internal: isInternal,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
