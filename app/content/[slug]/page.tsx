import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailLayout } from "@/components/content/content-detail-layout";
import {
  OfficialSourcesSection,
  RelatedContentSection,
} from "@/components/content/content-detail-sections";
import { KeyFactsPanel } from "@/components/content/key-facts-panel";
import { ShareBar } from "@/components/content/share-bar";
import { contentPath, contentTypeLabel } from "@/lib/content/routes";
import { formatDateOnly } from "@/lib/format/date";
import { getContentBySlug, getPublishedContent, getRelatedContent } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

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
  return content
    ? {
        title: content.title,
        description: content.description,
        alternates: { canonical: `/content/${content.slug}/` },
        openGraph: {
          type: "website",
          title: content.title,
          description: content.description,
          url: contentPath(content),
        },
        twitter: { card: "summary", title: content.title, description: content.description },
      }
    : {};
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content || content.contentType === "news") notFound();
  const related = await getRelatedContent(content);

  return (
    <ContentDetailLayout
      meta={
        <>
          <span>{contentTypeLabel(content.contentType)} · 加拿大移民志</span>
          <span>更新于：{formatDateOnly(content.updatedAt)}</span>
          <span>最后核验：{formatDateOnly(content.lastVerifiedAt)}</span>
        </>
      }
      title={content.title}
      description={content.description}
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
  );
}
