import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { fetchContentEditorState } from "@/lib/admin/fetch-content-editor";

export const metadata: Metadata = { title: "Content" };

export default async function AdminContentPage() {
  const initialState = await fetchContentEditorState();

  return <ContentEditor initialState={initialState} />;
}
