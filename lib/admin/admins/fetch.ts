import "server-only";

import { getAuthenticatedAdminRole } from "@/lib/admin/admins/auth";
import {
  resolveAdminStatus,
  sortAdmins,
} from "@/lib/admin/admins/format";
import { canManageAdmins, canDeleteAdmin, pickPrimaryRole } from "@/lib/admin/admins/roles";
import type {
  AdminMember,
  AdminRole,
  AdminsPageData,
} from "@/lib/admin/admins/types";
import { createAdminClient } from "@/lib/supabase/admin";

type ProfileRow = {
  id: string;
  display_name: string | null;
  last_login_at: string | null;
};

type RoleRow = {
  user_id: string;
  role: AdminRole;
};

async function listAuthUsers() {
  const supabase = createAdminClient();
  const users: Array<{
    id: string;
    email?: string;
    last_sign_in_at?: string | null;
    deleted_at?: string | null;
  }> = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(error.message);
    }

    const pageUsers = (data.users ?? []).filter((user) => !user.deleted_at);
    users.push(...pageUsers);

    if ((data.users ?? []).length < 200) break;
    page += 1;
  }

  return users;
}

async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const roles = (data ?? [])
    .map((row) => row.role as AdminRole)
    .filter(Boolean);

  if (!roles.length) return null;
  return pickPrimaryRole(roles);
}

export async function fetchAdminsPageData(): Promise<AdminsPageData> {
  const auth = await getAuthenticatedAdminRole();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const [profilesRes, rolesRes, authUsers] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, display_name, last_login_at"),
    supabase.from("user_roles").select("user_id, role"),
    listAuthUsers(),
  ]);

  if (profilesRes.error) {
    throw new Error(profilesRes.error.message);
  }

  if (rolesRes.error) {
    throw new Error(rolesRes.error.message);
  }

  const profiles = new Map(
    ((profilesRes.data ?? []) as ProfileRow[]).map((row) => [row.id, row]),
  );

  const rolesByUser = new Map<string, AdminRole[]>();
  for (const row of (rolesRes.data ?? []) as RoleRow[]) {
    const existing = rolesByUser.get(row.user_id) ?? [];
    existing.push(row.role);
    rolesByUser.set(row.user_id, existing);
  }

  const admins: AdminMember[] = authUsers
    .filter((user) => rolesByUser.has(user.id))
    .map((user) => {
      const profile = profiles.get(user.id);
      const role = pickPrimaryRole(rolesByUser.get(user.id) ?? []);
      const name =
        profile?.display_name?.trim() ||
        user.email?.split("@")[0]?.replace(/\./g, " ") ||
        "Admin";
      const lastLoginAt =
        profile?.last_login_at ?? user.last_sign_in_at ?? null;

      return {
        id: user.id,
        name,
        email: user.email ?? "",
        role,
        status: resolveAdminStatus(role, lastLoginAt),
        lastLoginAt,
        canDelete: false,
      };
    });

  const ownerCount = admins.filter((admin) => admin.role === "owner").length;

  const adminsWithPermissions = admins.map((admin) => ({
    ...admin,
    canDelete: canDeleteAdmin(
      auth.role,
      auth.userId,
      admin.role,
      admin.id,
      ownerCount,
    ),
  }));

  return {
    admins: sortAdmins(adminsWithPermissions),
    currentUserId: auth.userId,
    currentUserRole: auth.role,
    canManage: canManageAdmins(auth.role),
  };
}

export async function deleteAdminUser(userId: string) {
  const supabase = createAdminClient();

  const { data: authLookup, error: authLookupError } =
    await supabase.auth.admin.getUserById(userId);

  const authUserMissing =
    authLookupError?.status === 404 ||
    authLookupError?.code === "user_not_found";

  if (authLookupError && !authUserMissing) {
    throw new Error(authLookupError.message);
  }

  if (authLookup?.user) {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }
  }

  const { error: rolesError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (rolesError) {
    throw new Error(`Failed to delete admin roles: ${rolesError.message}`);
  }

  const { error: profileError } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    throw new Error(`Failed to delete admin profile: ${profileError.message}`);
  }

  const { data: verifyAuth } = await supabase.auth.admin.getUserById(userId);

  if (verifyAuth?.user) {
    throw new Error("Auth user still exists after delete.");
  }

  const { data: remainingRoles, error: verifyRolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId);

  if (verifyRolesError) {
    throw new Error(verifyRolesError.message);
  }

  if ((remainingRoles ?? []).length > 0) {
    throw new Error("Admin role records still exist after delete.");
  }
}

export { getAdminRole };

export async function touchAdminLastLogin(userId: string) {
  const supabase = createAdminClient();
  const timestamp = new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (existing) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ last_login_at: timestamp })
      .eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from("user_profiles").insert({
    id: userId,
    last_login_at: timestamp,
  });

  if (error) {
    throw new Error(error.message);
  }
}
