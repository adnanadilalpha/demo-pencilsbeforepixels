import { NextResponse } from "next/server";
import { fetchScoreBatches } from "@/lib/admin/scores/fetch";
import { parseScoreDataset } from "@/lib/admin/scores/types";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const datasetParam = new URL(request.url).searchParams.get("dataset");
    const dataset = datasetParam ? parseScoreDataset(datasetParam) : undefined;
    const batches = await fetchScoreBatches(dataset);
    return NextResponse.json({ batches });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load upload batches.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
