import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentDetailLayout } from "@/components/content/content-detail-layout";
import {
  OfficialSourcesSection,
  RelatedContentSection,
} from "@/components/content/content-detail-sections";
import { KeyFactsPanel } from "@/components/content/key-facts-panel";
import { ShareBar } from "@/components/content/share-bar";
import { contentPath } from "@/lib/content/routes";
import { getReaderNotice } from "@/lib/content/reader-notice";
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
          url: siteConfig.baseUrl + contentPath(content),
          publishedTime: content.publishedAt?.toISOString(),
          modifiedTime: content.updatedAt.toISOString(),
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
  const readerNotice = getReaderNotice(content);
  const notice = readerNotice ? (
    <aside
      className={
        readerNotice.tone === "warning"
          ? "mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900"
          : "mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-base text-blue-900"
      }
      aria-label="文章提示"
    >
      {readerNotice.kind === "superseded" ? (
        <p>
          {replacement ? (
            <>
              本文内容已被更新版本替代，请查看{" "}
              <Link href={`/news/${replacement.slug}/`}>{replacement.title}</Link>。
            </>
          ) : (
            readerNotice.title
          )}
        </p>
      ) : readerNotice.kind === "not-yet-effective" ? (
        <p>
          {readerNotice.title} 生效日期：{formatDateOnly(readerNotice.effectiveAt)}。
        </p>
      ) : (
        <>
          <p>{readerNotice.title}</p>
          <p className="mt-1">{readerNotice.description}</p>
        </>
      )}
    </aside>
  ) : undefined;

  return (
    <>
      <ContentDetailLayout
        meta={
          <>
            <span>新闻 · 加拿大移民信息简报</span>
            <span>发布于：{formatDateOnly(content.publishedAt)}</span>
          </>
        }
        title={content.title}
        description={content.description}
        notice={notice}
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
              url: siteConfig.baseUrl + contentPath(content),
              author: { "@type": "Organization", name: siteConfig.name },
              publisher: { "@type": "Organization", name: siteConfig.name },
              mainEntityOfPage: siteConfig.baseUrl + contentPath(content),
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
                  item: siteConfig.baseUrl + contentPath(content),
                },
              ],
            },
          ]),
        }}
      />
    </>
  );
}
