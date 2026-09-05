import type { PublicContent } from "@/lib/content/public";

export const CONTENT_PAGE_SIZE = 10;

export type ContentListItem = Pick<
  PublicContent,
  | "id"
  | "title"
  | "description"
  | "slug"
  | "contentType"
  | "updatedAt"
  | "policyStatus"
  | "jurisdictions"
  | "programs"
>;

export type ContentBrowserFilters = {
  type?: PublicContent["contentType"];
  province?: string;
  program?: string;
  status?: NonNullable<PublicContent["policyStatus"]>;
  query?: string;
  page?: number;
};

export type PaginatedContent = {
  items: ContentListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
};

export function toContentListItem(content: PublicContent): ContentListItem {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    slug: content.slug,
    contentType: content.contentType,
    updatedAt: content.updatedAt,
    policyStatus: content.policyStatus,
    jurisdictions: content.jurisdictions,
    programs: content.programs,
  };
}

export function filterAndPaginateContent(
  content: ContentListItem[],
  filters: ContentBrowserFilters = {},
): PaginatedContent {
  const query = filters.query?.trim().toLocaleLowerCase("zh-CN") ?? "";
  const filtered = content.filter((item) => {
    const matchesType = !filters.type || item.contentType === filters.type;
    const matchesProvince = !filters.province || item.jurisdictions.includes(filters.province);
    const matchesProgram =
      !filters.program || item.id === filters.program || item.programs.includes(filters.program);
    const matchesStatus = !filters.status || item.policyStatus === filters.status;
    const matchesQuery =
      !query ||
      item.title.toLocaleLowerCase("zh-CN").includes(query) ||
      item.description.toLocaleLowerCase("zh-CN").includes(query);
    return matchesType && matchesProvince && matchesProgram && matchesStatus && matchesQuery;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / CONTENT_PAGE_SIZE));
  const requestedPage = Number.isInteger(filters.page) ? (filters.page as number) : 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * CONTENT_PAGE_SIZE;
  return {
    items: filtered.slice(start, start + CONTENT_PAGE_SIZE),
    page,
    totalPages,
    totalItems: filtered.length,
  };
}
