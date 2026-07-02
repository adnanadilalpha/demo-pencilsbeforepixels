import type { AdminRole } from "@/lib/admin/admins/types";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  administrator: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export const ASSIGNABLE_ADMIN_ROLES: AdminRole[] = [
  "administrator",
  "editor",
  "viewer",
];

const ROLE_PRIORITY: Record<AdminRole, number> = {
  owner: 0,
  administrator: 1,
  editor: 2,
  viewer: 3,
};

export function pickPrimaryRole(roles: AdminRole[]): AdminRole {
  if (!roles.length) return "viewer";

  return roles.reduce((best, role) =>
    ROLE_PRIORITY[role] < ROLE_PRIORITY[best] ? role : best,
  );
}

export function canManageAdmins(role: AdminRole): boolean {
  return role === "owner" || role === "administrator";
}

export function canAssignRole(
  currentRole: AdminRole,
  targetRole: AdminRole,
): boolean {
  if (targetRole === "owner") {
    return currentRole === "owner";
  }

  if (currentRole === "owner") return true;
  if (currentRole === "administrator") return true;

  return false;
}

export function canDeleteAdmin(
  actorRole: AdminRole,
  actorId: string,
  targetRole: AdminRole,
  targetId: string,
  ownerCount: number,
): boolean {
  if (actorId === targetId) return false;
  if (!canManageAdmins(actorRole)) return false;

  if (targetRole === "owner" && ownerCount <= 1) {
    return false;
  }

  if (actorRole === "owner") return true;

  if (actorRole === "administrator") {
    return targetRole !== "owner";
  }

  return false;
}

export function getAssignableRoles(currentRole: AdminRole): AdminRole[] {
  const roles = [...ASSIGNABLE_ADMIN_ROLES];

  if (currentRole === "owner") {
    return ["owner", ...roles];
  }

  return roles;
}
