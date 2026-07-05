import "server-only";

import { revalidateSiteContent } from "@/lib/cms/revalidate-site-content";
import { createAdminClient } from "@/lib/supabase/admin";

const ASSETS_REVISION_KEY = "assets_revision";

export async function getAssetsRevision(): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", ASSETS_REVISION_KEY)
      .maybeSingle();

    if (typeof data?.value === "string" || typeof data?.value === "number") {
      return String(data.value);
    }
  } catch {
    // fall through
  }

  return "0";
}

/** Bump when media files change so clients refetch fresh image URLs. */
export async function touchAssetsRevision() {
  const supabase = createAdminClient();
  const next = String(Date.now());

  await supabase.from("site_settings").upsert(
    { key: ASSETS_REVISION_KEY, value: next },
    { onConflict: "key" },
  );

  revalidateSiteContent();
  return next;
}
