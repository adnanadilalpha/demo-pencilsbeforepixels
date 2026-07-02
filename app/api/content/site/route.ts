import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/cms/cached";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
