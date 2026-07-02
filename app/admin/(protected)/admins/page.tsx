import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminsView } from "@/components/admin/admins/AdminsView";
import { fetchAdminsPageData } from "@/lib/admin/admins/fetch";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admins" };

export default async function AdminAdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const data = await fetchAdminsPageData();

  return <AdminsView initialData={data} />;
}
