import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOptOutDownloadToken } from "@/lib/opt-out/access-token";
import type { OptOutSubmissionPayload } from "@/lib/opt-out/types";

export async function getVerifiedOptOutPayload(
  id: string,
  token: string | null | undefined,
): Promise<OptOutSubmissionPayload | null> {
  if (!token?.trim()) return null;

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("opt_out_submissions")
    .select("payload")
    .eq("id", id)
    .single();

  if (error || !row) return null;

  const payload = row.payload as OptOutSubmissionPayload;
  if (!verifyOptOutDownloadToken(payload.downloadToken, token.trim())) {
    return null;
  }

  return payload;
}
