type SiteEnvironment = {
  configuredBaseUrl?: string;
  vercelProjectProductionUrl?: string;
  vercelUrl?: string;
};

export function resolveBaseUrl(
  { configuredBaseUrl, vercelProjectProductionUrl, vercelUrl }: SiteEnvironment = {
    configuredBaseUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    vercelUrl: process.env.VERCEL_URL,
  },
): string {
  const rawBaseUrl =
    configuredBaseUrl ??
    (vercelProjectProductionUrl
      ? `https://${vercelProjectProductionUrl}`
      : vercelUrl
        ? `https://${vercelUrl}`
        : "http://localhost:3000");

  return new URL(rawBaseUrl).toString().replace(/\/$/, "");
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;
const vercelBaseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const resolvedBaseUrl = resolveBaseUrl();
const isLocalFallback = !configuredBaseUrl && !vercelBaseUrl;

if (
  process.env.NODE_ENV === "production" &&
  !isLocalFallback &&
  new URL(resolvedBaseUrl).protocol !== "https:"
) {
  throw new Error("生产站点 URL 必须使用 HTTPS");
}

export const siteConfig = {
  name: "加拿大移民信息简报",
  tagline: "看懂加拿大移民政策与现实",
  baseUrl: resolvedBaseUrl,
};
