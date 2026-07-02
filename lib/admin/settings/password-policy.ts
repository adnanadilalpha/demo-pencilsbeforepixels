import type { PasswordPolicySettings } from "@/lib/admin/settings/types";

export function validatePasswordAgainstPolicy(
  password: string,
  policy: PasswordPolicySettings,
): string | null {
  if (policy.minLength && password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }

  if (policy.requireNumber && !/[0-9]/.test(password)) {
    return "Password must include a number.";
  }

  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a special character.";
  }

  return null;
}
