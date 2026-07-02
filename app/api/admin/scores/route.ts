import { NextResponse } from "next/server";
import { fetchScoresList } from "@/lib/admin/scores/fetch";
import type { AcademicScoreKey, FrlScoreKey } from "@/lib/admin/scores/keys";
import {
  deleteScoreRows,
  updateAcademicScoreRow,
  updateFrlScoreRow,
  type AcademicScorePatch,
  type FrlScorePatch,
} from "@/lib/admin/scores/mutations";
import type { ScoreListFilters } from "@/lib/admin/scores/types";
import { parseScoreDataset } from "@/lib/admin/scores/types";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function parseFilters(searchParams: URLSearchParams): ScoreListFilters {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(10, Number.parseInt(searchParams.get("pageSize") ?? "25", 10) || 25),
  );

  return {
    dataset: parseScoreDataset(searchParams.get("dataset")),
    page,
    pageSize,
    schoolYear: searchParams.get("schoolYear") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    districtId: searchParams.get("districtId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    latestOnly: searchParams.get("latestOnly") === "1",
    batchId: searchParams.get("batchId") ?? undefined,
  };
}

export async function GET(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = parseFilters(new URL(request.url).searchParams);
    const data = await fetchScoresList(filters);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeDeleteKeys(
  dataset: ReturnType<typeof parseScoreDataset>,
  keys: Array<Record<string, unknown>>,
): Array<AcademicScoreKey | FrlScoreKey> {
  if (dataset === "frl") {
    return keys.map((key) => ({
      schoolYear: String(key.schoolYear ?? ""),
      level: String(key.level ?? ""),
      districtId: Number(key.districtId ?? 0),
      schoolId: Number(key.schoolId ?? 0),
      agencyName: String(key.agencyName ?? ""),
    }));
  }

  return keys.map((key) => ({
    schoolYear: String(key.schoolYear ?? ""),
    grade: String(key.grade ?? ""),
    level: String(key.level ?? ""),
    districtId: String(key.districtId ?? ""),
    subgroupType: String(key.subgroupType ?? ""),
    subgroupDesc: String(key.subgroupDesc ?? ""),
    subject: String(key.subject ?? ""),
  }));
}

export async function PATCH(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      dataset?: string;
      key?: Record<string, unknown>;
      patch?: Record<string, unknown>;
    };

    const dataset = parseScoreDataset(body.dataset);
    if (!body.key || !body.patch) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const [key] = normalizeDeleteKeys(dataset, [body.key]);

    if (dataset === "frl") {
      await updateFrlScoreRow(key as FrlScoreKey, body.patch as FrlScorePatch);
    } else {
      await updateAcademicScoreRow(
        dataset,
        key as AcademicScoreKey,
        body.patch as AcademicScorePatch,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update score.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      dataset?: string;
      keys?: Array<Record<string, unknown>>;
    };

    const dataset = parseScoreDataset(body.dataset);
    const keys = normalizeDeleteKeys(dataset, body.keys ?? []);

    if (!keys.length) {
      return NextResponse.json({ error: "No rows selected." }, { status: 400 });
    }

    const deletedCount = await deleteScoreRows(dataset, keys);
    return NextResponse.json({ deletedCount });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
