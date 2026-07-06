import { redirect } from "next/navigation";

/** Legacy URL — Nebraska Data lives at /nebraska-data. */
export default function EvidenceRedirectPage() {
  redirect("/nebraska-data");
}
