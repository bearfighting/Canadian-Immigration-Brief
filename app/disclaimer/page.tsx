import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免责声明",
  description: "加拿大移民信息简报的内容范围和使用边界。",
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-12 sm:px-8">
      <article className="prose max-w-none">
        <h1>免责声明</h1>
        <p>最后更新：2026年9月5日</p>
        <p>
          本网站是面向中文读者的加拿大移民政策与现实信息整理项目。内容用于一般信息参考，不构成法律意见、移民顾问意见、个案资格判断、成功率预测或结果承诺。
        </p>
        <p>
          政策、项目规则、费用、期限和处理方式可能变化。涉及申请或身份决定时，应阅读当前官方来源，并根据需要咨询持牌律师或加拿大持牌移民顾问。
        </p>
        <h2>利益披露</h2>
        <p>
          本项目不代表加拿大政府、移民顾问、律师事务所或任何申请项目，不收取申请服务费，也不接受以获得特定移民结果为目的的委托。
        </p>
      </article>
    </main>
  );
}
