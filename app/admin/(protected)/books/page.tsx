import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Books" };

export default function AdminBooksPage() {
  return (
    <AdminPlaceholderPage
      title="Books"
      description="Manage featured books and reading resources."
    />
  );
}
