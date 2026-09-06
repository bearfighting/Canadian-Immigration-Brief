import fs from "node:fs";
import path from "node:path";

const outputRoot = path.join(process.cwd(), "out");
const htmlFiles = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}

if (!fs.existsSync(outputRoot)) throw new Error("out/ 不存在，请先运行 pnpm build");
collect(outputRoot);

const requiredFiles = [
  "index.html",
  "news/index.html",
  "content/index.html",
  "data/index.html",
  "privacy/index.html",
  "disclaimer/index.html",
  "corrections/index.html",
  "404.html",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(outputRoot, relative))) throw new Error(`缺少静态文件：${relative}`);
}

const html = htmlFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["sample-draft", "sample-policy-update"]) {
  if (html.includes(forbidden)) throw new Error(`草稿出现在静态输出：${forbidden}`);
}

function routeForFile(file) {
  const relative = path.relative(outputRoot, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"/index.html".length)}/`;
  return `/${relative}`;
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
let baseUrl;
try {
  baseUrl = new URL(configuredBaseUrl || "http://localhost:3000").toString().replace(/\/$/, "");
} catch {
  throw new Error("静态审计的站点 URL 无效：NEXT_PUBLIC_SITE_URL");
}
const newsDetailRoutes = [];
for (const file of htmlFiles) {
  if (path.basename(file) === "404.html") continue;
  const page = fs.readFileSync(file, "utf8");
  const route = routeForFile(file);
  if (route === "/404/") continue;
  if (!/<title>[^<]+<\/title>/.test(page)) throw new Error(`页面缺少 title：${route}`);
  if (!/<meta name="description" content="[^"]+"\/>/.test(page)) {
    throw new Error(`页面缺少 description：${route}`);
  }
  const canonical = page.match(/<link rel="canonical" href="([^"]+)"\/>/)?.[1];
  const expectedCanonical = route.startsWith("/programs/")
    ? `${baseUrl}/content/${route.slice("/programs/".length)}`
    : `${baseUrl}${route}`;
  if (canonical !== expectedCanonical) {
    throw new Error(
      `canonical 错误：${route} 应为 ${expectedCanonical}，实际为 ${canonical ?? "缺失"}`,
    );
  }
  if (route.startsWith("/news/") && route !== "/news/") {
    const jsonLd = [...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (match) => JSON.parse(match[1]),
    );
    const newsArticle = jsonLd.flat().find((item) => item["@type"] === "NewsArticle");
    const types = jsonLd.flat().map((item) => item["@type"]);
    if (!types.includes("NewsArticle") || !types.includes("BreadcrumbList")) {
      throw new Error(`新闻页缺少 JSON-LD：${route}`);
    }
    if (
      !newsArticle?.headline ||
      !newsArticle.description ||
      !newsArticle.datePublished ||
      !newsArticle.dateModified ||
      !newsArticle.author ||
      !newsArticle.publisher ||
      newsArticle.url !== `${baseUrl}${route}`
    ) {
      throw new Error(`新闻页 NewsArticle 字段不完整：${route}`);
    }
    newsDetailRoutes.push(route);
  }
  const isContentDetail =
    (route.startsWith("/news/") && route !== "/news/") ||
    (route.startsWith("/content/") && route !== "/content/");
  if (isContentDetail) {
    if (!page.includes("分享本文")) throw new Error(`详情页缺少分享工具条：${route}`);
    for (const provider of [
      "https://www.facebook.com/sharer/sharer.php?u=",
      "https://x.com/intent/tweet?text=",
      "https://wa.me/?text=",
      "https://t.me/share/url?url=",
      "https://www.linkedin.com/sharing/share-offsite/?url=",
      "https://service.weibo.com/share/share.php?url=",
    ]) {
      if (!page.includes(provider)) throw new Error(`详情页缺少分享平台链接：${route} ${provider}`);
    }
  }
}

function targetFile(href) {
  const clean = href.split(/[?#]/, 1)[0];
  if (clean === "/") return path.join(outputRoot, "index.html");
  if (clean.endsWith("/")) return path.join(outputRoot, clean.slice(1), "index.html");
  return path.join(outputRoot, clean.slice(1));
}

const links = [...html.matchAll(/(?:href|content)="(\/[^"]*)"/g)].map((match) => match[1]);
for (const href of links) {
  if (href.startsWith("/_next/") || href.startsWith("//") || href.includes("#")) continue;
  if (!fs.existsSync(targetFile(href))) throw new Error(`站内链接无目标：${href}`);
}

const rss = fs.readFileSync(path.join(outputRoot, "rss.xml"), "utf8");
const sitemap = fs.readFileSync(path.join(outputRoot, "sitemap.xml"), "utf8");
if (rss.includes("sample-") || sitemap.includes("sample-"))
  throw new Error("RSS 或 sitemap 包含草稿");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.some((url) => url.includes("?") || url.includes("&")))
  throw new Error("sitemap URL 包含查询参数或未预期的转义");
for (const requiredUrl of ["/privacy/", "/disclaimer/", "/corrections/"]) {
  if (!sitemapUrls.includes(`${baseUrl}${requiredUrl}`)) {
    throw new Error(`sitemap 缺少说明页面：${requiredUrl}`);
  }
}
for (const route of newsDetailRoutes) {
  if (!sitemapUrls.includes(`${baseUrl}${route}`)) {
    throw new Error(`sitemap 缺少新闻详情页：${route}`);
  }
}
const rssItemUrls = [...rss.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g)].map(
  (match) => match[1],
);
const expectedNewsUrls = newsDetailRoutes.map((route) => `${baseUrl}${route}`);
const rssNewsUrls = rssItemUrls.filter((url) => url.startsWith(`${baseUrl}/news/`));
if (
  rssNewsUrls.length !== expectedNewsUrls.length ||
  expectedNewsUrls.some((url) => !rssNewsUrls.includes(url)) ||
  rssNewsUrls.some((url) => !expectedNewsUrls.includes(url))
) {
  throw new Error("RSS 中的公开新闻集合与静态新闻详情页不一致");
}

console.log(
  `静态输出审计通过：${htmlFiles.length} 个 HTML 文件，${newsDetailRoutes.length} 个新闻详情页，${links.length} 个站内链接`,
);
