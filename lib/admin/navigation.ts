import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Mail,
  Monitor,
  ScrollText,
  Settings,
  Users,
  Video,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media", href: "/admin/media", icon: FolderOpen },
  { label: "Research", href: "/admin/research", icon: ScrollText },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Videos", href: "/admin/videos", icon: Video },
  { label: "Software", href: "/admin/software", icon: Monitor },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Opt Out", href: "/admin/opt-out", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
