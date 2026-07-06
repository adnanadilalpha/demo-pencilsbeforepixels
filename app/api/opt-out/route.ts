import { NextResponse, after } from "next/server";
import {
  findOptOutSchool,
  loadOptOutFormConfig,
  loadOptOutSchools,
} from "@/lib/opt-out/config";
import { createOptOutDownloadToken } from "@/lib/opt-out/access-token";
import { generateOptOutPackages } from "@/lib/opt-out/generate-packages";
import { persistOptOutCachedPackages } from "@/lib/opt-out/persist-packages";
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
      return NextResponse.json({ error: "Form data is required" }, { status: 400 });
    }

    const [schools, config] = await Promise.all([
      loadOptOutSchools(),
      loadOptOutFormConfig(),
    ]);
    const school = findOptOutSchool(schools, body.letter.schoolId);

    if (!school) {
      return NextResponse.json({ error: "Please select a school" }, { status: 400 });
    }

    const letter: OptOutLetterForm = {
      date: body.letter.date.trim(),
      studentName: body.letter.studentName.trim(),
      parentName: body.letter.parentName.trim(),
      address: body.letter.address?.trim() ?? "",
      homePhone: body.letter.homePhone?.trim() ?? "",
      workPhone: body.letter.workPhone?.trim() ?? "",
      signatureMode:
        body.letter.signatureMode === "draw" || body.letter.signatureMode === "name"
          ? body.letter.signatureMode
          : body.letter.signatureImage?.trim()
            ? "draw"
            : "name",
      signatureName: body.letter.signatureName?.trim() ?? "",
      signatureImage: body.letter.signatureImage?.trim() ?? "",
      schoolId: school.id,
      schoolName: school.schoolName,
      principalName: school.principalName,
      principalEmail: school.email,
    };

    const required: (keyof OptOutLetterForm)[] = [
      "date",
      "studentName",
      "parentName",
      "address",
      "schoolId",
    ];

    for (const field of required) {
      if (!letter[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    if (letter.signatureMode === "draw" && !letter.signatureImage) {
      return NextResponse.json({ error: "Please draw your signature." }, { status: 400 });
    }

    if (letter.signatureMode === "name" && !letter.signatureName) {
      return NextResponse.json({ error: "Please type your signature." }, { status: 400 });
    }

    const downloadToken = createOptOutDownloadToken();
    const payload: OptOutSubmissionPayload = {
      letter,
      defaultAnswers: config.defaultAnswers,
      metrics: {
        pdfDownloads: 0,
      },
      downloadToken,
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("opt_out_submissions")
      .insert({
        parent_name: letter.parentName,
        school: letter.schoolName,
        district: "Westside Community Schools",
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

    // Build the PDF after responding so submit stays fast; download
    // routes fall back to on-demand builds if the cache isn't ready yet.
    after(async () => {
      try {
        const cachedPackages = await generateOptOutPackages(letter, config);
        await persistOptOutCachedPackages(data.id, payload, cachedPackages);
      } catch (generationError) {
        console.error("Opt-out background package generation failed:", generationError);
      }
    });

    return NextResponse.json({ ok: true, id: data.id, downloadToken });
  } catch (err) {
    console.error("Opt-out submission error:", err);
    return NextResponse.json({ error: "Failed to generate form package" }, { status: 500 });
  }
}
