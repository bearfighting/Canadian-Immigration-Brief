import type { MetadataRoute } from "next";
import { getPublishedContent } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";
import { contentPath } from "@/lib/content/routes";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  return [
    { url: siteConfig.baseUrl },
    { url: siteConfig.baseUrl + "/content/" },
    { url: siteConfig.baseUrl + "/news/" },
    { url: siteConfig.baseUrl + "/data/" },
    { url: siteConfig.baseUrl + "/privacy/" },
    { url: siteConfig.baseUrl + "/disclaimer/" },
    { url: siteConfig.baseUrl + "/corrections/" },
    ...content.map((item) => ({
      url: siteConfig.baseUrl + contentPath(item),
      lastModified: item.updatedAt,
    })),
  ];
}
