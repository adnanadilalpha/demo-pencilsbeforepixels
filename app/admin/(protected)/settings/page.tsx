import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/admin/settings/SettingsView";
import { fetchSettingsPageData } from "@/lib/admin/settings/fetch";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const data = await fetchSettingsPageData();

  return <SettingsView initialData={data} />;
}
