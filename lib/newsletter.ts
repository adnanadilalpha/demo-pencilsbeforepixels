import {
  newsletterEmailErrorMessage,
  validateNewsletterEmail,
} from "@/lib/newsletter/validate-email";

export {
  isValidEmail,
  newsletterEmailErrorMessage,
  normalizeNewsletterEmail,
  validateNewsletterEmail,
} from "@/lib/newsletter/validate-email";
export type { NewsletterEmailRejectReason } from "@/lib/newsletter/validate-email";

const STORAGE_KEY = "pbp-newsletter-subscribed";

export type NewsletterSubscribeStatus = "subscribed" | "already_subscribed";

export type NewsletterSubscribeResult = {
  email: string;
  status: NewsletterSubscribeStatus;
};

export const newsletterCopy = {
  invalidEmail: "Please enter a valid email address.",
  disposableEmail:
    "Temporary email addresses are not accepted. Please use an address you check regularly.",
  dummyEmail: "Please enter a real email address you use for communication.",
  genericError: "Something went wrong. Please try again.",
  alreadySubscribed:
    "This email is already on our list. If that isn't right, try another address below.",
  success:
    "You're on the list. We'll send evidence, local data, and practical tools for parents advocating for focus in the classroom.",
  successTitle: "You're on the list.",
  successBody:
    "We'll send evidence, local data, and practical tools for parents advocating for focus in the classroom.",
} as const;

export async function subscribeToNewsletter(
  email: string,
  source?: string,
  options?: { company?: string },
): Promise<NewsletterSubscribeResult> {
  const validation = validateNewsletterEmail(email);

  if (!validation.ok) {
    throw new Error(newsletterEmailErrorMessage(validation.reason));
  }

  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: validation.email,
      source,
      company: options?.company ?? "",
    }),
  });

  const body = (await res.json().catch(() => null)) as {
    error?: string;
    status?: NewsletterSubscribeStatus;
  } | null;

  if (!res.ok) {
    throw new Error(body?.error ?? newsletterCopy.genericError);
  }

  const status = body?.status ?? "subscribed";

  if (status === "subscribed") {
    markNewsletterSubscribed();
  }

  return { email: validation.email, status };
}

export function hasNewsletterSubscription() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function markNewsletterSubscribed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "true");
}
