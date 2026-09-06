type SiteEnvironment = {
  configuredBaseUrl?: string;
  vercelProjectProductionUrl?: string;
  vercelUrl?: string;
};

function optionalEnvironmentValue(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function resolveBaseUrl(
  { configuredBaseUrl, vercelProjectProductionUrl, vercelUrl }: SiteEnvironment = {
    configuredBaseUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    vercelUrl: process.env.VERCEL_URL,
  },
): string {
  const explicitUrl = optionalEnvironmentValue(configuredBaseUrl);
  const projectUrl = optionalEnvironmentValue(vercelProjectProductionUrl);
  const deploymentUrl = optionalEnvironmentValue(vercelUrl);
  const rawBaseUrl =
    explicitUrl ??
    (projectUrl
      ? `https://${projectUrl}`
      : deploymentUrl
        ? `https://${deploymentUrl}`
        : "http://localhost:3000");

  return new URL(rawBaseUrl).toString().replace(/\/$/, "");
}

const configuredBaseUrl = optionalEnvironmentValue(process.env.NEXT_PUBLIC_SITE_URL);
const vercelBaseUrl = optionalEnvironmentValue(
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
);
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
  name: "加拿大移民志",
  tagline: "看懂加拿大移民政策与现实",
  baseUrl: resolvedBaseUrl,
};
