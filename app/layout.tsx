import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: { default: siteConfig.name, template: "%s | " + siteConfig.name },
  description: siteConfig.tagline + "。",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
            <Link href="/" className="font-semibold no-underline text-brand">
              加拿大移民信息简报
            </Link>
            <nav aria-label="主导航" className="hidden items-center gap-4 text-sm md:flex">
              <Link href="/content/">全部内容</Link>
              <Link href="/news/">新闻</Link>
              <Link href="/content/?type=program-guide">项目</Link>
              <Link href="/content/?province=bc">省级</Link>
              <Link href="/content/?q=学习许可">留学与工作</Link>
              <Link href="/content/?q=永久居民">永久居民</Link>
              <Link href="/data/">数据</Link>
              <a href="/rss.xml" className="hidden sm:inline">
                RSS
              </a>
            </nav>
            <details className="relative md:hidden">
              <summary className="cursor-pointer list-none rounded border px-3 py-2 text-sm font-medium">
                菜单
              </summary>
              <nav
                aria-label="移动端主导航"
                className="absolute right-0 top-12 z-10 grid min-w-48 gap-3 rounded border bg-white p-4 text-sm shadow-lg"
              >
                <Link href="/content/">全部内容</Link>
                <Link href="/news/">新闻</Link>
                <Link href="/content/?type=program-guide">项目</Link>
                <Link href="/content/?province=bc">省级</Link>
                <Link href="/content/?q=学习许可">留学与工作</Link>
                <Link href="/content/?q=永久居民">永久居民</Link>
                <Link href="/data/">数据</Link>
                <a href="/rss.xml">RSS</a>
              </nav>
            </details>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
