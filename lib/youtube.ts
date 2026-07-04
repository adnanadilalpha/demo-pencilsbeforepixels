export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) {
        return fromQuery;
      }

      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeYouTubeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const videoId = parseYouTubeVideoId(trimmed);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return trimmed;
}

export function youTubeUrlToId(stored: string | null | undefined): string | null {
  if (!stored) return null;
  return parseYouTubeVideoId(stored);
}

export function formatYouTubeLinkForEditor(
  stored: string | null | undefined,
): string {
  if (!stored) return "";
  return normalizeYouTubeUrl(stored);
}

export function youTubeEmbedParams(autoplay = true): URLSearchParams {
  return new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    cc_load_policy: "0",
    iv_load_policy: "3",
    enablejsapi: "1",
  });
}

export function youTubeEmbedUrl(
  videoId: string,
  autoplay = true,
  origin?: string,
): string {
  const params = youTubeEmbedParams(autoplay);
  if (origin) {
    params.set("origin", origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function disableYouTubeCaptions(iframe: HTMLIFrameElement) {
  const commands = [
    { func: "unloadModule", args: ["captions"] },
    { func: "setOption", args: ["captions", "track", {}] },
    { func: "setOption", args: ["captions", "reload", true] },
  ] as const;

  for (const { func, args } of commands) {
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }
}
