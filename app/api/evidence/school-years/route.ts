import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getDistrict66SchoolYears } from "@/lib/evidence/district66";
import { getSchoolYears } from "@/lib/evidence/fetch";
import type { EvidenceSubject, EvidenceTab } from "@/lib/evidence/types";

export async function GET(request: Request) {
  const subject = (new URL(request.url).searchParams.get("subject") ??
    "math") as EvidenceSubject;
  const tab = (new URL(request.url).searchParams.get("tab") ??
    "nebraska") as EvidenceTab;

  try {
    const schoolYears =
      tab === "district-66"
        ? await getDistrict66SchoolYears()
        : await getSchoolYears(subject);
    return NextResponse.json(schoolYears, {
      headers: await getApiCacheHeaders("evidence-data"),
    });
  } catch (error) {
    console.error("School years API error:", error);
    return NextResponse.json(
      { error: "Failed to load school years" },
      { status: 500 },
    );
  }
}
