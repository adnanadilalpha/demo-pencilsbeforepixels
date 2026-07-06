import { NextResponse } from "next/server";
import { getVerifiedOptOutPayload } from "@/lib/opt-out/verify-access";
import type { OptOutSubmissionPayload } from "@/lib/opt-out/types";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

const HOURLY_LIMIT = 60;

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`opt-out:patch:${clientIp}`, HOURLY_LIMIT, 60 * 60 * 1000);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.retryAfterSeconds ?? 60);
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: string;
      downloadToken?: string;
    };

    if (body.action !== "download") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const payload = await getVerifiedOptOutPayload(id, body.downloadToken);
    if (!payload) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const pdfDownloads = (payload.metrics?.pdfDownloads ?? 0) + 1;
    const now = new Date().toISOString();
    const updatedPayload: OptOutSubmissionPayload = {
      ...payload,
      metrics: {
        pdfDownloads,
        lastDownloadAt: now,
      },
    };

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("opt_out_submissions")
      .update({
        status: "downloaded",
        downloaded_at: now,
        payload: updatedPayload,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Opt-out update error:", updateError);
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, metrics: updatedPayload.metrics });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
