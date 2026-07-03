import { NextResponse } from "next/server";
import { loadOptOutSchools } from "@/lib/opt-out/config";

export async function GET() {
  const schools = await loadOptOutSchools();

  return NextResponse.json({
    schools: schools
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((school) => ({
        id: school.id,
        schoolName: school.schoolName,
        principalName: school.principalName,
        email: school.email,
      })),
  });
}
