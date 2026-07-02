import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Software" };

export default function AdminSoftwarePage() {
  return (
    <AdminPlaceholderPage
      title="Software"
      description="Manage software reviews and learning app profiles."
    />
  );
}
