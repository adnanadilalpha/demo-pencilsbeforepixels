import { NextResponse, after } from "next/server";
import { buildOptOutPackagePdf } from "@/lib/opt-out/build-package-pdf";
import { loadOptOutFormConfig } from "@/lib/opt-out/config";
import { packageFilename } from "@/lib/opt-out/filenames";
import { readCachedOptOutPackage } from "@/lib/opt-out/generate-packages";
import { persistOptOutCachedPackage } from "@/lib/opt-out/persist-packages";
import type { OptOutLetterForm } from "@/lib/opt-out/types";
import { getVerifiedOptOutPayload } from "@/lib/opt-out/verify-access";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

const HOURLY_LIMIT = 60;

export async function GET(request: Request, context: RouteContext) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`opt-out:pdf:${clientIp}`, HOURLY_LIMIT, 60 * 60 * 1000);
    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit.retryAfterSeconds ?? 60);
    }

    const { id } = await context.params;
    const token = new URL(request.url).searchParams.get("token");
    const payload = await getVerifiedOptOutPayload(id, token);

    if (!payload) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const letter = payload.letter as OptOutLetterForm | undefined;
    if (!letter) {
      return NextResponse.json({ error: "Form data missing" }, { status: 400 });
    }

    let buffer = readCachedOptOutPackage(payload.cachedPackages);

    if (!buffer) {
      const config = await loadOptOutFormConfig();
      config.defaultAnswers = payload.defaultAnswers ?? config.defaultAnswers;
      const built = await buildOptOutPackagePdf(letter, config);
      buffer = built;
      after(() =>
        persistOptOutCachedPackage(id, payload, built).catch(() => {}),
      );
    }

    const filename = packageFilename(letter.studentName, "pdf");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("PDF download error:", err);
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
