import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentDetailLayout } from "@/components/content/content-detail-layout";
import {
  OfficialSourcesSection,
  RelatedContentSection,
} from "@/components/content/content-detail-sections";
import { KeyFactsPanel } from "@/components/content/key-facts-panel";
import { PolicyStatusBadge } from "@/components/content/policy-status-badge";
import { ShareBar } from "@/components/content/share-bar";
import { contentPath } from "@/lib/content/routes";
import { formatDateOnly } from "@/lib/format/date";
import {
  getContentById,
  getContentBySlug,
  getPublishedContent,
  getRelatedContent,
} from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

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
        openGraph: {
          type: "article",
          title: content.title,
          description: content.description,
          url: contentPath(content),
          publishedTime: content.publishedAt?.toISOString(),
        },
        twitter: { card: "summary", title: content.title, description: content.description },
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
    <>
      <ContentDetailLayout
        meta={
          <>
            <span>新闻 · 加拿大移民信息简报</span>
            <PolicyStatusBadge status={content.policyStatus} />
            <span>发布于：{formatDateOnly(content.publishedAt)}</span>
            <span>最后核验：{formatDateOnly(content.lastVerifiedAt)}</span>
          </>
        }
        title={content.title}
        description={content.description}
        notice={
          content.supersededBy ? (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900">
              本内容已被更新版本替代，请查看{" "}
              {replacement ? (
                <Link href={`/news/${replacement.slug}/`}>{replacement.title}</Link>
              ) : (
                "最新内容"
              )}
              。
            </p>
          ) : undefined
        }
        body={
          <div
            className="prose mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        }
        facts={<KeyFactsPanel content={content} />}
        share={
          <ShareBar
            url={siteConfig.baseUrl + contentPath(content)}
            title={content.title}
            description={content.description}
          />
        }
        sources={<OfficialSourcesSection sources={content.officialSources} />}
        related={<RelatedContentSection items={related} />}
      />
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
    </>
  );
}
