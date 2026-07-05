import { NextResponse } from "next/server";
import { getApiCacheHeaders } from "@/lib/cache/server";
import { getDistrict66SchoolOptions } from "@/lib/evidence/district66";
import type { EvidenceSubject, StudentGroup } from "@/lib/evidence/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = (searchParams.get("subject") ?? "math") as EvidenceSubject;
  const studentGroup = (searchParams.get("studentGroup") ??
    "all") as StudentGroup;
  const subgroupType = studentGroup === "gender" ? "GENDER" : "ALL";

  try {
    const schools = await getDistrict66SchoolOptions(subject, subgroupType);
    return NextResponse.json(schools, {
      headers: await getApiCacheHeaders("evidence-data"),
    });
  } catch (error) {
    console.error("Schools API error:", error);
    return NextResponse.json(
      { error: "Failed to load schools" },
      { status: 500 },
    );
  }
}
