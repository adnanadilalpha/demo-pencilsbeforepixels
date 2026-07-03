import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  fetchContentEditorState,
  publishAllContent,
  publishContent,
  saveContentDraft,
} from "@/lib/admin/fetch-content-editor";
import type { ContentSavePayload } from "@/lib/admin/content-editor-types";
import { createClient } from "@/lib/supabase/server";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function revalidateSiteContent() {
  revalidateTag("site-content", "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/evidence");
  revalidatePath("/research");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchContentEditorState();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ContentSavePayload;

  try {
    const data = await saveContentDraft(payload);
    revalidateSiteContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Content save failed:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    sections?: ContentSavePayload[];
  };

  if (body.action !== "publish") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  try {
    const data =
      body.sections && body.sections.length > 0
        ? await publishAllContent(user.id, body.sections)
        : await publishContent(user.id);

    revalidateSiteContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Content publish failed:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
