import path from "node:path";
import { describe, expect, it } from "vitest";
import { createContentSchema, type Content } from "@/lib/validation/content";
import { getPublishedContent, parseMarkdown, validateContentGraph } from "@/lib/content/loader";
import { renderRss } from "@/lib/seo/rss";
import { formatDateOnly } from "@/lib/format/date";
import type { PublicContent } from "@/lib/content/public";
import { filterAndPaginateContent, type ContentListItem } from "@/lib/content/browser";
import { redirects } from "@/lib/redirects";
import { createShareLinks } from "@/lib/share";

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

  it("orders published content by update date, publication date, then ID", async () => {
    const news = await getPublishedContent({ contentType: "news" });
    expect(news[0]?.slug).toBe("express-entry-physicians-draw-september-2026");
    expect(news.at(-1)?.slug).toBe("express-entry-2026-new-categories");
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

  it("validates legacy internal redirect configuration", () => {
    expect(redirects).toEqual([
      {
        from: "/programs/bc-pnp-skilled-worker/",
        to: "/content/bc-pnp-skilled-worker/",
      },
    ]);
  });

  it("encodes article share links without changing the canonical URL", () => {
    const links = createShareLinks(
      "https://example.com/news/医生类别/",
      "医生类别更新",
      "政策摘要 & 说明",
    );
    expect(links.facebook).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fnews%2F%E5%8C%BB%E7%94%9F%E7%B1%BB%E5%88%AB%2F",
    );
    expect(links.x).toContain("https://x.com/intent/tweet?text=");
    expect(links.x).toContain(
      "&url=https%3A%2F%2Fexample.com%2Fnews%2F%E5%8C%BB%E7%94%9F%E7%B1%BB%E5%88%AB%2F",
    );
    expect(links.whatsapp).toContain("https://wa.me/?text=");
    expect(links.telegram).toContain("https://t.me/share/url?url=");
    expect(links.linkedin).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
    expect(links.weibo).toContain("https://service.weibo.com/share/share.php?url=");
    expect(links.weibo).toContain("&title=%E5%8C%BB%E7%94%9F%E7%B1%BB%E5%88%AB%E6%9B%B4%E6%96%B0");
  });
});

describe("content browser", () => {
  const content = Array.from(
    { length: 11 },
    (_, index) =>
      ({
        id: `item-${index}`,
        title: index === 10 ? "医生类别更新" : `公开内容 ${index}`,
        description: index === 10 ? "医生相关政策摘要" : "普通摘要",
        slug: `item-${index}`,
        contentType: index === 10 ? "policy-explainer" : "news",
        updatedAt: new Date("2026-09-05"),
        policyStatus: index === 10 ? "announced" : "effective",
        jurisdictions: index === 10 ? ["federal"] : ["bc"],
        programs: index === 10 ? ["express-entry"] : [],
      }) as ContentListItem,
  );

  it("returns at most ten items and clamps pages", () => {
    expect(filterAndPaginateContent(content).items).toHaveLength(10);
    expect(filterAndPaginateContent(content, { page: 2 }).items).toHaveLength(1);
    expect(filterAndPaginateContent(content, { page: 99 }).page).toBe(2);
    expect(filterAndPaginateContent(content, { page: 0 }).page).toBe(1);
  });

  it("combines type, province, program, status and title search filters", () => {
    const result = filterAndPaginateContent(content, {
      type: "policy-explainer",
      province: "federal",
      program: "express-entry",
      status: "announced",
      query: "医生",
    });
    expect(result.totalItems).toBe(1);
    expect(result.items[0]?.id).toBe("item-10");
  });

  it("includes a project guide when filtering by its own project ID", () => {
    const guide = {
      ...content[0],
      id: "express-entry",
      contentType: "program-guide",
      programs: [],
    } as ContentListItem;
    const result = filterAndPaginateContent([guide], { program: "express-entry" });
    expect(result.totalItems).toBe(1);
    expect(result.items[0]?.id).toBe("express-entry");
  });

  it("returns an empty result without producing an invalid page", () => {
    const result = filterAndPaginateContent(content, { query: "不存在" });
    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.page).toBe(1);
  });
});
