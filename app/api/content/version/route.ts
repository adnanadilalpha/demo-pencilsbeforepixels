import { NextResponse } from "next/server";
import { getContentVersion } from "@/lib/cms/cached";

export async function GET() {
  const version = await getContentVersion();
  return NextResponse.json(version, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
