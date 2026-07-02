"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminLogo } from "@/components/admin/AdminLogo";
import {
  adminCardClass,
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg">
      <form
        className={cn(adminCardClass, "flex flex-col")}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col items-center gap-8">
          <AdminLogo />
          <p className="text-base leading-relaxed text-navy-800/70">Welcome back</p>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className={adminLabelClass}>
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={adminInputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className={adminLabelClass}>
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={adminInputClass}
              placeholder="Enter your password"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn("w-full", isSubmitting && "opacity-80")}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>

          <p className="text-center text-sm leading-relaxed text-navy-800/70">
            Click Sign In to enter the CMS
          </p>
        </div>
      </form>
    </div>
  );
}
