import { NextRequest, NextResponse } from "next/server";
import { getDistrict66SchoolYears } from "@/lib/evidence/district66";
import { getSchoolYears } from "@/lib/evidence/fetch";
import type { EvidenceSubject, EvidenceTab } from "@/lib/evidence/types";

export async function GET(request: NextRequest) {
  const subject = (request.nextUrl.searchParams.get("subject") ??
    "math") as EvidenceSubject;
  const tab = (request.nextUrl.searchParams.get("tab") ??
    "nebraska") as EvidenceTab;

  try {
    const schoolYears =
      tab === "district-66"
        ? await getDistrict66SchoolYears()
        : await getSchoolYears(subject);
    return NextResponse.json(schoolYears);
  } catch (error) {
    console.error("School years API error:", error);
    return NextResponse.json(
      { error: "Failed to load school years" },
      { status: 500 },
    );
  }
}
