import { getPublishedContent } from "@/lib/content/loader";
import { renderRss } from "@/lib/seo/rss";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const xml = renderRss(await getPublishedContent({ contentType: "news" }), siteConfig.baseUrl);
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
