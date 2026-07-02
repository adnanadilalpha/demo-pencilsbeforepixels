import { NextResponse } from "next/server";
import { buildOptOutDocx, docxFilename } from "@/lib/opt-out/build-docx";
import type { OptOutLetterForm } from "@/lib/opt-out/types";
import { getVerifiedOptOutPayload } from "@/lib/opt-out/verify-access";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

const HOURLY_LIMIT = 60;

export async function GET(request: Request, context: RouteContext) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`opt-out:docx:${clientIp}`, HOURLY_LIMIT, 60 * 60 * 1000);
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
      return NextResponse.json({ error: "Letter data missing" }, { status: 400 });
    }

    const buffer = await buildOptOutDocx(letter);
    const filename = docxFilename(letter.studentName);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
  }
}
