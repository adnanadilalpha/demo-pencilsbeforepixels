import { NextResponse } from "next/server";
import { getContentVersionUncached } from "@/lib/cms/fetch-server";

export async function GET() {
  const version = await getContentVersionUncached();
  return NextResponse.json(version, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
