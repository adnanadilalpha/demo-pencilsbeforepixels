import "server-only";

import { pickPrimaryRole } from "@/lib/admin/admins/roles";
import type { AdminRole } from "@/lib/admin/admins/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedAdminRole(): Promise<{
  userId: string;
  role: AdminRole;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const roles = (data ?? [])
    .map((row) => row.role as AdminRole)
    .filter(Boolean);

  if (!roles.length) return null;

  return {
    userId: user.id,
    role: pickPrimaryRole(roles),
  };
}
