import { NextRequest, NextResponse } from "next/server";
import { getDistrict66SchoolOptions } from "@/lib/evidence/district66";
import type { EvidenceSubject } from "@/lib/evidence/types";

export async function GET(request: NextRequest) {
  const subject = (request.nextUrl.searchParams.get("subject") ??
    "math") as EvidenceSubject;

  try {
    const schools = await getDistrict66SchoolOptions(subject);
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Schools API error:", error);
    return NextResponse.json(
      { error: "Failed to load schools" },
      { status: 500 },
    );
  }
}
