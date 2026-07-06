import { NextResponse } from "next/server";
import { parseAdminDeleteIds } from "@/lib/admin/parse-delete-ids";
import {
  fetchOptOutPageData,
  fetchOptOutSubmissionPayload,
} from "@/lib/admin/opt-out/fetch";
import { packageFilename } from "@/lib/opt-out/filenames";
import { buildOptOutPackagePdf } from "@/lib/opt-out/build-package-pdf";
import { loadOptOutFormConfig } from "@/lib/opt-out/config";
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

  const ids = await parseAdminDeleteIds(request);
  if (!ids.length) {
    return NextResponse.json({ error: "Missing submission id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("opt_out_submissions")
    .delete()
    .in("id", ids);

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
  };

  if (!body.id) {
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
      return NextResponse.json({ error: "Form data missing." }, { status: 404 });
    }

    const config = await loadOptOutFormConfig();
    if (payload.defaultAnswers) {
      config.defaultAnswers = payload.defaultAnswers;
    }

    const buffer = await buildOptOutPackagePdf(letter, config);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${packageFilename(letter.studentName, "pdf")}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to download letter.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
