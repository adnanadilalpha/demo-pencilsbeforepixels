import { NextResponse } from "next/server";
import { fetchNewsletterPageData } from "@/lib/admin/newsletter/fetch";
import type { NewsletterSubscriberStatus } from "@/lib/admin/newsletter/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchNewsletterPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load subscribers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: NewsletterSubscriberStatus;
  };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (body.status !== "active" && body.status !== "unsubscribed") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const patch: Record<string, string> = { status: body.status };

  if (body.status === "active") {
    patch.subscribed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update(patch)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data = await fetchNewsletterPageData();
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing subscriber id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data = await fetchNewsletterPageData();
  return NextResponse.json(data);
}
