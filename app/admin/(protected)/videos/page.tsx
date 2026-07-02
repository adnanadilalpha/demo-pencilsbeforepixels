import { redirect } from "next/navigation";

export default function AdminVideosRedirectPage() {
  redirect("/admin/resources?tab=videos");
}
