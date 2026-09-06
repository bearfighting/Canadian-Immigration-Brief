import type { Content } from "@/lib/validation/content";

export type PublicContent = Pick<
  Content,
  | "id"
  | "title"
  | "description"
  | "slug"
  | "contentType"
  | "language"
  | "publishedAt"
  | "announcedAt"
  | "eventAt"
  | "updatedAt"
  | "lastVerifiedAt"
  | "policyStatus"
  | "importance"
  | "jurisdictions"
  | "topics"
  | "programs"
  | "audiences"
  | "effectiveAt"
  | "officialSources"
  | "supplementarySources"
  | "relatedContentIds"
  | "supersedes"
  | "supersededBy"
  | "body"
>;

export function toPublicContent(content: Content): PublicContent {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    slug: content.slug,
    contentType: content.contentType,
    language: content.language,
    publishedAt: content.publishedAt,
    announcedAt: content.announcedAt,
    eventAt: content.eventAt,
    updatedAt: content.updatedAt,
    lastVerifiedAt: content.lastVerifiedAt,
    policyStatus: content.policyStatus,
    importance: content.importance,
    jurisdictions: content.jurisdictions,
    topics: content.topics,
    programs: content.programs,
    audiences: content.audiences,
    effectiveAt: content.effectiveAt,
    officialSources: content.officialSources,
    supplementarySources: content.supplementarySources,
    relatedContentIds: content.relatedContentIds,
    supersedes: content.supersedes,
    supersededBy: content.supersededBy,
    body: content.body,
  };
}
