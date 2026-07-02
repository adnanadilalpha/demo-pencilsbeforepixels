import { NextResponse } from "next/server";
import { getSiteContentUncached } from "@/lib/cms/fetch-server";

export async function GET() {
  const content = await getSiteContentUncached();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
