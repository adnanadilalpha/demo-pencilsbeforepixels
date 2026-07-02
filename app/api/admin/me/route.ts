import { NextResponse } from "next/server";
import { touchAdminLastLogin } from "@/lib/admin/admins/fetch";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await touchAdminLastLogin(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
