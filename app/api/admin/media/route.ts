import { NextResponse } from "next/server";
import { uploadMediaAsset } from "@/lib/admin/media-storage";
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
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const folder = formData.get("folder");
  if (typeof folder !== "string" || !folder.trim()) {
    return NextResponse.json({ error: "Folder is required." }, { status: 400 });
  }

  const filename = formData.get("filename");
  const replaceStoragePath = formData.get("replaceStoragePath");
  const altText = formData.get("altText");
  const title = formData.get("title");

  try {
    const media = await uploadMediaAsset(file, {
      folder: folder.trim(),
      filename: typeof filename === "string" ? filename : undefined,
      replaceStoragePath:
        typeof replaceStoragePath === "string" ? replaceStoragePath : undefined,
      altText: typeof altText === "string" ? altText : undefined,
      title: typeof title === "string" ? title : undefined,
      userId: user.id,
    });

    return NextResponse.json(media);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
