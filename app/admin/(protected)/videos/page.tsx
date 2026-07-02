import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Videos" };

export default function AdminVideosPage() {
  return (
    <AdminPlaceholderPage
      title="Videos"
      description="Manage video library and featured clips."
    />
  );
}
