const MAX_BULK_DELETE = 500;

export async function parseAdminDeleteIds(request: Request): Promise<string[]> {
  const singleId = new URL(request.url).searchParams.get("id")?.trim();
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > 0) {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      const ids = body.ids
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
        .slice(0, MAX_BULK_DELETE);

      if (ids.length > 0) return ids;
    }
  }

  return singleId ? [singleId] : [];
}
