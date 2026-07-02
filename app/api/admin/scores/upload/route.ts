import { NextResponse } from "next/server";
import { uploadScoreCsv } from "@/lib/admin/scores/fetch";
import { parseScoreDataset } from "@/lib/admin/scores/types";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;
export const runtime = "nodejs";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const dataset = parseScoreDataset(String(formData.get("dataset") ?? ""));
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Upload must be a .csv file." },
        { status: 400 },
      );
    }

    const csvText = await file.text();
    const result = await uploadScoreCsv({
      dataset,
      fileName: file.name,
      csvText,
      uploadedBy: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
