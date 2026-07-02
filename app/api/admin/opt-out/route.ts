import { NextResponse } from "next/server";
import {
  fetchOptOutPageData,
  fetchOptOutSubmissionPayload,
} from "@/lib/admin/opt-out/fetch";
import { buildOptOutDocx, docxFilename } from "@/lib/opt-out/build-docx";
import { buildOptOutPdf, pdfFilename } from "@/lib/opt-out/build-pdf";
import type { OptOutLetterForm, OptOutSubmissionPayload } from "@/lib/opt-out/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchOptOutPageData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load submissions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing submission id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("opt_out_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data = await fetchOptOutPageData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    format?: "pdf" | "docx";
  };

  if (!body.id || !body.format) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const row = await fetchOptOutSubmissionPayload(body.id);
    if (!row?.payload) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    const payload = row.payload as OptOutSubmissionPayload;
    const letter = payload.letter as OptOutLetterForm | undefined;

    if (!letter) {
      return NextResponse.json({ error: "Letter data missing." }, { status: 404 });
    }

    if (body.format === "pdf") {
      const blob = buildOptOutPdf(letter);
      const buffer = Buffer.from(await blob.arrayBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${pdfFilename(letter.studentName)}"`,
        },
      });
    }

    const buffer = await buildOptOutDocx(letter);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${docxFilename(letter.studentName)}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to download letter.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
