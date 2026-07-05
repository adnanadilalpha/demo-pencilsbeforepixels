import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getEvidenceVersion } from "@/lib/evidence/cached";

export async function GET() {
  const version = await getEvidenceVersion();
  return NextResponse.json(version, {
    headers: await getApiCacheHeaders("evidence-version"),
  });
}
