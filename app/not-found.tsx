import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-16 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">页面不存在</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">找不到这篇内容</h1>
      <p className="mt-4 text-muted-foreground">文章可能尚未发布、已经撤下，或地址已经发生变化。</p>
      <Link className="mt-6 inline-block text-brand underline" href="/">
        返回首页
      </Link>
    </main>
  );
}
