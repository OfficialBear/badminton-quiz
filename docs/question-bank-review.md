# 题库内容审核清单（Content Review Checklist）

> 本文件是**内容层面**的审核清单，与 `src/services/bankValidation.ts` 的**结构校验**严格区分：
> 程序通过结构校验 **不等于** 规则正确性已被人工核实。

## 1. 规则来源层级

按优先级采用世界羽联（BWF）现行正式文件：

1. BWF Statutes, Section 4.1 — Laws of Badminton
2. BWF Statutes, Section 4.1.1 — Instructions to Technical Officials
3. 适用于具体主题的官方竞赛规程与正式修订通知

官方入口：https://corporate.bwfbadminton.com/statutes/

实施时需核实：文档版本、生效日期、修订内容。若链接失效，以官方 Statutes 页面的现行文件为准。
**若无法访问官方文件，不得声称已核验，也不得将模型生成内容标记为已审核。**

## 2. 每道题必须记录的字段（数据模型见 `src/types/quiz.ts`）

| 字段 | 说明 |
|---|---|
| `id` | 稳定唯一 ID |
| `category` | 知识领域（联合类型） |
| `type` | 题型（联合类型：true-false / single / multiple / scenario） |
| `difficulty` | 难度（basic / intermediate / expert） |
| `question.zh` / `question.en` | 中英文题干 |
| `options[].id` / `.text.zh` / `.text.en` | 稳定选项 ID 与中英文文本 |
| `correctOptionIds` | 标准答案选项 ID **数组**（所有题型统一，禁止用下标判定） |
| `explanation.zh` / `.en` | 中英文解析 |
| `ruleReference` | 官方来源（如 BWF Laws of Badminton） |
| `ruleClause` | 条款编号 / 可追溯定位（如 Laws 7.1） |
| `ruleVersion` | 规则版本或生效日期 |
| `reviewStatus` | draft / needs-review / verified |
| `tags` | 知识点标签 |

## 3. 题目审核表（逐题填写）

| ID | 来源 URL | 条款 | 版本/生效日期 | 中英核对 | 审核人 | 审核日期 | 状态 |
|---|---|---|---|---|---|---|---|
| q-scoring-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-scoring-02 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-scoring-03 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-service-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-service-02 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-service-03 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-court-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-faults-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-officials-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |
| q-scenario-01 | 待填写 | 待核验 | 待核验 | 否 | — | — | draft |

只有一行完成「来源可追溯 + 条款 + 版本 + 中英核对 + 审核人 + 审核日期」后，才可将其 `reviewStatus` 改为 `verified`。
`verified` 题目方可用于正式测评（`validateQuestionBank(bank, { requireVerified: true })` 会强制此约束）。

## 4. 首版目标分布（`src/data/bankTargets.ts`）

- 总数：100
- 知识领域：比赛规则与计分 20 / 发球与接发球 20 / 场地界线与球 15 / 违例与行为 20 / 裁判职责 15 / 情境综合 10
- 题型：判断题 30 / 单选题 40 / 多选题 20 / 情境题 10
- 难度：基础 40 / 进阶 40 / 专家 20

## 5. 当前缺口（如实说明，不要虚构）

- 正式题库：**0 道已核验**。
- `src/data/questionBank.ts` 当前为 **10 道示例题**，全部 `reviewStatus: 'draft'`、`ruleVersion: 'pending'`、`ruleClause: '待核验'`，**不得**作为正式测评内容。
- 距离首版目标仍缺 **90 道**，且 10 道示例题也尚未完成来源与条款核验。
- 未访问/核验官方文件；因此**没有**任何题目被标记为 `verified`。

## 6. 使用方式

```ts
import { validateQuestionBank } from '@/services/bankValidation'
import { QUESTION_BANK } from '@/data/questionBank'

// 结构校验（草稿库）：只做结构、不强制 verified
validateQuestionBank(QUESTION_BANK)

// 正式题库发布闸门：任一非 verified 题目都会被判为错误
validateQuestionBank(officialBank, { requireVerified: true })
```
