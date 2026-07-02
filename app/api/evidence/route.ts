import { NextRequest, NextResponse } from "next/server";
import { getEvidencePanelForView, parseGradesParam } from "@/lib/evidence/fetch";
import type {
  EvidenceSubject,
  EvidenceTab,
  EvidenceView,
  StudentGroup,
} from "@/lib/evidence/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const tab = (searchParams.get("tab") ?? "nebraska") as EvidenceTab;
  const view = (searchParams.get("view") ?? "performance") as EvidenceView;
  const subject = (searchParams.get("subject") ?? "math") as EvidenceSubject;
  const grades = parseGradesParam(
    searchParams.get("grades"),
    searchParams.get("grade"),
  );
  const schoolYear = searchParams.get("schoolYear") ?? "2023-2024";
  const includeState = searchParams.get("includeState") !== "false";
  const includeDistrictAvg = searchParams.get("includeDistrictAvg") !== "false";
  const studentGroup = (searchParams.get("studentGroup") ?? "all") as StudentGroup;
  const districtIds =
    searchParams
      .get("districtIds")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [];
  const schoolIds =
    searchParams
      .get("schoolIds")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [];

  try {
    const data = await getEvidencePanelForView(tab, view, {
      subject,
      grades,
      districtIds,
      schoolIds,
      includeState,
      includeDistrictAvg,
      studentGroup,
      schoolYear,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Evidence API error:", error);
    return NextResponse.json(
      { error: "Failed to load evidence data" },
      { status: 500 },
    );
  }
}
