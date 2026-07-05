import { NextResponse } from "next/server";
import {
  fetchSettingsPageData,
  saveSettingsPageData,
} from "@/lib/admin/settings/fetch";
import type { SettingsPageData } from "@/lib/admin/settings/types";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchSettingsPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SettingsPageData>;

  if (!body.general && !body.security && !body.cache) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const current = await fetchSettingsPageData();
    const next: SettingsPageData = {
      general: body.general ?? current.general,
      security: body.security ?? current.security,
      cache: body.cache ?? current.cache,
    };

    await saveSettingsPageData(next);
    const data = await fetchSettingsPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
