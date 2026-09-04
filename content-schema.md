# 内容 Schema 规范

> 状态：工作稿 v0.2  
> 更新日期：2026-09-04

本文件是内容模型的实现级补充。Schema 是构建的唯一入口；任何未通过校验的内容不得进入生产构建。

生产内容必须通过 `getAllContent()` 进入构建流程，由统一的构建参考时间执行 Schema 校验，并进一步完成跨文件项目、相关内容和版本关系校验。业务代码不得自行绕过该流程读取 Markdown。

## 1. 必填字段

所有内容必须有：

- id：全局唯一、创建后不变；
- title、description、slug、contentType、language；
- publicationStatus、updatedAt、lastVerifiedAt；
- author、editor 和 review.status；
- jurisdictions、topics、audiences；
- 至少一个可核验的官方来源（草稿可以暂缺，但发布前必须补齐）；补充来源单独记录类型，不能与官方来源混淆。

## 2. 发布规则

publicationStatus 为 published 必须同时满足：

1. review.status 为 approved；
2. 存在至少一个官方来源；
3. 所有受控词值合法；
4. 所有内部引用可解析；
5. 日期逻辑成立；
6. 正文通过 Markdown 安全检查。

## 3. 日期规则

- updatedAt 不得早于 publishedAt；
- lastVerifiedAt 不得晚于当前构建时间；
- 没有官方依据时不得填写政策生效日期；
- 截止日期、失效日期和生效日期必须分别表达；
- 跨时区事件使用完整 ISO 8601 时间。

## 4. 引用关系

programs 只接受项目指南 ID；topics 只接受主题词。supersedes 和 supersededBy 必须互相一致，且不得形成环。

## 5. 数据集

每个 JSON/CSV 数据集必须有 schemaVersion、updatedAt、source、asOf、单位和口径说明。修订数据不得静默覆盖，应增加版本或修订说明。
