import { NextResponse } from "next/server";
import { revalidateSiteContent } from "@/lib/cms/revalidate-site-content";
import {
  fetchContentEditorState,
  publishAllContent,
  publishContent,
  saveContentDraft,
} from "@/lib/admin/fetch-content-editor";
import type { ContentSavePayload } from "@/lib/admin/content-editor-types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
} as const;

function jsonNoStore<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
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
  return jsonNoStore(data);
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
    return jsonNoStore(data);
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
    return jsonNoStore(data);
  } catch (error) {
    console.error("Content publish failed:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
