import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Scores", href: "/admin/scores", icon: BarChart3 },
  { label: "Resources", href: "/admin/resources", icon: FolderOpen },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Device Opt Out", href: "/admin/opt-out", icon: ClipboardList },
  { label: "Admins", href: "/admin/admins", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
