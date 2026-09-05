import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KeyFactsPanel } from "@/components/content/key-facts-panel";
import { OfficialSourceCard } from "@/components/content/official-source-card";
import { contentPath, contentTypeLabel } from "@/lib/content/routes";
import { formatDateOnly } from "@/lib/format/date";
import { getContentBySlug, getPublishedContent, getRelatedContent } from "@/lib/content/loader";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublishedContent())
    .filter((item) => item.contentType !== "news")
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  return content ? { title: content.title, description: content.description } : {};
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content || content.contentType === "news") notFound();
  const related = await getRelatedContent(content);

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <article className="mx-auto max-w-[760px]">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{contentTypeLabel(content.contentType)} · 加拿大移民信息简报</span>
          <span>更新于：{formatDateOnly(content.updatedAt)}</span>
          <span>最后核验：{formatDateOnly(content.lastVerifiedAt)}</span>
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">{content.description}</p>
        <KeyFactsPanel content={content} />
        <div
          className="prose mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
        <section className="mt-10 rounded-xl border bg-surface-muted p-5" aria-labelledby="sources">
          <h2 id="sources" className="text-lg font-semibold">
            官方来源
          </h2>
          <ul className="mt-3 space-y-3">
            {content.officialSources.map((source) => (
              <OfficialSourceCard key={source.id} source={source} />
            ))}
          </ul>
        </section>
        {related.length > 0 && (
          <section className="mt-10" aria-labelledby="related">
            <h2 id="related" className="text-lg font-semibold">
              相关内容
            </h2>
            <ul className="mt-3 list-disc pl-6">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={contentPath(item)}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
