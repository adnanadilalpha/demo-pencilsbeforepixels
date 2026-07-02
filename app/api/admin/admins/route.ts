import { NextResponse } from "next/server";
import { getAuthenticatedAdminRole } from "@/lib/admin/admins/auth";
import {
  deleteAdminUser,
  fetchAdminsPageData,
  getAdminRole,
} from "@/lib/admin/admins/fetch";
import { canAssignRole, canDeleteAdmin, canManageAdmins } from "@/lib/admin/admins/roles";
import type { AdminRole, CreateAdminPayload } from "@/lib/admin/admins/types";
import { fetchPasswordPolicySettings } from "@/lib/admin/settings/fetch";
import { validatePasswordAgainstPolicy } from "@/lib/admin/settings/password-policy";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ROLES: AdminRole[] = [
  "owner",
  "administrator",
  "editor",
  "viewer",
];

async function countOwners() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "owner");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function GET() {
  const auth = await getAuthenticatedAdminRole();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchAdminsPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load admins.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedAdminRole();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageAdmins(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<CreateAdminPayload>;
  const displayName = body.displayName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role;

  if (!displayName || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (!canAssignRole(auth.role, role)) {
    return NextResponse.json({ error: "You cannot assign this role." }, { status: 403 });
  }

  const passwordPolicy = await fetchPasswordPolicySettings();
  const passwordError = validatePasswordAgainstPolicy(password, passwordPolicy);

  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: createdUser, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

  if (createError || !createdUser.user) {
    const message = createError?.message ?? "Failed to create admin.";
    const status = message.toLowerCase().includes("already")
      ? 409
      : 500;

    return NextResponse.json({ error: message }, { status });
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      id: userId,
      display_name: displayName,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: userId,
    role,
  });

  if (roleError) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  try {
    const data = await fetchAdminsPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load admins.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedAdminRole();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageAdmins(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing admin id." }, { status: 400 });
  }

  try {
    const targetRole = await getAdminRole(id);

    if (!targetRole) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    const ownerCount = await countOwners();

    if (
      !canDeleteAdmin(
        auth.role,
        auth.userId,
        targetRole,
        id,
        ownerCount,
      )
    ) {
      return NextResponse.json(
        { error: "You do not have permission to delete this admin." },
        { status: 403 },
      );
    }

    await deleteAdminUser(id);

    try {
      const data = await fetchAdminsPageData();
      return NextResponse.json(data);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh admin list.";
      return NextResponse.json({ deletedId: id, refreshError: message });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete admin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
