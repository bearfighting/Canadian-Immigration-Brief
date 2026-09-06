export function ContentSearchForm() {
  return (
    <form action="/content/" method="get" className="grid gap-3">
      <label htmlFor="home-content-search" className="text-sm font-medium">
        搜索标题或摘要
      </label>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          id="home-content-search"
          name="q"
          type="search"
          className="w-full min-w-0 rounded-lg border bg-white px-3 py-2"
          placeholder="医生、BC PNP、学习许可"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          搜索
        </button>
      </div>
    </form>
  );
}
