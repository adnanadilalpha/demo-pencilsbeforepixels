import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewsletterView } from "@/components/admin/newsletter/NewsletterView";
import { fetchNewsletterPageData } from "@/lib/admin/newsletter/fetch";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const data = await fetchNewsletterPageData();

  return <NewsletterView initialData={data} />;
}
