const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (process.env.NODE_ENV === "production") {
  if (!configuredBaseUrl) throw new Error("生产构建必须设置 NEXT_PUBLIC_SITE_URL");
  const url = new URL(configuredBaseUrl);
  if (url.protocol !== "https:") throw new Error("生产站点 URL 必须使用 HTTPS");
}

export const siteConfig = {
  name: "加拿大移民信息简报",
  tagline: "看懂加拿大移民政策与现实",
  baseUrl: (configuredBaseUrl ?? "http://localhost:3000").replace(/\/$/, ""),
};
