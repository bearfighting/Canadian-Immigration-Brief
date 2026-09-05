import { z } from "zod";
import vocabulary from "@/data/controlled-vocabulary.json";
import officialDomains from "@/data/official-domains.json";
import { policyStatuses } from "@/lib/content/types";

const sourceBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "来源必须使用 HTTPS"),
  language: z.enum(["en", "fr", "zh-CN"]),
  publishedAt: z.coerce.date().optional(),
  accessedAt: z.coerce.date(),
});

export const sourceSchema = sourceBaseSchema.refine((source) => {
  const hostname = new URL(source.url).hostname.toLowerCase();
  return officialDomains.some((domain) => hostname === domain || hostname.endsWith("." + domain));
}, "来源域名不在官方白名单中");

export const supplementarySourceSchema = sourceBaseSchema.extend({
  type: z.enum(["media", "research", "legal-analysis", "public-institution"]),
});

export const reviewSchema = z
  .object({
    status: z.enum(["pending", "approved", "needs-update"]),
    reviewer: z.string().nullable(),
    reviewedAt: z.coerce.date().nullable(),
  })
  .superRefine((review, context) => {
    if (review.status === "approved" && (!review.reviewer || !review.reviewedAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewer"],
        message: "已通过审核的内容必须记录审核人和审核时间",
      });
    }
    if (review.status === "pending" && (review.reviewer || review.reviewedAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["status"],
        message: "待审核内容不应填写审核人或审核时间",
      });
    }
  });

const contentBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(300),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  contentType: z.enum([
    "news",
    "policy-explainer",
    "program-guide",
    "data-analysis",
    "weekly-brief",
    "legal-case",
  ]),
  language: z.literal("zh-CN"),
  publicationStatus: z.enum(["draft", "published", "rejected", "withdrawn"]),
  author: z.string().min(1),
  editor: z.string().min(1),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
  lastVerifiedAt: z.coerce.date(),
  policyStatus: z.enum(policyStatuses).optional(),
  importance: z.enum(["critical", "high", "normal", "low"]).optional(),
  jurisdictions: z.array(z.string()).min(1),
  topics: z.array(z.string()).min(1),
  programs: z.array(z.string()).default([]),
  audiences: z.array(z.string()).min(1),
  effectiveAt: z.coerce.date().optional(),
  officialName: z.string().min(1).optional(),
  abbreviation: z.string().min(1).optional(),
  programStatus: z.enum(["open", "paused", "closed", "unknown"]).optional(),
  guideVersion: z.string().min(1).optional(),
  changeSummary: z.string().min(1).optional(),
  officialSources: z.array(sourceSchema),
  supplementarySources: z.array(supplementarySourceSchema).default([]),
  relatedContentIds: z.array(z.string()).default([]),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  featured: z.boolean().default(false),
  review: reviewSchema,
  body: z.string(),
});

export function createContentSchema(referenceDate = new Date()) {
  return contentBaseSchema.superRefine((content, context) => {
    for (const [namespace, values] of Object.entries({
      jurisdictions: content.jurisdictions,
      topics: content.topics,
      audiences: content.audiences,
      programs: content.programs,
    })) {
      const allowed = vocabulary[namespace as keyof typeof vocabulary] ?? [];
      for (const value of values) {
        if (!allowed.includes(value)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [namespace],
            message: `未知的受控词：${value}`,
          });
        }
      }
    }
    if (content.publicationStatus === "published") {
      if (!content.publishedAt)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["publishedAt"],
          message: "已发布内容必须有发布日期",
        });
      if (content.review.status !== "approved")
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["review"],
          message: "已发布内容必须通过审核",
        });
      if (content.officialSources.length === 0)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["officialSources"],
          message: "已发布内容必须有官方来源",
        });
    }
    if (content.contentType === "program-guide") {
      for (const field of ["officialName", "programStatus", "guideVersion"] as const) {
        if (!content[field]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `项目指南必须填写 ${field}`,
          });
        }
      }
    }
    if (
      content.contentType === "program-guide" &&
      content.publicationStatus === "published" &&
      !content.changeSummary
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["changeSummary"],
        message: "已发布项目指南必须填写变更摘要",
      });
    }
    if (content.publishedAt && content.updatedAt < content.publishedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updatedAt"],
        message: "更新时间不得早于发布日期",
      });
    }
    if (content.lastVerifiedAt > referenceDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastVerifiedAt"],
        message: "最后核验时间不得晚于当前时间",
      });
    }
    const sourceIds = [
      ...content.officialSources.map((source) => source.id),
      ...content.supplementarySources.map((source) => source.id),
    ];
    if (new Set(sourceIds).size !== sourceIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["officialSources"],
        message: "来源 ID 不得重复",
      });
    }
    for (const [field, value] of Object.entries({
      supersedes: content.supersedes,
      supersededBy: content.supersededBy,
    })) {
      if (value === content.id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "内容关系不得指向自身",
        });
      }
    }
    if (content.relatedContentIds.includes(content.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["relatedContentIds"],
        message: "相关内容不得指向自身",
      });
    }
  });
}

export type Content = z.infer<ReturnType<typeof createContentSchema>>;
export type Source = z.infer<typeof sourceSchema>;
