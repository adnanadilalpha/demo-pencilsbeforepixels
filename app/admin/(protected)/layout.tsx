import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { fetchAdminUser } from "@/lib/admin/fetch-user";
import { fetchAdminBrandLogoDarkUrl } from "@/lib/admin/settings/fetch";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const adminUser = await fetchAdminUser(user.id);
  const logoSrc = await fetchAdminBrandLogoDarkUrl();

  return (
    <AdminShell user={adminUser} logoSrc={logoSrc}>
      {children}
    </AdminShell>
  );
}
