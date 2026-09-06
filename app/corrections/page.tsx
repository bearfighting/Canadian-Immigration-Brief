import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "更正与勘误",
  description: "加拿大移民志处理错误、来源失效和政策变化的说明。",
  alternates: { canonical: "/corrections/" },
};

export default function CorrectionsPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-12 sm:px-8">
      <article className="prose max-w-none">
        <h1>更正与勘误</h1>
        <p>最后更新：2026年9月5日</p>
        <p>
          如果发现事实、日期、政策状态、官方链接或中文表述错误，请通过项目维护渠道提交文章标题、问题位置和可核验的官方来源。
        </p>
        <h2>当前提交方式</h2>
        <p>
          在项目框架验证阶段，请直接向项目负责人提交更正信息；项目暂未开放公开表单或邮件收集入口，也不会要求提交个人申请材料。
        </p>
        <h2>处理方式</h2>
        <ul>
          <li>涉及资格、法律效果、日期或费用的错误会优先复核并在必要时暂时撤下内容。</li>
          <li>来源失效或规则变化时，文章会进入待复核状态，不继续表达未经确认的当前结论。</li>
          <li>已确认的更正会更新文章和最后核验日期；重要更正会在文章中说明。</li>
        </ul>
        <p>项目负责人审核更正，不由自动化程序直接发布。</p>
      </article>
    </main>
  );
}
