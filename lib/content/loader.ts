import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { toPublicContent, type PublicContent } from "@/lib/content/public";
import { createContentSchema, type Content } from "@/lib/validation/content";

const contentRoot = path.join(process.cwd(), "content");

function markdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(fullPath)
      : entry.name.endsWith(".md")
        ? [fullPath]
        : [];
  });
}

export async function parseMarkdown(
  filePath: string,
  referenceDate = new Date(),
): Promise<Content> {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const body = String(
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(parsed.content),
  );
  return createContentSchema(referenceDate).parse({ ...parsed.data, body });
}

export async function getAllContent(): Promise<Content[]> {
  const referenceDate = new Date();
  const content = await Promise.all(
    markdownFiles(contentRoot).map((filePath) => parseMarkdown(filePath, referenceDate)),
  );
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const sourceIds = new Set<string>();
  for (const item of content) {
    if (ids.has(item.id)) throw new Error("重复内容 ID：" + item.id);
    if (slugs.has(item.slug)) throw new Error("重复内容 slug：" + item.slug);
    for (const source of [...item.officialSources, ...item.supplementarySources]) {
      if (sourceIds.has(source.id)) throw new Error("重复来源 ID：" + source.id);
      sourceIds.add(source.id);
    }
    ids.add(item.id);
    slugs.add(item.slug);
  }
  validateContentGraph(content);
  return content;
}

export function validateContentGraph(content: Content[]): void {
  const ids = new Set<string>();
  for (const item of content) {
    if (ids.has(item.id)) throw new Error("重复内容 ID：" + item.id);
    ids.add(item.id);
  }
  const contentById = new Map(content.map((item) => [item.id, item]));
  for (const item of content) {
    for (const programId of item.programs) {
      const program = contentById.get(programId);
      if (!program || program.contentType !== "program-guide") {
        throw new Error("项目引用必须指向项目指南：" + programId);
      }
    }
    for (const relatedId of item.relatedContentIds) {
      if (!contentById.has(relatedId)) throw new Error("无效的相关内容引用：" + relatedId);
    }
    for (const relation of [item.supersedes, item.supersededBy]) {
      if (relation && !contentById.has(relation))
        throw new Error("无效的版本关系引用：" + relation);
    }
    if (item.supersededBy && contentById.get(item.supersededBy)?.supersedes !== item.id) {
      throw new Error("supersededBy 与目标内容的 supersedes 不一致：" + item.id);
    }
    if (item.supersedes && contentById.get(item.supersedes)?.supersededBy !== item.id) {
      throw new Error("supersedes 与目标内容的 supersededBy 不一致：" + item.id);
    }
    for (const relation of [item.supersedes, item.supersededBy]) {
      if (relation && contentById.get(relation)?.contentType !== item.contentType) {
        throw new Error("版本关系两端必须属于同一种内容类型：" + item.id);
      }
    }
  }
  for (const item of content) {
    const visited = new Set<string>();
    let current: Content | undefined = item;
    while (current?.supersededBy) {
      if (visited.has(current.id)) throw new Error("内容版本关系形成环：" + item.id);
      visited.add(current.id);
      current = contentById.get(current.supersededBy);
    }
  }
}

export async function getPublishedContent(options?: {
  contentType?: Content["contentType"];
}): Promise<PublicContent[]> {
  const content = await getAllContent();
  return content
    .filter(
      (item) =>
        item.publicationStatus === "published" &&
        item.review.status === "approved" &&
        (!options?.contentType || item.contentType === options.contentType),
    )
    .map(toPublicContent);
}

export async function getContentBySlug(
  slug: string,
  options?: { contentType?: Content["contentType"] },
): Promise<PublicContent | undefined> {
  return (await getPublishedContent(options)).find((item) => item.slug === slug);
}

export async function getContentById(
  id: string,
  options?: { contentType?: Content["contentType"] },
): Promise<PublicContent | undefined> {
  return (await getPublishedContent(options)).find((item) => item.id === id);
}

export async function getRelatedContent(
  content: PublicContent,
  options?: { contentType?: Content["contentType"] },
): Promise<PublicContent[]> {
  const published = await getPublishedContent(options);
  const explicit = content.relatedContentIds
    .map((id) => published.find((item) => item.id === id))
    .filter((item): item is PublicContent => Boolean(item));
  const fallback = published.filter(
    (item) =>
      item.id !== content.id &&
      !content.relatedContentIds.includes(item.id) &&
      (item.programs.some((program) => content.programs.includes(program)) ||
        item.jurisdictions.some((jurisdiction) => content.jurisdictions.includes(jurisdiction))) &&
      item.topics.some((topic) => content.topics.includes(topic)),
  );
  return [...explicit, ...fallback].slice(0, 3);
}
