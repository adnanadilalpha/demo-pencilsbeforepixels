import { NextResponse } from "next/server";
import { createOptOutDownloadToken } from "@/lib/opt-out/access-token";
import type { OptOutLetterForm, OptOutSubmissionPayload } from "@/lib/opt-out/types";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const HOURLY_LIMIT = 20;

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`opt-out:create:${clientIp}`, HOURLY_LIMIT, 60 * 60 * 1000);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.retryAfterSeconds ?? 60);
    }

    const body = (await request.json()) as { letter?: OptOutLetterForm };

    if (!body.letter) {
      return NextResponse.json({ error: "Letter data is required" }, { status: 400 });
    }

    const letter: OptOutLetterForm = {
      ...body.letter,
      childName: body.letter.childName.trim() || body.letter.studentName.trim(),
    };

    const required: (keyof OptOutLetterForm)[] = [
      "date",
      "studentName",
      "recipientName",
      "parentName",
      "stateTestName",
    ];

    for (const field of required) {
      if (!letter[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const downloadToken = createOptOutDownloadToken();
    const payload: OptOutSubmissionPayload = {
      letter,
      metrics: {
        pdfDownloads: 0,
        docxDownloads: 0,
      },
      downloadToken,
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("opt_out_submissions")
      .insert({
        parent_name: letter.parentName,
        school: letter.school || null,
        district: letter.district || null,
        status: "generated",
        generated_at: new Date().toISOString(),
        payload,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Opt-out insert error:", error);
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id, downloadToken });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
