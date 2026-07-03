import { NextRequest, NextResponse } from "next/server";
import { getAllDistrictOptions } from "@/lib/evidence/fetch";
import type { EvidenceSubject, StudentGroup } from "@/lib/evidence/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const subject = (searchParams.get("subject") ?? "math") as EvidenceSubject;
  const studentGroup = (searchParams.get("studentGroup") ??
    "all") as StudentGroup;
  const subgroupType = studentGroup === "gender" ? "GENDER" : "ALL";

  try {
    const districts = await getAllDistrictOptions(subject, subgroupType);
    return NextResponse.json(districts);
  } catch (error) {
    console.error("Districts API error:", error);
    return NextResponse.json(
      { error: "Failed to load districts" },
      { status: 500 },
    );
  }
}
