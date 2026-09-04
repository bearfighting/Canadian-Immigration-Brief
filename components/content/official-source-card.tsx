import type { PublicContent } from "@/lib/content/public";

export function OfficialSourceCard({
  source,
}: {
  source: PublicContent["officialSources"][number];
}) {
  return (
    <li className="rounded-lg border bg-white p-4">
      <a href={source.url} rel="noreferrer noopener">
        {source.title}
      </a>
      <p className="mt-1 text-sm text-muted-foreground">
        {source.language.toUpperCase()} · 发布于{" "}
        {source.publishedAt?.toLocaleDateString("zh-CN") ?? "日期未提供"} · 访问于{" "}
        {source.accessedAt.toLocaleDateString("zh-CN")}
      </p>
    </li>
  );
}
