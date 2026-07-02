"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AddAdminModal } from "@/components/admin/admins/AddAdminModal";
import { AdminsList } from "@/components/admin/admins/AdminsList";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AdminMember, AdminRole, AdminsPageData } from "@/lib/admin/admins/types";
import { createClient } from "@/lib/supabase/client";

type AdminsViewProps = {
  initialData: AdminsPageData;
};

export function AdminsView({ initialData }: AdminsViewProps) {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/admins", { cache: "no-store" });
    if (!response.ok) return;
    const next = (await response.json()) as AdminsPageData;
    setData(next);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-members")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_profiles" },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const handleCreate = async (payload: {
    displayName: string;
    email: string;
    password: string;
    role: AdminRole;
  }) => {
    setSaving(true);
    setActionError(null);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to add admin.");
      }

      const next = (await response.json()) as AdminsPageData;
      setData(next);
      setModalOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to add admin.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const deletedId = pendingDelete.id;
    setBusyId(deletedId);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/admin/admins?id=${encodeURIComponent(deletedId)}`,
        { method: "DELETE", cache: "no-store" },
      );

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete admin.");
      }

      const body = (await response.json()) as
        | AdminsPageData
        | { deletedId: string; refreshError?: string };

      if ("admins" in body) {
        setData(body);
      } else {
        setData((current) => ({
          ...current,
          admins: current.admins.filter((admin) => admin.id !== body.deletedId),
        }));
      }

      setPendingDelete(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete admin.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Admins"
          description="Manage admin access to this panel."
        />

        {data.canManage ? (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500 bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" aria-hidden />
            Add admin
          </button>
        ) : null}
      </div>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      <AdminsList
        admins={data.admins}
        busyId={busyId}
        onDelete={data.canManage ? setPendingDelete : undefined}
      />

      <AddAdminModal
        open={modalOpen}
        currentUserRole={data.currentUserRole}
        saving={saving}
        error={actionError}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setActionError(null);
        }}
        onSubmit={(payload) => void handleCreate(payload)}
      />

      <AdminConfirmDeleteModal
        open={pendingDelete !== null}
        title="Delete admin"
        itemName={pendingDelete?.name ?? "this admin"}
        confirming={busyId !== null && pendingDelete?.id === busyId}
        onClose={() => {
          if (busyId) return;
          setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
