import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { OptOutCachedPackages, OptOutSubmissionPayload } from "@/lib/opt-out/types";

export async function persistOptOutCachedPackages(
  id: string,
  payload: OptOutSubmissionPayload,
  cachedPackages: OptOutCachedPackages,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("opt_out_submissions")
    .update({
      payload: {
        ...payload,
        cachedPackages,
      },
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to cache opt-out packages:", error);
  }
}

export async function persistOptOutCachedPackage(
  id: string,
  payload: OptOutSubmissionPayload,
  buffer: Buffer,
): Promise<void> {
  await persistOptOutCachedPackages(id, payload, {
    ...payload.cachedPackages,
    pdf: buffer.toString("base64"),
  });
}
