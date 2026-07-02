import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PageViewBody = {
  sessionId?: string;
  path?: string;
  pageTitle?: string;
  referrer?: string;
  durationSeconds?: number;
  isBounce?: boolean;
  viewId?: string;
};

export async function POST(request: Request) {
  let body: PageViewBody;

  try {
    body = (await request.json()) as PageViewBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { sessionId, path, pageTitle, referrer, durationSeconds, isBounce } =
    body;

  if (!sessionId || !path) {
    return NextResponse.json({ error: "Missing session or path." }, { status: 400 });
  }

  if (path.startsWith("/admin")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("page_views")
    .insert({
      session_id: sessionId,
      path,
      page_title: pageTitle ?? null,
      referrer: referrer ?? null,
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
  let body: PageViewBody;

  try {
    body = (await request.json()) as PageViewBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { viewId, durationSeconds, isBounce } = body;

  if (!viewId) {
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
