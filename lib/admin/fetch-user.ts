import "server-only";

import type { AdminUserSummary } from "@/lib/admin/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function fetchAdminUser(userId: string): Promise<AdminUserSummary> {
  const supabase = createAdminClient();
  const authClient = await createClient();

  const [userRes, profileRes, roleRes] = await Promise.all([
    authClient.auth.getUser(),
    supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  const email = userRes.data.user?.email ?? "";
  const displayName =
    profileRes.data?.display_name ??
    email.split("@")[0]?.replace(/\./g, " ") ??
    "Admin";
  const role = roleRes.data?.role ?? "viewer";

  return {
    id: userId,
    name: displayName,
    email,
    role: role.charAt(0).toUpperCase() + role.slice(1),
  };
}
