"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminModal,
  AdminModalActions,
  AdminModalField,
} from "@/components/admin/resources/AdminModal";
import { adminInputClass } from "@/components/admin/admin-styles";
import {
  ADMIN_ROLE_LABELS,
  getAssignableRoles,
} from "@/lib/admin/admins/roles";
import type { AdminRole } from "@/lib/admin/admins/types";
import { cn } from "@/lib/utils";

type AddAdminModalProps = {
  open: boolean;
  currentUserRole: AdminRole;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    displayName: string;
    email: string;
    password: string;
    role: AdminRole;
  }) => void;
};

export function AddAdminModal({
  open,
  currentUserRole,
  saving = false,
  error = null,
  onClose,
  onSubmit,
}: AddAdminModalProps) {
  const roleOptions = useMemo(
    () => getAssignableRoles(currentUserRole),
    [currentUserRole],
  );

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AdminRole>(
    roleOptions.includes("administrator")
      ? "administrator"
      : roleOptions[0] ?? "viewer",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const reset = () => {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole(
      roleOptions.includes("administrator")
        ? "administrator"
        : roleOptions[0] ?? "viewer",
    );
    setValidationError(null);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setValidationError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError(null);
    onSubmit({
      displayName: trimmedName,
      email: trimmedEmail,
      password,
      role,
    });
  };

  const displayError = validationError ?? error;

  useEffect(() => {
    if (open) return;

    setDisplayName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole(
      roleOptions.includes("administrator")
        ? "administrator"
        : roleOptions[0] ?? "viewer",
    );
    setValidationError(null);
  }, [open, roleOptions]);

  return (
    <AdminModal
      open={open}
      title="Add admin"
      onClose={handleClose}
      footer={
        <AdminModalActions
          onCancel={handleClose}
          onSave={handleSubmit}
          saveLabel="Add admin"
          saving={saving}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <AdminModalField label="Full name">
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="e.g. Sarah Jones"
            className={cn(adminInputClass, "h-10 rounded-[10px] px-3")}
            autoComplete="name"
          />
        </AdminModalField>

        <AdminModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            className={cn(adminInputClass, "h-10 rounded-[10px] px-3")}
            autoComplete="email"
          />
        </AdminModalField>

        <AdminModalField label="Password">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Set a password"
            className={cn(adminInputClass, "h-10 rounded-[10px] px-3")}
            autoComplete="new-password"
          />
        </AdminModalField>

        <AdminModalField label="Confirm password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
            className={cn(adminInputClass, "h-10 rounded-[10px] px-3")}
            autoComplete="new-password"
          />
        </AdminModalField>

        <AdminModalField label="Role">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className={cn(
              adminInputClass,
              "h-10 rounded-[10px] px-3 text-sm text-navy-800",
            )}
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {ADMIN_ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </AdminModalField>

        {displayError ? (
          <p className="text-sm text-red-600" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
