import { NextResponse } from "next/server";
import {
  parseBookCoverProcessOptions,
} from "@/lib/admin/book-cover-process";
import {
  reprocessBookCoverMedia,
  uploadMediaAsset,
} from "@/lib/admin/media-storage";
import { touchAssetsRevision } from "@/lib/cms/assets-revision";
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
  const folderValue = formData.get("folder");
  if (typeof folderValue !== "string" || !folderValue.trim()) {
    return NextResponse.json({ error: "Folder is required." }, { status: 400 });
  }

  const folder = folderValue.trim();
  const filename = formData.get("filename");
  const replaceStoragePath = formData.get("replaceStoragePath");
  const altText = formData.get("altText");
  const title = formData.get("title");
  const reprocessUrl = formData.get("reprocessUrl");
  const bookCover = parseBookCoverProcessOptions(formData, folder);

  try {
    const media =
      typeof reprocessUrl === "string" && reprocessUrl.trim()
        ? await reprocessBookCoverMedia(reprocessUrl.trim(), {
            folder,
            filename: typeof filename === "string" ? filename : undefined,
            replaceStoragePath:
              typeof replaceStoragePath === "string" ? replaceStoragePath : undefined,
            altText: typeof altText === "string" ? altText : undefined,
            title: typeof title === "string" ? title : undefined,
            userId: user.id,
            bookCover,
          })
        : await (async () => {
            const file = formData.get("file");
            if (!(file instanceof File)) {
              throw new Error("File is required.");
            }

            return uploadMediaAsset(file, {
              folder,
              filename: typeof filename === "string" ? filename : undefined,
              replaceStoragePath:
                typeof replaceStoragePath === "string" ? replaceStoragePath : undefined,
              altText: typeof altText === "string" ? altText : undefined,
              title: typeof title === "string" ? title : undefined,
              userId: user.id,
              bookCover,
            });
          })();

    await touchAssetsRevision();

    return NextResponse.json(media);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
