import "server-only";

import { computeOptOutStats } from "@/lib/admin/opt-out/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OptOutSubmissionPayload } from "@/lib/opt-out/types";
import type {
  AdminOptOutSubmission,
  OptOutPageData,
  OptOutSubmissionStatus,
} from "./types";

type SubmissionRow = {
  id: string;
  parent_name: string;
  school: string | null;
  status: string | null;
  generated_at: string | null;
  downloaded_at: string | null;
  payload: OptOutSubmissionPayload | null;
};

function normalizeStatus(status: string | null): OptOutSubmissionStatus {
  return status === "downloaded" ? "downloaded" : "generated";
}

function mapSubmission(row: SubmissionRow): AdminOptOutSubmission {
  const studentName = row.payload?.letter?.studentName?.trim() || null;

  return {
    id: row.id,
    parentName: row.parent_name,
    studentName,
    school: row.school,
    status: normalizeStatus(row.status),
    generatedAt: row.generated_at ?? new Date(0).toISOString(),
    downloadedAt: row.downloaded_at,
  };
}

export async function fetchOptOutPageData(): Promise<OptOutPageData> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("opt_out_submissions")
    .select(
      "id, parent_name, school, status, generated_at, downloaded_at, payload",
    )
    .order("generated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const submissions = ((data ?? []) as SubmissionRow[]).map(mapSubmission);

  return {
    submissions,
    stats: computeOptOutStats(submissions),
  };
}

export async function fetchOptOutSubmissionPayload(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("opt_out_submissions")
    .select("id, payload")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
