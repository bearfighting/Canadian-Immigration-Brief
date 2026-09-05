import type { MetadataRoute } from "next";
import { getPublishedContent } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";
import { contentPath } from "@/lib/content/routes";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  return [
    { url: siteConfig.baseUrl },
    ...content.map((item) => ({
      url: siteConfig.baseUrl + contentPath(item),
      lastModified: item.updatedAt,
    })),
  ];
}
