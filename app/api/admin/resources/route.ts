import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchResourcesCatalog } from "@/lib/admin/resources/fetch";
import type { LibraryItemInput } from "@/lib/admin/resources/types";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return user;
}

async function nextLibrarySortOrder() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("library_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

function normalizeType(type: string | null): string | null {
  if (!type) return null;
  if (type === "research") return "research-papers";
  if (type === "pdfs") return "parent-resources";
  return type;
}

function isLibraryItemType(type: string) {
  return (
    type === "research-papers" ||
    type === "parent-resources" ||
    type === "books" ||
    type === "videos"
  );
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchResourcesCatalog();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load resources.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type?: string;
    data?: LibraryItemInput | Record<string, unknown>;
  };

  const type = normalizeType(body.type ?? null);
  const supabase = createAdminClient();

  try {
    if (type === "research-papers") {
      const input = body.data as LibraryItemInput;
      const { data, error } = await supabase
        .from("library_items")
        .insert({
          category: "Research Papers",
          title: input.title,
          subtitle: input.subtitle,
          kind: "paper",
          file_media_id: input.fileMediaId,
          visible: input.visible,
          sort_order: await nextLibrarySortOrder(),
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ id: data.id });
    }

    if (type === "parent-resources") {
      const input = body.data as LibraryItemInput;
      const { data, error } = await supabase
        .from("library_items")
        .insert({
          category: "Parent Resources",
          title: input.title,
          subtitle: input.subtitle,
          kind: "resource",
          file_media_id: input.fileMediaId,
          visible: input.visible,
          sort_order: await nextLibrarySortOrder(),
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ id: data.id });
    }

    if (type === "books") {
      const input = body.data as {
        title: string;
        author: string;
        coverMediaId: string | null;
        featured: boolean;
      };

      const { data, error } = await supabase
        .from("library_items")
        .insert({
          category: "Books",
          title: input.title,
          subtitle: input.author,
          kind: "book",
          image_media_id: input.coverMediaId,
          visible: true,
          sort_order: await nextLibrarySortOrder(),
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ id: data.id });
    }

    if (type === "videos") {
      const input = body.data as {
        title: string;
        description: string;
        youtubeId: string | null;
        videoMediaId: string | null;
        thumbnailMediaId: string | null;
        visible: boolean;
      };

      const externalUrl = input.youtubeId
        ? `https://www.youtube.com/watch?v=${input.youtubeId}`
        : null;

      const { data, error } = await supabase
        .from("library_items")
        .insert({
          category: "Videos",
          title: input.title,
          subtitle: input.description,
          kind: "video",
          image_media_id: input.thumbnailMediaId,
          external_url: externalUrl,
          video_media_id: input.videoMediaId,
          visible: input.visible,
          sort_order: await nextLibrarySortOrder(),
        })
        .select("id")
        .single();

      if (error) throw error;

      return NextResponse.json({ id: data.id });
    }

    return NextResponse.json({ error: "Unknown resource type." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create resource.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type?: string;
    id?: string;
    patch?: Record<string, unknown>;
  };

  const type = normalizeType(body.type ?? null);

  if (!type || !body.id || !body.patch) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    if (isLibraryItemType(type)) {
      const patch: Record<string, unknown> = {};

      if ("title" in body.patch) patch.title = body.patch.title;
      if ("visible" in body.patch) patch.visible = body.patch.visible;
      if ("published" in body.patch) patch.visible = body.patch.published;

      if (type === "research-papers" || type === "parent-resources") {
        if ("subtitle" in body.patch) patch.subtitle = body.patch.subtitle;
        if ("source" in body.patch) patch.subtitle = body.patch.source;
        if ("fileMediaId" in body.patch) {
          patch.file_media_id = body.patch.fileMediaId;
        }
      }

      if (type === "books") {
        if ("author" in body.patch) patch.subtitle = body.patch.author;
        if ("coverMediaId" in body.patch) patch.image_media_id = body.patch.coverMediaId;
      }

      if (type === "videos") {
        if ("description" in body.patch) patch.subtitle = body.patch.description;
        if ("thumbnailMediaId" in body.patch) {
          patch.image_media_id = body.patch.thumbnailMediaId;
        }
        if ("youtubeId" in body.patch) {
          const youtubeId = body.patch.youtubeId as string | null;
          patch.external_url = youtubeId
            ? `https://www.youtube.com/watch?v=${youtubeId}`
            : null;
          if (youtubeId) {
            patch.video_media_id = null;
          }
        }
        if ("videoMediaId" in body.patch) {
          patch.video_media_id = body.patch.videoMediaId;
          if (body.patch.videoMediaId) {
            patch.external_url = null;
          }
        }
      }

      const { error } = await supabase
        .from("library_items")
        .update(patch)
        .eq("id", body.id);

      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Unknown resource type." }, { status: 400 });
    }

    const catalog = await fetchResourcesCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update resource.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = normalizeType(searchParams.get("type"));
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id." }, { status: 400 });
  }

  if (!isLibraryItemType(type)) {
    return NextResponse.json({ error: "Unknown resource type." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("library_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const catalog = await fetchResourcesCatalog();
  return NextResponse.json(catalog);
}
