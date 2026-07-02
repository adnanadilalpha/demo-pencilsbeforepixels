import { NextResponse } from "next/server";
import { getEvidenceBootstrap } from "@/lib/evidence/cached";

export async function GET() {
  const bootstrap = await getEvidenceBootstrap();
  return NextResponse.json(bootstrap, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
