import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私说明",
  description: "加拿大移民志如何处理必要的技术日志和用户信息。",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-12 sm:px-8">
      <article className="prose max-w-none">
        <h1>隐私说明</h1>
        <p>最后更新：2026年9月5日</p>
        <h2>我们不主动收集什么</h2>
        <p>
          本项目当前不提供账户、邮件订阅、个性化推荐、自动资格评估或产品分析，不主动收集姓名、联系方式、申请材料或移民档案。
        </p>
        <h2>必要技术日志</h2>
        <p>
          托管平台可能保留提供网站服务所必需的技术日志，例如请求时间、页面路径、响应状态和错误信息。项目不把这些日志用于建立个人画像，具体保留期限以托管平台政策为准。
        </p>
        <h2>外部链接</h2>
        <p>页面会链接到加拿大政府等官方来源。进入外部网站后，请以其隐私政策和使用条款为准。</p>
        <h2>后续变化</h2>
        <p>如果未来增加分析、订阅或其他数据处理功能，会先更新本说明并记录相应的产品决定。</p>
      </article>
    </main>
  );
}
