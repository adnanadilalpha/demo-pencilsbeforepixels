import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OptOutView } from "@/components/admin/opt-out/OptOutView";
import { fetchOptOutPageData } from "@/lib/admin/opt-out/fetch";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Device Opt Out" };

export default async function AdminOptOutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const data = await fetchOptOutPageData();

  return <OptOutView initialData={data} />;
}
