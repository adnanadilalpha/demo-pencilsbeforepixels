import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Newsletter" };

export default function AdminNewsletterPage() {
  return (
    <AdminPlaceholderPage
      title="Newsletter"
      description="View subscribers and manage newsletter campaigns."
    />
  );
}
