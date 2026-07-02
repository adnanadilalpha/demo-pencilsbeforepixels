import type { Metadata } from "next";
import { Suspense } from "react";
import { ScoresView } from "@/components/admin/scores/ScoresView";
import { fetchScoresList } from "@/lib/admin/scores/fetch";

export const metadata: Metadata = { title: "Scores" };

type AdminScoresPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminScoresPage({
  searchParams,
}: AdminScoresPageProps) {
  const params = await searchParams;
  const datasetParam = typeof params.dataset === "string" ? params.dataset : null;
  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1,
  );

  const initialData = await fetchScoresList({
    dataset:
      datasetParam === "english" || datasetParam === "frl" || datasetParam === "math"
        ? datasetParam
        : "math",
    page,
    pageSize: 25,
    schoolYear:
      typeof params.schoolYear === "string" ? params.schoolYear : undefined,
    level: typeof params.level === "string" ? params.level : undefined,
    districtId:
      typeof params.districtId === "string" ? params.districtId : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    latestOnly: params.latestOnly === "1",
    batchId: typeof params.batchId === "string" ? params.batchId : undefined,
  });

  return (
    <Suspense fallback={<div className="text-sm text-body-muted">Loading…</div>}>
      <ScoresView initialData={initialData} />
    </Suspense>
  );
}
