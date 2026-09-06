import { ContentSearchForm } from "@/components/content/content-search-form";
import { DiscoveryLinkGroup } from "@/components/content/discovery-link-group";
import type { ContentListItem } from "@/lib/content/browser";
import { buildQuery, programOptions, provinceOptions, typeOptions } from "@/lib/content/query";
import { contentPath } from "@/lib/content/routes";

export function HomeDiscoverySidebar({ programGuides }: { programGuides: ContentListItem[] }) {
  const guideByProgram = new Map(programGuides.map((guide) => [guide.id, guide]));

  return (
    <aside
      className="order-first rounded-xl border bg-surface-muted p-5 lg:sticky lg:top-6 lg:order-none"
      aria-labelledby="discovery-heading"
    >
      <h2 id="discovery-heading" className="text-xl font-semibold">
        快速发现
      </h2>
      <div className="mt-5 grid gap-6">
        <ContentSearchForm />
        <DiscoveryLinkGroup
          title="按栏目"
          links={typeOptions.map(([value, label]) => ({
            href: `/content/${buildQuery({ type: value })}`,
            label,
          }))}
        />
        <DiscoveryLinkGroup
          title="按地区"
          links={provinceOptions.map(([value, label]) => ({
            href: `/content/${buildQuery({ province: value })}`,
            label,
          }))}
        />
        <DiscoveryLinkGroup
          title="核心项目"
          links={programOptions.flatMap(([program, label]) => {
            const guide = guideByProgram.get(program);
            return guide ? [{ href: contentPath(guide), label }] : [];
          })}
        />
        <DiscoveryLinkGroup
          title="常用入口"
          links={[
            { href: "/news/", label: "最新新闻" },
            { href: "/rss.xml", label: "RSS" },
            { href: "/data/", label: "数据栏目（建设中）" },
          ]}
        />
      </div>
    </aside>
  );
}
