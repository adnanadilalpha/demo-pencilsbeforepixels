export type AdminRole = "owner" | "administrator" | "editor" | "viewer";

export type AdminMemberStatus = "owner" | "active" | "pending";

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminMemberStatus;
  lastLoginAt: string | null;
  canDelete: boolean;
};

export type AdminsPageData = {
  admins: AdminMember[];
  currentUserId: string;
  currentUserRole: AdminRole;
  canManage: boolean;
};

export type CreateAdminPayload = {
  displayName: string;
  email: string;
  password: string;
  role: AdminRole;
};
