import Link from "next/link";
import type { PublicContent } from "@/lib/content/public";
import { contentPath } from "@/lib/content/routes";
import { OfficialSourceCard } from "@/components/content/official-source-card";

export function OfficialSourcesSection({ sources }: { sources: PublicContent["officialSources"] }) {
  return (
    <section className="mt-10 rounded-xl border bg-surface-muted p-5" aria-labelledby="sources">
      <h2 id="sources" className="text-lg font-semibold">
        官方来源
      </h2>
      <ul className="mt-3 space-y-3">
        {sources.map((source) => (
          <OfficialSourceCard key={source.id} source={source} />
        ))}
      </ul>
    </section>
  );
}

export function RelatedContentSection({ items }: { items: PublicContent[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="related">
      <h2 id="related" className="text-lg font-semibold">
        相关内容
      </h2>
      <ul className="mt-3 list-disc pl-6">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={contentPath(item)}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
