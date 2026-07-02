import { NextResponse } from "next/server";
import { getEvidenceVersion } from "@/lib/evidence/cached";

export async function GET() {
  const version = await getEvidenceVersion();
  return NextResponse.json(version, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
