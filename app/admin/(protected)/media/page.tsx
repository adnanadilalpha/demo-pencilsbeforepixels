import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Media" };

export default function AdminMediaPage() {
  return (
    <AdminPlaceholderPage
      title="Media"
      description="Upload and organize images, videos, and documents."
    />
  );
}
