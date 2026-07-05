import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { fetchAdminBrandLogoDarkUrl } from "@/lib/admin/settings/fetch";

export const metadata: Metadata = {
  title: "Admin Sign In | Pencils Before Pixels",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const logoSrc = await fetchAdminBrandLogoDarkUrl();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper-50 px-6 py-10">
      <AdminLoginForm logoSrc={logoSrc} />
    </main>
  );
}
