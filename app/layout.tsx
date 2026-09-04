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
            <nav aria-label="主导航" className="flex items-center gap-4 text-sm">
              <Link href="/news/">最新内容</Link>
              <a href="/rss.xml" className="hidden sm:inline">
                RSS
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
