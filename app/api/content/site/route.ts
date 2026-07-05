import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getSiteContentUncached } from "@/lib/cms/fetch-server";

export async function GET() {
  const content = await getSiteContentUncached();
  return NextResponse.json(content, {
    headers: await getApiCacheHeaders("content"),
  });
}
