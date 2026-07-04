import { Suspense } from "react";
import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { normalizeContentPageId } from "@/lib/admin/content-config";
import { fetchContentEditorState } from "@/lib/admin/fetch-content-editor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Content" };

function parseRoutePage(value: string | undefined) {
  return normalizeContentPageId(value);
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; section?: string }>;
}) {
  const params = await searchParams;
  const initialState = await fetchContentEditorState();

  return (
    <Suspense fallback={null}>
      <ContentEditor
        initialState={initialState}
        routePage={parseRoutePage(params.page)}
        routeSection={params.section}
      />
    </Suspense>
  );
}
