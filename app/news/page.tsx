import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentBrowser } from "@/components/content/content-browser";
import { toContentListItem } from "@/lib/content/browser";
import { getPublishedContent } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "最新动态",
  description: "加拿大移民政策、项目规则和官方信息的最新动态。",
  alternates: { canonical: "/news/" },
  openGraph: { title: "最新动态", description: "加拿大移民政策、项目规则和官方信息的最新动态。" },
};

export default async function NewsIndexPage() {
  const content = (await getPublishedContent({ contentType: "news" })).map(toContentListItem);
  return (
    <Suspense fallback={<main className="mx-auto max-w-[900px] px-4 py-10">正在加载新闻…</main>}>
      <ContentBrowser
        content={content}
        fixedType="news"
        title="最新动态"
        description="浏览加拿大移民政策、项目规则和官方信息的最新动态。"
      />
    </Suspense>
  );
}
