import { redirect } from "next/navigation";

export default function AdminResearchRedirectPage() {
  redirect("/admin/resources?tab=research-papers");
}
