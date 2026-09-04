import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getPublishedContent } from "@/lib/content/loader";

export default async function HomePage() {
  const content = await getPublishedContent({ contentType: "news" });
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-8">
      <section className="max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent">
          看懂加拿大移民政策与现实
        </p>
        <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          加拿大移民信息简报
        </h1>
        <p className="text-xl text-muted-foreground">以中文解释政策变化、项目规则和官方信息。</p>
      </section>
      <section className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-2xl font-semibold">最新内容</h2>
        <div className="space-y-4">
          {content.map((item) => (
            <Card key={item.id}>
              <article>
                <p className="mb-2 text-sm text-muted-foreground">
                  {item.contentType} · {item.updatedAt.toLocaleDateString("zh-CN")}
                </p>
                <h3 className="text-xl font-semibold">
                  <Link href={`/news/${item.slug}/`}>{item.title}</Link>
                </h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </article>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
