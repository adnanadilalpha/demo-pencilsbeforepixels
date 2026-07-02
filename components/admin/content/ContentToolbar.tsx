"use client";

import { ExternalLink, Upload } from "lucide-react";
import type { ContentPageId } from "@/lib/admin/content-config";
import { cn } from "@/lib/utils";

type ContentToolbarProps = {
  page: ContentPageId;
  onPageChange: (page: ContentPageId) => void;
  onPublish: () => void;
  publishing: boolean;
  publishMessage?: { type: "error" | "success"; text: string } | null;
};

export function ContentToolbar({
  page,
  onPageChange,
  onPublish,
  publishing,
  publishMessage,
}: ContentToolbarProps) {
  return (
    <div className="border-b border-navy-800/8 bg-white px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <PageTab
          active={page === "homepage"}
          onClick={() => onPageChange("homepage")}
        >
          Homepage
        </PageTab>
        <PageTab active={page === "site"} onClick={() => onPageChange("site")}>
          Site
        </PageTab>
        <PageTab
          active={page === "evidence"}
          onClick={() => onPageChange("evidence")}
        >
          Evidence Dashboard
        </PageTab>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={
            page === "homepage" ? "/" : page === "evidence" ? "/evidence" : "/"
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-white px-3 py-1.5 text-xs font-medium text-navy-800 transition-colors hover:bg-paper-50"
        >
          <ExternalLink className="size-3.5" />
          Preview
        </a>
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500 bg-gold-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#c26d05] disabled:opacity-60"
        >
          <Upload className="size-3.5" />
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
      </div>

      {publishMessage ? (
        <p
          className={cn(
            "mt-2 text-xs",
            publishMessage.type === "error"
              ? "text-red-600"
              : "text-emerald-700",
          )}
          role={publishMessage.type === "error" ? "alert" : "status"}
        >
          {publishMessage.text}
        </p>
      ) : null}
    </div>
  );
}

function PageTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-navy-800 text-white"
          : "text-body-muted hover:bg-paper-50 hover:text-navy-800",
      )}
    >
      {children}
    </button>
  );
}
