import rawRedirects from "@/data/redirects.json";
import { z } from "zod";

const internalPath = z
  .string()
  .regex(/^\/[a-z0-9][a-z0-9/?-]*\/$/)
  .refine((value) => !value.includes("//"), "路径不得包含连续斜杠");

const redirectSchema = z
  .object({ from: internalPath, to: internalPath })
  .refine((value) => value.from !== value.to, "重定向不得指向自身");

const redirectListSchema = z.array(redirectSchema).superRefine((items, context) => {
  const seen = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (seen.has(item.from)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, "from"],
        message: "from 路径必须唯一",
      });
    }
    seen.add(item.from);
  }
});

export const redirects = redirectListSchema.parse(rawRedirects);
