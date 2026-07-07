function isValidYouTubeVideoId(id: string | undefined | null): id is string {
  return Boolean(id && /^[a-zA-Z0-9_-]{11}$/.test(id));
}

function parseYouTubeTimeValue(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);

  const secondsOnly = value.match(/^(\d+)s$/i);
  if (secondsOnly) return Number(secondsOnly[1]);

  let total = 0;
  const hours = value.match(/(\d+)h/i);
  const minutes = value.match(/(\d+)m/i);
  const seconds = value.match(/(\d+)s/i);

  if (hours) total += Number(hours[1]) * 3600;
  if (minutes) total += Number(minutes[1]) * 60;
  if (seconds) total += Number(seconds[1]);

  return total > 0 ? total : null;
}

export function parseYouTubeStartSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
    return raw ? parseYouTubeTimeValue(raw) : null;
  } catch {
    return null;
  }
}

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
      return isValidYouTubeVideoId(id) ? id : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const fromQuery = url.searchParams.get("v");
      if (isValidYouTubeVideoId(fromQuery)) {
        return fromQuery;
      }

      const pathPatterns = [
        /\/embed\/([a-zA-Z0-9_-]{11})/,
        /\/shorts\/([a-zA-Z0-9_-]{11})/,
        /\/live\/([a-zA-Z0-9_-]{11})/,
        /\/v\/([a-zA-Z0-9_-]{11})/,
      ];

      for (const pattern of pathPatterns) {
        const match = url.pathname.match(pattern);
        if (isValidYouTubeVideoId(match?.[1])) {
          return match[1];
        }
      }
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
    const start = parseYouTubeStartSeconds(trimmed);
    const base = `https://www.youtube.com/watch?v=${videoId}`;
    return start && start > 0 ? `${base}&t=${start}` : base;
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
  startSeconds?: number | null,
): string {
  const params = youTubeEmbedParams(autoplay);
  if (origin) {
    params.set("origin", origin);
  }
  if (startSeconds && startSeconds > 0) {
    params.set("start", String(startSeconds));
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
