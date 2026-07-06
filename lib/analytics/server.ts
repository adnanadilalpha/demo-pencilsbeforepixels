import "server-only";

import { createHash } from "node:crypto";
import {
  isLocalHostname,
  isServerLocalAnalyticsEnabled,
} from "@/lib/analytics/env";

const ID_PATTERN = /^[a-z0-9-]{16,64}$/i;

export function isValidAnalyticsId(value: string | undefined): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function getHashSalt(): string {
  return (
    process.env.ANALYTICS_HASH_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 24) ||
    "pbp-analytics"
  );
}

export function hashVisitorKey(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${getHashSalt()}`)
    .digest("hex")
    .slice(0, 32);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "";
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    ""
  );
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;

  const normalized = ip.toLowerCase();

  if (normalized === "::1" || normalized === "127.0.0.1" || normalized === "0.0.0.0") {
    return true;
  }

  if (normalized.startsWith("10.")) return true;
  if (normalized.startsWith("192.168.")) return true;

  const match = /^172\.(\d+)\./.exec(normalized);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }

  return false;
}

function isLocalRequest(request: Request): boolean {
  const host = (request.headers.get("host") ?? "").split(":")[0] ?? "";
  if (host && isLocalHostname(host)) {
    return true;
  }

  const ip = getClientIp(request);
  return isPrivateIp(ip);
}

/** Skip dev machines unless ANALYTICS_ENABLE_LOCAL=true. */
export function shouldRecordAnalytics(request: Request): boolean {
  if (isServerLocalAnalyticsEnabled()) {
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    return false;
  }

  return !isLocalRequest(request);
}

export type RequestGeo = {
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

function decodeGeoHeader(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

function geoFromHeaders(request: Request): RequestGeo {
  const countryCode =
    request.headers.get("x-vercel-ip-country")?.trim() ||
    request.headers.get("cf-ipcountry")?.trim() ||
    null;

  const region = decodeGeoHeader(
    request.headers.get("x-vercel-ip-country-region"),
  );

  const city = decodeGeoHeader(request.headers.get("x-vercel-ip-city"));

  return {
    countryCode: countryCode ? countryCode.toUpperCase() : null,
    region,
    city,
  };
}

/** GA-style IP geolocation when edge headers are unavailable (e.g. local npm start). */
async function lookupGeoFromIp(ip: string): Promise<RequestGeo> {
  try {
    const query = ip && !isPrivateIp(ip) ? encodeURIComponent(ip) : "";
    const url = query
      ? `http://ip-api.com/json/${query}?fields=status,countryCode,regionName,city`
      : "http://ip-api.com/json/?fields=status,countryCode,regionName,city";

    const response = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (!response.ok) {
      return { countryCode: null, region: null, city: null };
    }

    const data = (await response.json()) as {
      status?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
    };

    if (data.status !== "success" || !data.countryCode) {
      return { countryCode: null, region: null, city: null };
    }

    return {
      countryCode: data.countryCode.toUpperCase(),
      region: data.regionName ?? null,
      city: data.city ?? null,
    };
  } catch {
    return { countryCode: null, region: null, city: null };
  }
}

export async function getRequestGeo(request: Request): Promise<RequestGeo> {
  const fromHeaders = geoFromHeaders(request);
  if (fromHeaders.countryCode) {
    return fromHeaders;
  }

  const ip = getClientIp(request);
  const fromIp = await lookupGeoFromIp(ip);
  if (fromIp.countryCode) {
    return fromIp;
  }

  return fromHeaders;
}

export type RequestAnalyticsContext = RequestGeo & {
  visitorKey: string;
  shouldRecord: boolean;
};

export async function getRequestAnalyticsContext(
  request: Request,
): Promise<RequestAnalyticsContext> {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "";
  const geo = await getRequestGeo(request);
  const visitorSeed = ip || request.headers.get("host") || "unknown";

  return {
    ...geo,
    visitorKey: hashVisitorKey(visitorSeed, userAgent),
    shouldRecord: shouldRecordAnalytics(request),
  };
}
