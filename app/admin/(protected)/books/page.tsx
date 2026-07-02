import { redirect } from "next/navigation";

export default function AdminBooksRedirectPage() {
  redirect("/admin/resources?tab=books");
}
