import type { ReactNode } from "react";

type ContentDetailLayoutProps = {
  meta: ReactNode;
  title: string;
  description: string;
  notice?: ReactNode;
  body: ReactNode;
  facts: ReactNode;
  share: ReactNode;
  sources: ReactNode;
  related?: ReactNode;
};

export function ContentDetailLayout({
  meta,
  title,
  description,
  notice,
  body,
  facts,
  share,
  sources,
  related,
}: ContentDetailLayoutProps) {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <article className="mx-auto max-w-[760px]">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {meta}
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-5 text-xl text-muted-foreground">{description}</p>
        {notice}
        {body}
        {facts}
        {share}
        {sources}
        {related}
      </article>
    </main>
  );
}
