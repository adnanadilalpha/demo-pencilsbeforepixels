import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Opt Out" };

export default function AdminOptOutPage() {
  return (
    <AdminPlaceholderPage
      title="Opt Out"
      description="Review device opt-out letter submissions."
    />
  );
}
