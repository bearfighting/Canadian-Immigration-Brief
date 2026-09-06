"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ContentListCard } from "@/components/content/content-list-card";
import {
  filterAndPaginateContent,
  type ContentBrowserFilters,
  type ContentListItem,
} from "@/lib/content/browser";
import {
  buildQuery,
  getFilters,
  provinceOptions,
  statusOptions,
  typeOptions,
} from "@/lib/content/query";

const labels: Record<string, string> = {
  "express-entry": "Express Entry",
  "bc-skilled-worker": "BC PNP Skilled Worker",
  "ontario-workforce-priority": "Ontario Workforce Priority Stream",
};

function selectOptions(content: ContentListItem[], kind: "program"): string[] {
  return [
    ...new Set(
      content.flatMap((item) =>
        kind === "program"
          ? item.contentType === "program-guide"
            ? [item.id]
            : item.programs
          : [],
      ),
    ),
  ].sort();
}

export function ContentBrowser({
  content,
  fixedType,
  title,
  description,
}: {
  content: ContentListItem[];
  fixedType?: ContentListItem["contentType"];
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => getFilters(searchParams, fixedType), [fixedType, searchParams]);
  const result = useMemo(() => filterAndPaginateContent(content, filters), [content, filters]);
  const programs = useMemo(() => selectOptions(content, "program"), [content]);
  const [searchDraft, setSearchDraft] = useState(filters.query ?? "");
  const hasFilters = Boolean(
    filters.type || filters.province || filters.program || filters.status || filters.query,
  );

  useEffect(() => {
    setSearchDraft(filters.query ?? "");
  }, [filters.query]);

  useEffect(() => {
    const parameterized = searchParams.toString().length > 0;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = parameterized ? "noindex,follow" : "index,follow";
  }, [pathname, searchParams]);

  function navigate(next: ContentBrowserFilters) {
    router.push(pathname + buildQuery({ ...filters, ...next, page: next.page ?? 1 }, fixedType));
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(
      pathname +
        buildQuery({ ...filters, query: searchDraft.trim() || undefined, page: 1 }, fixedType),
    );
  }

  function clearFilters() {
    router.push(pathname + (fixedType ? "" : ""));
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <section className="mx-auto max-w-[900px]">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">内容浏览</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        <form
          className="mt-8 grid gap-3 rounded-xl border bg-surface-muted p-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={submitSearch}
        >
          {!fixedType && (
            <label className="grid gap-1 text-sm font-medium">
              栏目
              <select
                className="rounded-lg border bg-white p-2"
                value={filters.type ?? ""}
                onChange={(event) =>
                  navigate({
                    type: (event.target.value || undefined) as ContentBrowserFilters["type"],
                  })
                }
              >
                <option value="">全部栏目</option>
                {typeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="grid gap-1 text-sm font-medium">
            省份/地区
            <select
              className="rounded-lg border bg-white p-2"
              value={filters.province ?? ""}
              onChange={(event) => navigate({ province: event.target.value || undefined, page: 1 })}
            >
              <option value="">全部地区</option>
              {provinceOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            项目
            <select
              className="rounded-lg border bg-white p-2"
              value={filters.program ?? ""}
              onChange={(event) => navigate({ program: event.target.value || undefined, page: 1 })}
            >
              <option value="">全部项目</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {labels[program] ?? program}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            政策状态
            <select
              className="rounded-lg border bg-white p-2"
              value={filters.status ?? ""}
              onChange={(event) =>
                navigate({
                  status: (event.target.value || undefined) as ContentBrowserFilters["status"],
                  page: 1,
                })
              }
            >
              <option value="">全部状态</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium sm:col-span-2">
            搜索标题或摘要
            <input
              className="rounded-lg border bg-white p-2"
              value={searchDraft}
              placeholder="例如：医生、学习许可"
              aria-label="搜索标题或摘要"
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </label>
        </form>
        <div
          className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <span>
            共 {result.totalItems} 篇内容，第 {result.page}/{result.totalPages} 页
          </span>
          {hasFilters && (
            <button type="button" className="text-brand underline" onClick={clearFilters}>
              清除筛选
            </button>
          )}
        </div>
        {result.items.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {result.items.map((item) => (
              <ContentListCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center" role="status">
            没有符合条件的公开内容。请调整筛选条件或清除筛选。
          </div>
        )}
        {result.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-between" aria-label="内容分页">
            {result.page > 1 ? (
              <Link
                className="rounded-lg border px-4 py-2 text-brand"
                href={pathname + buildQuery({ ...filters, page: result.page - 1 }, fixedType)}
              >
                上一页
              </Link>
            ) : (
              <span
                className="rounded-lg border px-4 py-2 text-muted-foreground"
                aria-disabled="true"
              >
                上一页
              </span>
            )}
            <span aria-current="page">
              第 {result.page} / {result.totalPages} 页
            </span>
            {result.page < result.totalPages ? (
              <Link
                className="rounded-lg border px-4 py-2 text-brand"
                href={pathname + buildQuery({ ...filters, page: result.page + 1 }, fixedType)}
              >
                下一页
              </Link>
            ) : (
              <span
                className="rounded-lg border px-4 py-2 text-muted-foreground"
                aria-disabled="true"
              >
                下一页
              </span>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
