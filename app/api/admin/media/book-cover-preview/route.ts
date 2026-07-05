import { NextResponse } from "next/server";
import {
  normalizeBookCoverImage,
  parseBookCoverProcessOptions,
  readImageBytesFromUrl,
} from "@/lib/admin/book-cover-process";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const folder = "library";
  const bookCover = parseBookCoverProcessOptions(formData, folder) ?? {
    removeBackground: true,
    resizeToCanvas: true,
  };

  try {
    const file = formData.get("file");
    const sourceUrl = formData.get("sourceUrl");

    let source: Buffer;
    if (file instanceof File) {
      source = Buffer.from(await file.arrayBuffer());
    } else if (typeof sourceUrl === "string" && sourceUrl.trim()) {
      source = await readImageBytesFromUrl(sourceUrl.trim());
    } else {
      return NextResponse.json({ error: "Image source is required." }, { status: 400 });
    }

    const preview = await normalizeBookCoverImage(source, {
      removeBackground: true,
      resizeToCanvas: bookCover.resizeToCanvas ?? true,
    });

    return new NextResponse(new Uint8Array(preview), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preview failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
