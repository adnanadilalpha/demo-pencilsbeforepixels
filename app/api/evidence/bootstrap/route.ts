import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getEvidenceBootstrap } from "@/lib/evidence/cached";

export async function GET() {
  const bootstrap = await getEvidenceBootstrap();
  return NextResponse.json(bootstrap, {
    headers: await getApiCacheHeaders("evidence-bootstrap"),
  });
}
