import { NextRequest, NextResponse } from "next/server";
import { getAllDistrictOptions } from "@/lib/evidence/fetch";
import type { EvidenceSubject } from "@/lib/evidence/types";

export async function GET(request: NextRequest) {
  const subject = (request.nextUrl.searchParams.get("subject") ??
    "math") as EvidenceSubject;

  try {
    const districts = await getAllDistrictOptions(subject);
    return NextResponse.json(districts);
  } catch (error) {
    console.error("Districts API error:", error);
    return NextResponse.json(
      { error: "Failed to load districts" },
      { status: 500 },
    );
  }
}
