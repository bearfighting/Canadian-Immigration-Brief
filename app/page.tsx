import Link from "next/link";
import { HomeDiscoverySidebar } from "@/components/content/home-discovery-sidebar";
import { Card } from "@/components/ui/card";
import { toContentListItem } from "@/lib/content/browser";
import { getPublishedContent } from "@/lib/content/loader";
import { contentPath, contentTypeLabel } from "@/lib/content/routes";
import { formatDateOnly } from "@/lib/format/date";

export default async function HomePage() {
  const publishedContent = await getPublishedContent();
  const content = publishedContent.slice(0, 12);
  const programGuides = publishedContent
    .filter((item) => item.contentType === "program-guide")
    .map(toContentListItem);
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8">
      <section>
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent">
          看懂加拿大移民政策与现实
        </p>
        <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          加拿大移民信息简报
        </h1>
        <p className="text-xl text-muted-foreground">以中文解释政策变化、项目规则和官方信息。</p>
      </section>
      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,760px)_minmax(280px,320px)]">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">最新内容</h2>
          <div className="space-y-4">
            {content.map((item) => (
              <Card key={item.id}>
                <article>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {contentTypeLabel(item.contentType)} · {formatDateOnly(item.updatedAt)}
                  </p>
                  <h3 className="text-xl font-semibold">
                    <Link href={contentPath(item)}>{item.title}</Link>
                  </h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </article>
              </Card>
            ))}
          </div>
        </section>
        <HomeDiscoverySidebar programGuides={programGuides} />
      </div>
      <section className="mt-10" aria-labelledby="content-entrances">
        <h2 id="content-entrances" className="mb-4 text-2xl font-semibold">
          其他入口
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link className="rounded-xl border p-4 text-brand" href="/content/?q=学习许可">
            留学与工作
          </Link>
          <Link className="rounded-xl border p-4 text-brand" href="/content/?q=永久居民">
            永久居民
          </Link>
          <Link className="rounded-xl border p-4 text-brand" href="/data/">
            数据现况（建设中）
          </Link>
        </div>
      </section>
    </main>
  );
}
