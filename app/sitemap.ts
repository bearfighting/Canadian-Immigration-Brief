import type { MetadataRoute } from "next";
import { getPublishedContent } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent({ contentType: "news" });
  return [
    { url: siteConfig.baseUrl },
    ...content.map((item) => ({
      url: siteConfig.baseUrl + "/news/" + item.slug + "/",
      lastModified: item.updatedAt,
    })),
  ];
}
