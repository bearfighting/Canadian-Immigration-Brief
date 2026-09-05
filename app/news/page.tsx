import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getPublishedContent } from "@/lib/content/loader";
import { formatDateOnly } from "@/lib/format/date";

export const metadata: Metadata = {
  title: "最新动态",
  description: "加拿大移民政策、项目规则和官方信息的最新动态。",
  alternates: { canonical: "/news/" },
  openGraph: { title: "最新动态", description: "加拿大移民政策、项目规则和官方信息的最新动态。" },
};

export default async function NewsIndexPage() {
  const content = await getPublishedContent({ contentType: "news" });
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <section className="mx-auto max-w-[760px]">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">新闻</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">最新动态</h1>
        <div className="mt-8 space-y-4">
          {content.map((item) => (
            <Card key={item.id}>
              <p className="text-sm text-muted-foreground">{formatDateOnly(item.updatedAt)}</p>
              <h2 className="mt-2 text-xl font-semibold">
                <Link href={`/news/${item.slug}/`}>{item.title}</Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
