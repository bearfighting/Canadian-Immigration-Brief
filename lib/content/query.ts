import type { ContentListItem, ContentBrowserFilters } from "@/lib/content/browser";

export const typeOptions = [
  ["news", "新闻"],
  ["policy-explainer", "政策解释"],
  ["program-guide", "项目指南"],
] as const;

export const provinceOptions = [
  ["federal", "联邦"],
  ["bc", "BC"],
  ["ontario", "Ontario"],
  ["quebec", "Québec"],
] as const;

export const statusOptions = [
  ["effective", "已生效"],
  ["announced", "已宣布"],
  ["consultation", "咨询中"],
  ["suspended", "暂停"],
  ["expired", "已结束"],
] as const;

export function getFilters(
  searchParams: URLSearchParams,
  fixedType?: ContentListItem["contentType"],
): ContentBrowserFilters {
  const pageValue = Number(searchParams.get("page"));
  const requestedType = searchParams.get("type");
  const type = fixedType
    ? fixedType
    : typeOptions.some(([value]) => value === requestedType)
      ? (requestedType as ContentListItem["contentType"])
      : undefined;
  const requestedStatus = searchParams.get("status");
  const status = statusOptions.some(([value]) => value === requestedStatus)
    ? (requestedStatus as NonNullable<ContentListItem["policyStatus"]>)
    : undefined;
  return {
    type,
    province: provinceOptions.some(([value]) => value === searchParams.get("province"))
      ? (searchParams.get("province") ?? undefined)
      : undefined,
    program: searchParams.get("program") || undefined,
    status,
    query: searchParams.get("q") || undefined,
    page: Number.isFinite(pageValue) ? pageValue : 1,
  };
}

export function buildQuery(
  filters: ContentBrowserFilters,
  fixedType?: ContentListItem["contentType"],
): string {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== fixedType) params.set("type", filters.type);
  if (filters.province) params.set("province", filters.province);
  if (filters.program) params.set("program", filters.program);
  if (filters.status) params.set("status", filters.status);
  if (filters.query) params.set("q", filters.query.trim());
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
