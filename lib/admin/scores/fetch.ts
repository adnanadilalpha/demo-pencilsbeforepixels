import "server-only";

import {
  getScoreDatasetMeta,
  type AcademicScoreRow,
  type FrlScoreRow,
  type ScoreListFilters,
  type ScoreUploadBatch,
  type ScoresListResponse,
} from "@/lib/admin/scores/types";
import { createAdminClient } from "@/lib/supabase/admin";

const INSERT_CHUNK_SIZE = 750;

function mapBatch(row: Record<string, unknown>): ScoreUploadBatch {
  return {
    id: String(row.id),
    dataset: String(row.dataset) as ScoreUploadBatch["dataset"],
    fileName: String(row.file_name ?? ""),
    schoolYears: Array.isArray(row.school_years)
      ? row.school_years.map(String)
      : [],
    rowCount: Number(row.row_count ?? 0),
    replacedCount: Number(row.replaced_count ?? 0),
    uploadedBy: row.uploaded_by ? String(row.uploaded_by) : null,
    createdAt: String(row.created_at ?? ""),
  };
}

function buildAcademicRowKey(row: Record<string, unknown>): string {
  return [
    row.school_year,
    row.level,
    row.district_id,
    row.school_id,
    row.grade,
    row.subgroup_type,
    row.subgroup_desc,
    row.subject,
  ]
    .map((value) => String(value ?? ""))
    .join("|");
}

function buildFrlRowKey(row: Record<string, unknown>): string {
  return [
    row.school_year,
    row.level,
    row.district_id,
    row.school_id,
    row.agency_name,
  ]
    .map((value) => String(value ?? ""))
    .join("|");
}

function mapAcademicRow(
  row: Record<string, unknown>,
  latestBatchId: string | null,
): AcademicScoreRow {
  const uploadBatchId = row.upload_batch_id ? String(row.upload_batch_id) : null;

  return {
    id: buildAcademicRowKey(row),
    level: row.level ? String(row.level) : null,
    schoolYear: row.school_year ? String(row.school_year) : null,
    countyId:
      row.county_id === null || row.county_id === undefined
        ? null
        : Number(row.county_id),
    districtId: row.district_id ? String(row.district_id) : null,
    schoolId:
      row.school_id === null || row.school_id === undefined
        ? null
        : Number(row.school_id),
    agencyName: row.agency_name ? String(row.agency_name) : null,
    subject: row.subject ? String(row.subject) : null,
    grade: row.grade ? String(row.grade) : null,
    subgroupType: row.subgroup_type ? String(row.subgroup_type) : null,
    subgroupDesc: row.subgroup_desc ? String(row.subgroup_desc) : null,
    avgScaleScore:
      row.avg_scale_score === null || row.avg_scale_score === undefined
        ? null
        : Number(row.avg_scale_score),
    countDeveloping: row.count_developing ? String(row.count_developing) : null,
    pctDeveloping: row.pct_developing ? String(row.pct_developing) : null,
    countOnTrack: row.count_ontrack ? String(row.count_ontrack) : null,
    pctOnTrack: row.pct_ontrack ? String(row.pct_ontrack) : null,
    countAdvanced: row.count_advanced ? String(row.count_advanced) : null,
    pctAdvanced: row.pct_advanced ? String(row.pct_advanced) : null,
    countTested:
      row.count_tested === null || row.count_tested === undefined
        ? null
        : Number(row.count_tested),
    countNotTested: row.count_not_tested ? String(row.count_not_tested) : null,
    pctNotTested: row.pct_not_tested ? String(row.pct_not_tested) : null,
    dataAsOf: row.data_as_of ? String(row.data_as_of) : null,
    pctBasic: row.pct_basic ? String(row.pct_basic) : null,
    pctProficient: row.pct_proficient ? String(row.pct_proficient) : null,
    uploadBatchId,
    isLatestBatch: Boolean(latestBatchId && uploadBatchId === latestBatchId),
  };
}

function mapFrlRow(
  row: Record<string, unknown>,
  latestBatchId: string | null,
): FrlScoreRow {
  const uploadBatchId = row.upload_batch_id ? String(row.upload_batch_id) : null;

  return {
    id: buildFrlRowKey(row),
    level: row.level ? String(row.level) : null,
    schoolYear: row.school_year ? String(row.school_year) : null,
    countyId:
      row.county_id === null || row.county_id === undefined
        ? null
        : Number(row.county_id),
    districtId:
      row.district_id === null || row.district_id === undefined
        ? null
        : Number(row.district_id),
    schoolId:
      row.school_id === null || row.school_id === undefined
        ? null
        : Number(row.school_id),
    agencyName: row.agency_name ? String(row.agency_name) : null,
    dataAsOf: row.data_as_of ? String(row.data_as_of) : null,
    pctFrl:
      row.pct_frl === null || row.pct_frl === undefined
        ? null
        : Number(row.pct_frl),
    countFrl: row.count_frl ? String(row.count_frl) : null,
    uploadBatchId,
    isLatestBatch: Boolean(latestBatchId && uploadBatchId === latestBatchId),
  };
}

export async function fetchScoreBatches(
  dataset?: ScoreListFilters["dataset"],
): Promise<ScoreUploadBatch[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("score_upload_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (dataset) {
    query = query.eq("dataset", dataset);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapBatch(row as Record<string, unknown>));
}

export async function fetchLatestScoreBatch(
  dataset: ScoreListFilters["dataset"],
): Promise<ScoreUploadBatch | null> {
  const batches = await fetchScoreBatches(dataset);
  return batches[0] ?? null;
}

async function fetchFilterOptions(table: string) {
  const supabase = createAdminClient();

  const [yearsRes, levelsRes] = await Promise.all([
    supabase.from(table).select("school_year").limit(5000),
    supabase.from(table).select("level").limit(5000),
  ]);

  const schoolYears = [
    ...new Set(
      (yearsRes.data ?? [])
        .map((row) => String((row as { school_year?: string }).school_year ?? ""))
        .filter(Boolean),
    ),
  ].sort((a, b) => b.localeCompare(a));

  const levels = [
    ...new Set(
      (levelsRes.data ?? [])
        .map((row) => String((row as { level?: string }).level ?? ""))
        .filter(Boolean),
    ),
  ].sort();

  return { schoolYears, levels };
}

export async function fetchScoresList(
  filters: ScoreListFilters,
): Promise<ScoresListResponse> {
  const meta = getScoreDatasetMeta(filters.dataset);
  const supabase = createAdminClient();
  const latestBatch = await fetchLatestScoreBatch(filters.dataset);
  const latestBatchId = latestBatch?.id ?? null;
  const filterOptions = await fetchFilterOptions(meta.table);

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from(meta.table)
    .select("*", { count: "exact" })
    .order("school_year", { ascending: false })
    .order("agency_name", { ascending: true })
    .range(from, to);

  if (filters.schoolYear) {
    query = query.eq("school_year", filters.schoolYear);
  }

  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  if (filters.districtId) {
    query = query.eq("district_id", filters.districtId);
  }

  if (filters.search) {
    query = query.ilike("agency_name", `%${filters.search}%`);
  }

  if (filters.latestOnly && latestBatchId) {
    query = query.eq("upload_batch_id", latestBatchId);
  }

  if (filters.batchId) {
    query = query.eq("upload_batch_id", filters.batchId);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const batches = await fetchScoreBatches(filters.dataset);
  const rows =
    filters.dataset === "frl"
      ? (data ?? []).map((row) =>
          mapFrlRow(row as Record<string, unknown>, latestBatchId),
        )
      : (data ?? []).map((row) =>
          mapAcademicRow(row as Record<string, unknown>, latestBatchId),
        );

  const { count: totalRows, error: totalError } = await supabase
    .from(meta.table)
    .select("*", { count: "exact", head: true });

  if (totalError) throw new Error(totalError.message);

  const batchSchoolYears = batches.flatMap((batch) => batch.schoolYears);
  const schoolYears = [
    ...new Set([...filterOptions.schoolYears, ...batchSchoolYears]),
  ].sort((a, b) => b.localeCompare(a));

  return {
    summary: {
      dataset: filters.dataset,
      totalRows: totalRows ?? 0,
      latestBatch,
      schoolYears,
      levels: filterOptions.levels,
    },
    batches,
    rows,
    page: filters.page,
    pageSize: filters.pageSize,
    total: count ?? 0,
  };
}

export async function uploadScoreCsv(options: {
  dataset: ScoreListFilters["dataset"];
  fileName: string;
  csvText: string;
  uploadedBy: string;
}): Promise<{
  batch: ScoreUploadBatch;
  insertedCount: number;
  replacedCount: number;
  schoolYears: string[];
}> {
  const { parseScoreCsv } = await import("@/lib/admin/scores/csv");
  const meta = getScoreDatasetMeta(options.dataset);
  const supabase = createAdminClient();
  const { rows, schoolYears } = parseScoreCsv(options.dataset, options.csvText);

  if (rows.length === 0) {
    throw new Error("CSV file contains no data rows.");
  }

  let replacedCount = 0;

  if (schoolYears.length > 0) {
    const { count, error: countError } = await supabase
      .from(meta.table)
      .select("id", { count: "exact", head: true })
      .in("school_year", schoolYears);

    if (countError) throw new Error(countError.message);
    replacedCount = count ?? 0;

    const { error: deleteError } = await supabase
      .from(meta.table)
      .delete()
      .in("school_year", schoolYears);

    if (deleteError) throw new Error(deleteError.message);
  }

  const { data: batchRow, error: batchError } = await supabase
    .from("score_upload_batches")
    .insert({
      dataset: options.dataset,
      file_name: options.fileName,
      school_years: schoolYears,
      row_count: rows.length,
      replaced_count: replacedCount,
      uploaded_by: options.uploadedBy,
    })
    .select("*")
    .single();

  if (batchError || !batchRow) {
    throw new Error(batchError?.message ?? "Failed to create upload batch.");
  }

  const batchId = String(batchRow.id);

  for (let index = 0; index < rows.length; index += INSERT_CHUNK_SIZE) {
    const chunk = rows.slice(index, index + INSERT_CHUNK_SIZE).map((row) => ({
      ...row,
      upload_batch_id: batchId,
    }));

    const { error: insertError } = await supabase.from(meta.table).insert(chunk);
    if (insertError) throw new Error(insertError.message);
  }

  return {
    batch: mapBatch(batchRow as Record<string, unknown>),
    insertedCount: rows.length,
    replacedCount,
    schoolYears,
  };
}
