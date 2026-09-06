import type { PublicContent } from "@/lib/content/public";
import { formatDateOnly } from "@/lib/format/date";

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
      {source.publisher ? (
        <p className="mt-2 text-sm font-medium">发布机构：{source.publisher}</p>
      ) : null}
      <p className="mt-1 text-sm text-muted-foreground">
        {source.language.toUpperCase()} · 发布于 {formatDateOnly(source.publishedAt)} · 访问于{" "}
        {formatDateOnly(source.accessedAt)}
      </p>
    </li>
  );
}
