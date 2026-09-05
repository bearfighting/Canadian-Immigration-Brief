import Link from "next/link";
import { notFound } from "next/navigation";
import { redirects } from "@/lib/redirects";

export const dynamicParams = false;

function redirectForSlug(slug: string) {
  return redirects.find((item) => item.from === `/programs/${slug}/`);
}

export function generateStaticParams() {
  return redirects
    .filter((item) => item.from.startsWith("/programs/") && item.from.endsWith("/"))
    .map((item) => ({ slug: item.from.slice("/programs/".length, -1) }));
}

export default async function LegacyProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = redirectForSlug(slug);
  if (!target) notFound();
  return (
    <main className="mx-auto max-w-[760px] px-4 py-16 sm:px-8">
      <meta httpEquiv="refresh" content={`0;url=${target.to}`} />
      <p className="text-sm font-medium uppercase tracking-wide text-accent">页面地址已更新</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">正在跳转到最新页面</h1>
      <p className="mt-4 text-muted-foreground">如果页面没有自动跳转，请使用下面的链接继续访问。</p>
      <Link className="mt-6 inline-block text-brand underline" href={target.to}>
        访问最新页面
      </Link>
    </main>
  );
}
