import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "数据现况",
  description: "加拿大移民数据和现实指标栏目建设中。",
  alternates: { canonical: "/data/" },
};

export default function DataPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">数据现况</p>
      <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">数据现况</h1>
      <div className="mt-8 rounded-xl border border-dashed p-6">
        <p className="text-lg">数据栏目正在建设中。</p>
        <p className="mt-3 text-muted-foreground">
          后续将整理移民项目、邀请、配额、处理时间和人口等数据，并明确数据日期、统计口径和官方来源。
        </p>
        <Link className="mt-5 inline-block text-brand underline" href="/content/">
          返回全部内容
        </Link>
      </div>
    </main>
  );
}
