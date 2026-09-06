import type { PublicContent } from "@/lib/content/public";

export type ReaderNotice =
  | { kind: "superseded"; tone: "warning"; title: string }
  | { kind: "suspended"; tone: "warning"; title: string; description: string }
  | { kind: "not-yet-effective"; tone: "info"; title: string; effectiveAt: Date };

export function getReaderNotice(content: PublicContent): ReaderNotice | undefined {
  if (content.supersededBy) {
    return {
      kind: "superseded",
      tone: "warning",
      title: "本文内容已被更新版本替代，请查看最新内容。",
    };
  }

  if (content.policyStatus === "suspended") {
    return {
      kind: "suspended",
      tone: "warning",
      title: "项目或安排目前处于暂停状态。",
      description: "目前暂不接受新的申请或暂不执行相关安排。",
    };
  }

  if (content.policyStatus === "announced" && content.effectiveAt) {
    return {
      kind: "not-yet-effective",
      tone: "info",
      title: "新规定已公布，但尚未生效。",
      effectiveAt: content.effectiveAt,
    };
  }

  return undefined;
}
