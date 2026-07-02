import type { AdminMember, AdminMemberStatus, AdminRole } from "./types";

export function formatRoleLabel(role: AdminRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "administrator":
      return "Administrator";
    case "editor":
      return "Editor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}

export function resolveAdminStatus(
  role: AdminRole,
  lastLoginAt: string | null,
): AdminMemberStatus {
  if (role === "owner") return "owner";
  if (!lastLoginAt) return "pending";
  return "active";
}

export function formatLastActive(
  lastLoginAt: string | null,
  now = new Date(),
): string {
  if (!lastLoginAt) return "Never";

  const date = new Date(lastLoginAt);
  if (Number.isNaN(date.getTime())) return "Never";

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);

    return `Today, ${time}`;
  }

  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getAdminInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();
}

export function getAdminAvatarClass(role: AdminRole): string {
  return role === "owner" ? "bg-navy-800" : "bg-[#5a6a8a]";
}

export function sortAdmins(admins: AdminMember[]): AdminMember[] {
  const roleOrder: Record<AdminRole, number> = {
    owner: 0,
    administrator: 1,
    editor: 2,
    viewer: 3,
  };

  return [...admins].sort((a, b) => {
    const roleDiff = roleOrder[a.role] - roleOrder[b.role];
    if (roleDiff !== 0) return roleDiff;

    return a.name.localeCompare(b.name);
  });
}
