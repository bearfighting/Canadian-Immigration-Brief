# 加拿大移民中文信息网站：内容模型

> 状态：工作稿 v0.2  
> 更新日期：2026-09-04

## 1. 设计目标

首版不依赖数据库。Markdown 保存正式编辑内容，JSON/CSV 保存重复性强、需要排序筛选的结构化数据。所有内容经过 Schema 校验后参与构建。

## 2. 推荐目录

```text
content/
├── news/
├── explainers/
├── programs/
├── provinces/
├── data-analysis/
└── weekly/

data/
├── controlled-vocabulary.json
├── terminology.json
├── express-entry-draws.json
├── provincial-draws.json
└── immigration-levels.json
```

## 3. 内容类型

| 类型 | `contentType` | 用途 |
| --- | --- | --- |
| 新闻 | `news` | 报道新发生的实质变化 |
| 政策解释 | `policy-explainer` | 解释法律、制度和政策背景 |
| 项目指南 | `program-guide` | 维护项目当前有效规则 |
| 数据分析 | `data-analysis` | 解释统计数据和现实趋势 |
| 周度简报 | `weekly-brief` | 汇总一周的重要变化 |
| 法律案例 | `legal-case` | 介绍具有公共价值的裁判与影响 |

## 4. 通用 Front Matter

所有可发布内容统一使用以下字段。`publicationStatus` 描述文章是否可公开，`policyStatus` 描述文章涉及的政策状态，二者不得混用。

```yaml
id: stable-content-id
title: 标题
description: 用于搜索和分享的准确摘要。
slug: stable-public-slug
contentType: news
language: zh-CN
publicationStatus: draft
updatedAt: 2026-09-04
lastVerifiedAt: 2026-09-04
author: editorial-team
editor: editor-id
review:
  status: pending
  reviewer: null
  reviewedAt: null
```

日期使用 ISO 8601；需要时间时必须包含时区。没有明确生效日期时不得推测 `effectiveAt`。

## 5. 新闻 Front Matter

```yaml
---
id: news-2026-09-04-example
title: 示例中文标题
description: 用于搜索和分享的一至两句准确摘要。
slug: example-policy-update
contentType: news
language: zh-CN
publicationStatus: draft

publishedAt: 2026-09-04
updatedAt: 2026-09-04
effectiveAt: 2026-10-01
lastVerifiedAt: 2026-09-04

policyStatus: announced
importance: high
jurisdictions: [federal]
topics: [study-permit]
programs: [study-permit]
audiences: [prospective-student]

officialSources:
  - title: Immigration, Refugees and Citizenship Canada
    url: https://www.canada.ca/example
    language: en
    publishedAt: 2026-09-03
    accessedAt: 2026-09-04

supplementarySources: []
featured: false
review:
  status: pending
  reviewer: null
  reviewedAt: null
---
```

## 6. 项目指南 Front Matter

```yaml
---
id: program-post-graduation-work-permit
title: 毕业后工作许可
officialName: Post-Graduation Work Permit
abbreviation: PGWP
description: 加拿大毕业后工作许可项目的当前规则、资格与政策变化。
slug: post-graduation-work-permit
contentType: program-guide
language: zh-CN
publicationStatus: published
programStatus: open
jurisdictions: [federal]
topics: [work-permit]
audiences: [international-student, recent-graduate]
lastVerifiedAt: 2026-09-04
guideVersion: 2026-09
officialSources:
  - id: ircc-pgwp-official
    title: IRCC — Post-Graduation Work Permit
    url: https://www.canada.ca/example
    language: en
    publishedAt: 2026-01-01
    accessedAt: 2026-09-04
review:
  status: approved
  reviewer: editor-id
  reviewedAt: 2026-09-04
---
```

已发布项目指南必须至少有一个可核验的官方来源。

## 7. 受控词表

禁止作者临时创造分类值。首版维护以下命名空间：

### 地区 `jurisdictions`

`federal`、各省和地区的稳定 slug；Atlantic Canada 仅作为展示分组，具体内容尽可能标记实际省份。

### 主题 `topics`

`visitor`、`study-permit`、`work-permit`、`permanent-residence`、`family-sponsorship`、`citizenship`、`refugee-humanitarian`、`settlement`、`enforcement`。

### 政策状态 `policyStatus`

- `effective`：已经生效；
- `announced`：已经公布但尚未生效；
- `consultation`：咨询或提议阶段；
- `suspended`：暂停接收或执行；
- `expired`：已经结束或被替代；
- `unconfirmed`：存在报道但尚无充分官方确认。

### 重要性 `importance`

`critical`、`high`、`normal`、`low`。不得仅以流量潜力判断重要性。

### 受众 `audiences`

至少包括 `prospective-student`、`international-student`、`temporary-worker`、`recent-graduate`、`pr-candidate`、`family-sponsorship-applicant`、`permanent-resident` 和 `professional-observer`。每个值必须同时定义中文显示名。

## 8. 内容关系

- `topics` 表示主题，`programs` 必须引用具体项目指南 ID，不得把主题 slug 当作项目 ID；
- 新闻通过 `jurisdictions` 进入联邦或省级列表；
- `audiences` 生成“按身份查找”页面；
- 项目页自动聚合相关新闻和时间线；
- 周报引用新闻 ID，不复制事实数据；
- 数据分析引用结构化数据集及其版本日期。
- 项目指南通过 `supersedes`、`supersededBy` 和 `changeSummary` 记录版本关系；
- slug 变化通过 `data/redirects.json` 保留旧地址。

## 9. 新闻生命周期

```text
candidate -> draft -> approved -> published
                              -> rejected
published -> effective -> superseded/expired
          -> corrected
          -> withdrawn
```

- 自动生成内容只能进入 `draft`；
- `review.status: approved` 是发布的必要条件；
- 规则变化后保留旧新闻，但增加更新提示；
- 当前指南必须链接替代或修改旧政策的新内容；
- 更正不得悄悄覆盖，应记录更正日期和说明；
- “已发布”与“已生效”分别由 `publicationStatus` 和 `policyStatus` 表示。

## 10. Markdown 与结构化数据边界

适合 Markdown：新闻、解读、指南、周报、方法说明。

适合 JSON/CSV：抽签记录、年度目标、月度数量、处理时间快照、术语别名、受控标签。

原则：单条记录没有独立报道价值时，不为它创建文章。

## 11. 搜索索引

构建时索引：

- 标题、description 和正文；
- 官方英文、法文名称和缩写；
- 中文正式译名与常用别名；
- 项目、主题、省份、受众和政策状态；
- 发布时间与最后核验时间。

搜索结果必须标示“当前指南”或“历史新闻”，避免旧文章被误认为当前规则。

## 12. 内容验证

构建阶段至少检查：

- ID 与 slug 唯一；
- 已发布内容有官方来源；
- 日期合法且逻辑一致；
- 所有标签来自受控词表；
- `review.status` 为 `approved`；
- description 长度合理；
- 外部来源字段完整；
- 项目引用能够解析；
- 草稿不会进入 sitemap、RSS 或生产页面。

另外必须检查：来源 ID 唯一、项目引用为具体项目 ID、`supersedes` 关系无环、版本号和更新日期一致。

## 13. 数据库迁移触发条件

出现以下需求时再引入数据库：候选新闻工作台、网页快照、频繁自动采集、用户账户、收藏、订阅偏好、通知历史、多编辑者后台或复杂数据筛选。

正式出版内容可以继续保留在 Markdown 中，数据库主要承担动态数据和工作流。
