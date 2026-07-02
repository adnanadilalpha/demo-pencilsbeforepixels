import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Admin | Pencils Before Pixels",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-dvh bg-paper-50 font-sans text-navy-800 antialiased">
      {children}
    </div>
  );
}
