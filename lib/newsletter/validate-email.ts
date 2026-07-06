/** Shared newsletter email checks (client + server). */

const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "localhost",
  "invalid",
  "email.test",
]);

const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "dispostable.com",
  "dropmail.me",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "mytemp.email",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "throwaway.email",
  "trashmail.com",
  "trashmail.de",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

const BLOCKED_LOCAL_PARTS = new Set([
  "abc",
  "asdf",
  "dummy",
  "fake",
  "na",
  "none",
  "null",
  "qwerty",
  "sample",
  "spam",
  "temp",
  "test",
  "testing",
  "xxx",
]);

const DUMMY_LOCAL_RE =
  /^(?:test\d*|fake\d*|spam\d*|temp\d*|dummy\d*|sample\d*|asdf+|abc+|123+|foo\d*|bar\d*)$/;

const BLOCKED_ROLE_LOCALS = new Set([
  "donotreply",
  "do-not-reply",
  "noreply",
  "no-reply",
]);

export type NewsletterEmailRejectReason =
  | "invalid"
  | "disposable"
  | "dummy"
  | "role";

export type NewsletterEmailValidation =
  | { ok: true; email: string }
  | { ok: false; reason: NewsletterEmailRejectReason };

export function normalizeNewsletterEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateNewsletterEmail(raw: string): NewsletterEmailValidation {
  const email = normalizeNewsletterEmail(raw);

  if (!email || email.length > 254 || email.includes("..")) {
    return { ok: false, reason: "invalid" };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid" };
  }

  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const localBase = local.split("+")[0];

  if (BLOCKED_DOMAINS.has(domain) || domain.endsWith(".test") || domain.endsWith(".invalid")) {
    return { ok: false, reason: "dummy" };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "disposable" };
  }

  if (BLOCKED_ROLE_LOCALS.has(localBase)) {
    return { ok: false, reason: "role" };
  }

  if (
    BLOCKED_LOCAL_PARTS.has(localBase) ||
    DUMMY_LOCAL_RE.test(localBase) ||
    /^(.)\1{3,}$/.test(localBase)
  ) {
    return { ok: false, reason: "dummy" };
  }

  return { ok: true, email };
}

export function newsletterEmailErrorMessage(
  reason: NewsletterEmailRejectReason,
): string {
  switch (reason) {
    case "disposable":
      return "Temporary email addresses are not accepted. Please use an address you check regularly.";
    case "dummy":
      return "Please enter a real email address you use for communication.";
    case "role":
      return "Please use a personal email address, not a no-reply mailbox.";
    default:
      return "Please enter a valid email address.";
  }
}

/** @deprecated Use validateNewsletterEmail instead. */
export function isValidEmail(value: string): boolean {
  return validateNewsletterEmail(value).ok;
}
