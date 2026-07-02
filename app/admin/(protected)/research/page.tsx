import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Research" };

export default function AdminResearchPage() {
  return (
    <AdminPlaceholderPage
      title="Research"
      description="Manage research papers and datasets."
    />
  );
}
