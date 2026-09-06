import type { PublicContent } from "@/lib/content/public";
import { PolicyStatusBadge } from "@/components/content/policy-status-badge";
import { formatDateOnly } from "@/lib/format/date";

const audienceLabels: Record<string, string> = {
  "prospective-student": "计划来加学习者",
  "international-student": "国际学生",
  "temporary-worker": "临时外国工人",
  "pr-candidate": "永久居民申请人",
  "permanent-resident": "永久居民",
};

export function KeyFactsPanel({ content }: { content: PublicContent }) {
  const isNews = content.contentType === "news";

  return (
    <section className="my-8 rounded-xl border bg-surface-muted p-5" aria-labelledby="key-facts">
      <h2 id="key-facts" className="text-lg font-semibold">
        关键信息
      </h2>
      <dl className="mt-4 grid gap-3 text-base sm:grid-cols-2">
        {!isNews && content.policyStatus ? (
          <div>
            <dt className="text-muted-foreground">政策状态</dt>
            <dd>
              <PolicyStatusBadge status={content.policyStatus} />
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted-foreground">发布日期</dt>
          <dd>{formatDateOnly(content.publishedAt)}</dd>
        </div>
        {content.contentType === "news" && content.announcedAt ? (
          <div>
            <dt className="text-muted-foreground">官方公布日期</dt>
            <dd>{formatDateOnly(content.announcedAt)}</dd>
          </div>
        ) : null}
        {content.contentType === "news" && content.eventAt ? (
          <div>
            <dt className="text-muted-foreground">事件日期</dt>
            <dd>{formatDateOnly(content.eventAt)}</dd>
          </div>
        ) : null}
        {isNews && content.effectiveAt ? (
          <div>
            <dt className="text-muted-foreground">生效日期</dt>
            <dd>{formatDateOnly(content.effectiveAt)}</dd>
          </div>
        ) : !isNews ? (
          <div>
            <dt className="text-muted-foreground">生效日期</dt>
            <dd>{content.effectiveAt ? formatDateOnly(content.effectiveAt) : "尚未公布"}</dd>
          </div>
        ) : null}
        {isNews ? (
          <>
            <div>
              <dt className="text-muted-foreground">最近更新时间</dt>
              <dd>{formatDateOnly(content.updatedAt)}</dd>
            </div>
          </>
        ) : null}
        <div>
          <dt className="text-muted-foreground">影响人群</dt>
          <dd>
            {content.audiences.map((audience) => audienceLabels[audience] ?? audience).join("、")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
