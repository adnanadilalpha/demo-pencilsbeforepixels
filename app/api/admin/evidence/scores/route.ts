import { NextResponse } from "next/server";
import {
  loadEvidenceScores,
  saveEvidenceScores,
  type EditableScoreRow,
} from "@/lib/admin/evidence-scores";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope !== "nebraska" && scope !== "district66") {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  try {
    const rows = await loadEvidenceScores(scope);
    return NextResponse.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = (await request.json()) as { rows?: EditableScoreRow[] };

  if (!rows?.length) {
    return NextResponse.json({ ok: true });
  }

  try {
    await saveEvidenceScores(rows);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
