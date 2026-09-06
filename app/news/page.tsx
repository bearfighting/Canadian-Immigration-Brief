import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentBrowser } from "@/components/content/content-browser";
import { ContentListCard } from "@/components/content/content-list-card";
import { toContentListItem, type ContentListItem } from "@/lib/content/browser";
import { getPublishedContent } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "最新动态",
  description: "加拿大移民政策、项目规则和官方信息的最新动态。",
  alternates: { canonical: "/news/" },
  openGraph: { title: "最新动态", description: "加拿大移民政策、项目规则和官方信息的最新动态。" },
};

function StaticNewsArchive({ content }: { content: ContentListItem[] }) {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">内容浏览</p>
      <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">最新动态</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        浏览加拿大移民政策、项目规则和官方信息的最新动态。
      </p>
      <p className="mt-8 text-sm text-muted-foreground">以下为公开新闻列表。</p>
      <ul className="mt-4 space-y-4">
        {content.map((item) => (
          <ContentListCard key={item.id} item={item} />
        ))}
      </ul>
    </main>
  );
}

export default async function NewsIndexPage() {
  const content = (await getPublishedContent({ contentType: "news" })).map(toContentListItem);
  return (
    <Suspense fallback={<StaticNewsArchive content={content} />}>
      <ContentBrowser
        content={content}
        fixedType="news"
        title="最新动态"
        description="浏览加拿大移民政策、项目规则和官方信息的最新动态。"
      />
    </Suspense>
  );
}
