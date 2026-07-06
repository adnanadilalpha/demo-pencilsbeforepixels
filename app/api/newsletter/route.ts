import { NextResponse } from "next/server";
import {
  newsletterEmailErrorMessage,
  validateNewsletterEmail,
} from "@/lib/newsletter/validate-email";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const HOURLY_LIMIT = 5;

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`newsletter:${clientIp}`, HOURLY_LIMIT, 60 * 60 * 1000);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.retryAfterSeconds ?? 60);
    }

    const body = (await request.json()) as {
      email?: string;
      source?: string;
      company?: string;
    };

    // Honeypot — bots fill hidden fields; pretend success so they do not adapt.
    if (body.company?.trim()) {
      return NextResponse.json({ ok: true, status: "subscribed" });
    }

    const validation = validateNewsletterEmail(body.email ?? "");
    if (!validation.ok) {
      return NextResponse.json(
        { error: newsletterEmailErrorMessage(validation.reason) },
        { status: 400 },
      );
    }

    const email = validation.email;
    const perEmailLimit = checkRateLimit(
      `newsletter-email:${email}`,
      3,
      60 * 60 * 1000,
    );
    if (!perEmailLimit.ok) {
      return rateLimitResponse(perEmailLimit.retryAfterSeconds ?? 60);
    }

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("newsletter_subscribers")
      .select("email, status")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Newsletter lookup error:", lookupError);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    if (existing) {
      if (existing.status === "unsubscribed") {
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            status: "active",
            source: body.source ?? "website",
            subscribed_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (updateError) {
          console.error("Newsletter reactivate error:", updateError);
          return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, status: "subscribed" });
      }

      return NextResponse.json({ ok: true, status: "already_subscribed" });
    }

    const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
      email,
      source: body.source ?? "website",
      status: "active",
    });

    if (insertError) {
      console.error("Newsletter insert error:", insertError);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "subscribed" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
