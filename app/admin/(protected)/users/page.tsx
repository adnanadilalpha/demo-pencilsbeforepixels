import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <AdminPlaceholderPage
      title="Users"
      description="Manage admin users and roles."
    />
  );
}
