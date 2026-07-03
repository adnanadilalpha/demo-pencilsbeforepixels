import { redirect } from "next/navigation";

export default function AdminResearchRedirectPage() {
  redirect("/admin/content?page=research&section=evidence_research");
}
