import { Badge } from "@/components/ui/badge";
import type { PolicyStatus } from "@/lib/content/types";

const labels: Record<PolicyStatus, string> = {
  effective: "已生效",
  announced: "已宣布，尚未生效",
  consultation: "咨询中",
  suspended: "暂停",
  expired: "已结束",
  unconfirmed: "待确认",
};

const styles: Record<PolicyStatus, string> = {
  effective: "border-green-200 bg-green-50 text-green-800",
  announced: "border-amber-200 bg-amber-50 text-amber-800",
  consultation: "border-blue-200 bg-blue-50 text-blue-800",
  suspended: "border-red-200 bg-red-50 text-red-800",
  expired: "border-slate-200 bg-slate-100 text-slate-700",
  unconfirmed: "border-slate-300 bg-slate-50 text-slate-700",
};

export function PolicyStatusBadge({ status }: { status?: PolicyStatus }) {
  if (!status) return null;
  return <Badge className={styles[status]}>{labels[status]}</Badge>;
}
