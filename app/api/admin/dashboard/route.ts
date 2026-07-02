import { NextResponse } from "next/server";
import {
  fetchDashboardData,
  parseMetric,
  parseRange,
} from "@/lib/admin/fetch-dashboard";
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
  const range = parseRange(searchParams.get("range"));
  const metric = parseMetric(searchParams.get("metric"));

  const data = await fetchDashboardData(user.id, { range, metric });
  return NextResponse.json(data);
}
