import path from "node:path";
import { describe, expect, it } from "vitest";
import { createContentSchema, type Content } from "@/lib/validation/content";
import { getPublishedContent, parseMarkdown, validateContentGraph } from "@/lib/content/loader";
import { renderRss } from "@/lib/seo/rss";
import { formatDateOnly } from "@/lib/format/date";
import type { PublicContent } from "@/lib/content/public";

const contentSchema = createContentSchema(new Date("2026-09-04T23:59:59.000Z"));

const valid = {
  id: "test-news",
  title: "测试内容",
  description: "测试摘要",
  slug: "test-news",
  contentType: "news",
  language: "zh-CN",
  publicationStatus: "published",
  author: "加拿大移民信息简报",
  editor: "project-owner",
  publishedAt: "2026-09-04",
  updatedAt: "2026-09-04",
  lastVerifiedAt: "2026-09-04",
  policyStatus: "announced",
  jurisdictions: ["federal"],
  topics: ["permanent-residence"],
  programs: [],
  audiences: ["pr-candidate"],
  officialSources: [
    {
      id: "source",
      title: "Official",
      url: "https://www.canada.ca/example",
      language: "en",
      accessedAt: "2026-09-04",
    },
  ],
  review: { status: "approved", reviewer: "owner", reviewedAt: "2026-09-04" },
  body: "<p>正文</p>",
};

describe("content schema", () => {
  it("accepts approved content with an HTTPS source", () => {
    expect(contentSchema.parse(valid).publicationStatus).toBe("published");
  });

  it("requires an audit record for approved content", () => {
    expect(() =>
      contentSchema.parse({
        ...valid,
        review: { status: "approved", reviewer: null, reviewedAt: null },
      }),
    ).toThrow();
  });

  it("rejects non-HTTPS sources", () => {
    expect(() =>
      contentSchema.parse({
        ...valid,
        officialSources: [{ ...valid.officialSources[0], url: "http://example.com" }],
      }),
    ).toThrow();
  });

  it("rejects sources outside the official domain allowlist", () => {
    expect(() =>
      contentSchema.parse({
        ...valid,
        officialSources: [{ ...valid.officialSources[0], url: "https://example.com/source" }],
      }),
    ).toThrow();
  });

  it("rejects malformed slugs", () => {
    expect(() => contentSchema.parse({ ...valid, slug: "Invalid Slug" })).toThrow();
  });

  it("requires metadata for project guides", () => {
    expect(() => contentSchema.parse({ ...valid, contentType: "program-guide" })).toThrow();
  });

  it("rejects a future verification date", () => {
    expect(() =>
      contentSchema.parse({ ...valid, lastVerifiedAt: new Date(Date.now() + 86_400_000) }),
    ).toThrow();
  });

  it("rejects the invalid Markdown fixture", async () => {
    await expect(
      parseMarkdown(path.join(process.cwd(), "tests/fixtures/invalid-content.md")),
    ).rejects.toThrow();
  });

  it("rejects values outside the controlled vocabulary", () => {
    expect(() => contentSchema.parse({ ...valid, jurisdictions: ["unknown-region"] })).toThrow();
  });

  it("rejects self-referencing content relations", () => {
    expect(() => contentSchema.parse({ ...valid, relatedContentIds: [valid.id] })).toThrow();
  });

  it("validates program references against project guides", () => {
    const article = contentSchema.parse({ ...valid, programs: ["express-entry"] });
    const guide = contentSchema.parse({
      ...valid,
      id: "express-entry",
      slug: "express-entry",
      contentType: "program-guide",
      publicationStatus: "draft",
      programs: [],
      officialSources: [],
      review: { status: "pending", reviewer: null, reviewedAt: null },
      officialName: "Example Program",
      programStatus: "unknown",
      guideVersion: "draft",
    });
    expect(() => validateContentGraph([article, guide])).not.toThrow();
    expect(() => validateContentGraph([article])).toThrow();
  });

  it("rejects a cyclic version relationship", () => {
    const makeContent = (id: string, slug: string, supersedes?: string, supersededBy?: string) =>
      contentSchema.parse({ ...valid, id, slug, supersedes, supersededBy });
    const a = makeContent("a", "a", "c", "b");
    const b = makeContent("b", "b", "a", "c");
    const c = makeContent("c", "c", "b", "a");
    expect(() => validateContentGraph([a, b, c] as Content[])).toThrow();
  });

  it("rejects version relationships across content types", () => {
    const news = contentSchema.parse({ ...valid, supersedes: "guide", supersededBy: undefined });
    const guide = contentSchema.parse({
      ...valid,
      id: "guide",
      slug: "guide",
      contentType: "program-guide",
      publicationStatus: "draft",
      supersededBy: "test-news",
      programs: [],
      officialSources: [],
      review: { status: "pending", reviewer: null, reviewedAt: null },
      officialName: "Example Program",
      programStatus: "unknown",
      guideVersion: "draft",
    });
    expect(() => validateContentGraph([news, guide])).toThrow();
  });

  it("does not expose draft content in the published collection", async () => {
    const published = await getPublishedContent();
    expect(published.some((item) => item.slug === "sample-draft")).toBe(false);
    expect(published.some((item) => item.slug === "sample-policy-update")).toBe(false);
  });

  it("filters published content by content type", async () => {
    const news = await getPublishedContent({ contentType: "news" });
    expect(news.every((item) => item.contentType === "news")).toBe(true);
    expect(news.some((item) => item.contentType === "program-guide")).toBe(false);
  });

  it("accepts every documented topic", () => {
    const topics = [
      "visitor",
      "study-permit",
      "work-permit",
      "permanent-residence",
      "family-sponsorship",
      "citizenship",
      "refugee-humanitarian",
      "settlement",
      "enforcement",
    ];
    expect(() => contentSchema.parse({ ...valid, topics })).not.toThrow();
  });

  it("escapes RSS XML values", () => {
    const rss = renderRss(
      [{ slug: "safe-item", title: "A & B", description: "<测试>" } as PublicContent],
      "https://example.com",
    );
    expect(rss).toContain("A &amp; B");
    expect(rss).toContain("&lt;测试&gt;");
  });

  it("uses public paths for non-news RSS items", () => {
    const rss = renderRss(
      [
        {
          slug: "guide",
          contentType: "program-guide",
          title: "指南",
          description: "摘要",
        } as PublicContent,
      ],
      "https://example.com",
    );
    expect(rss).toContain("https://example.com/content/guide/");
    expect(rss).not.toContain("https://example.com/news/guide/");
  });

  it("formats calendar dates without timezone drift", () => {
    expect(formatDateOnly(new Date("2026-09-01"))).toBe("2026/9/1");
  });
});
