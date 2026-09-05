import type { PublicContent } from "@/lib/content/public";

export function contentPath(content: Pick<PublicContent, "contentType" | "slug">): string {
  if (content.contentType === "news") return `/news/${content.slug}/`;
  return `/content/${content.slug}/`;
}

export function contentTypeLabel(contentType: PublicContent["contentType"]): string {
  const labels: Record<PublicContent["contentType"], string> = {
    news: "新闻",
    "policy-explainer": "政策解释",
    "program-guide": "项目指南",
    "data-analysis": "数据分析",
    "weekly-brief": "周报",
    "legal-case": "法律案例",
  };
  return labels[contentType];
}
