import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentBrowser } from "@/components/content/content-browser";
import { toContentListItem } from "@/lib/content/browser";
import { getPublishedContent } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "全部内容",
  description: "浏览加拿大移民新闻、政策解释、项目指南和省级概览。",
  alternates: { canonical: "/content/" },
};

export default async function ContentIndexPage() {
  const content = (await getPublishedContent()).map(toContentListItem);
  return (
    <Suspense fallback={<main className="mx-auto max-w-[900px] px-4 py-10">正在加载内容…</main>}>
      <ContentBrowser
        content={content}
        title="全部内容"
        description="按栏目、地区、项目、政策状态或关键词查找已公开内容。"
      />
    </Suspense>
  );
}
