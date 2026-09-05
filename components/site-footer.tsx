import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap gap-x-5 gap-y-2 px-4 py-8 text-sm text-muted-foreground sm:px-8">
        <span>加拿大移民信息简报</span>
        <Link href="/privacy/">隐私说明</Link>
        <Link href="/disclaimer/">免责声明</Link>
        <Link href="/corrections/">更正与勘误</Link>
        <a href="/rss.xml">RSS</a>
      </div>
    </footer>
  );
}
