import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getContentVersionUncached } from "@/lib/cms/fetch-server";

export async function GET() {
  const version = await getContentVersionUncached();
  return NextResponse.json(version, {
    headers: await getApiCacheHeaders("content"),
  });
}
