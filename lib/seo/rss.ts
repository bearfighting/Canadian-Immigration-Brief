import type { PublicContent } from "@/lib/content/public";
import { contentPath } from "@/lib/content/routes";

function escapeXml(value: string) {
  const entities: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  };
  return value.replace(/[<>&'"]/g, (character) => entities[character] ?? character);
}

export function renderRss(items: PublicContent[], baseUrl: string) {
  const entries = items
    .map(
      (item) =>
        '<item><guid isPermaLink="true">' +
        escapeXml(baseUrl + contentPath(item)) +
        "</guid><title>" +
        escapeXml(item.title) +
        "</title><link>" +
        escapeXml(baseUrl + contentPath(item)) +
        "</link><description>" +
        escapeXml(item.description) +
        "</description>" +
        (item.publishedAt ? "<pubDate>" + item.publishedAt.toUTCString() + "</pubDate>" : "") +
        "</item>",
    )
    .join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0"><channel><title>加拿大移民志</title><link>' +
    escapeXml(baseUrl) +
    "</link><description>看懂加拿大移民政策与现实</description>" +
    entries +
    "</channel></rss>"
  );
}
