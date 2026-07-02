import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourcesView } from "@/components/admin/resources/ResourcesView";
import { fetchResourcesCatalog } from "@/lib/admin/resources/fetch";

export const metadata: Metadata = { title: "Resources" };

export default async function AdminResourcesPage() {
  const catalog = await fetchResourcesCatalog();

  return (
    <Suspense fallback={<div className="text-sm text-body-muted">Loading…</div>}>
      <ResourcesView initialCatalog={catalog} />
    </Suspense>
  );
}
