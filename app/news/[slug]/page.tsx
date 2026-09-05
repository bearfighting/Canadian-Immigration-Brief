import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyStatusBadge } from "@/components/content/policy-status-badge";
import { KeyFactsPanel } from "@/components/content/key-facts-panel";
import { OfficialSourceCard } from "@/components/content/official-source-card";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { formatDateOnly } from "@/lib/format/date";
import {
  getContentById,
  getContentBySlug,
  getPublishedContent,
  getRelatedContent,
} from "@/lib/content/loader";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublishedContent({ contentType: "news" })).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug, { contentType: "news" });
  return content
    ? {
        title: content.title,
        description: content.description,
        alternates: { canonical: `/news/${content.slug}/` },
        openGraph: { type: "article", publishedTime: content.publishedAt?.toISOString() },
      }
    : {};
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContentBySlug(slug, { contentType: "news" });
  if (!content) notFound();
  const replacement = content.supersededBy
    ? await getContentById(content.supersededBy, { contentType: "news" })
    : undefined;
  const related = await getRelatedContent(content, { contentType: "news" });
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <article className="mx-auto max-w-[760px]">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>新闻 · 加拿大移民信息简报</span>
          <PolicyStatusBadge status={content.policyStatus} />
          <span>发布于：{formatDateOnly(content.publishedAt)}</span>
          <span>最后核验：{formatDateOnly(content.lastVerifiedAt)}</span>
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">{content.description}</p>
        {content.supersededBy && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">
            本内容已被更新版本替代，请查看{" "}
            {replacement ? (
              <Link href={`/news/${replacement.slug}/`}>{replacement.title}</Link>
            ) : (
              "最新内容"
            )}
            。
          </p>
        )}
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
                  <Link href={`/news/${item.slug}/`}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: content.title,
              description: content.description,
              datePublished: content.publishedAt?.toISOString(),
              dateModified: content.updatedAt.toISOString(),
              url: siteConfig.baseUrl + "/news/" + content.slug + "/",
              author: { "@type": "Organization", name: siteConfig.name },
              publisher: { "@type": "Organization", name: siteConfig.name },
              mainEntityOfPage: siteConfig.baseUrl + "/news/" + content.slug + "/",
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "首页", item: siteConfig.baseUrl },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "新闻",
                  item: siteConfig.baseUrl + "/news/",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: content.title,
                  item: siteConfig.baseUrl + "/news/" + content.slug + "/",
                },
              ],
            },
          ]),
        }}
      />
    </main>
  );
}
