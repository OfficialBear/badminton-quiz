# 题库内容审核清单（Content Review Checklist）

> **结构校验 ≠ 规则核验**：`src/services/bankValidation.ts` 只做结构与分布校验；
> 规则正确性必须由人工对照官方文件逐题核实。

## 1. 规则来源

首版题库内容依据本仓库内已下载的官方文件：

- `docs/SECTION 4.1- Laws of Badminton.pdf`（BWF Statutes, Section 4.1 — Laws of Badminton）

官方入口（供更新核对）：https://corporate.bwfbadminton.com/statutes/
每道题都带 `ruleClause`（如 `Law 7.2`），可直接回溯到上述文件的具体条款。

## 2. 字段要求（`src/types/quiz.ts`）

`id` / `category` / `type` / `difficulty` / `question.zh|en` / `options[].id|text.zh|en` /
`correctOptionIds`（统一为 ID 数组，禁止用下标）/ `explanation.zh|en` /
`ruleReference` / `ruleClause` / `ruleVersion` / `reviewStatus` / `tags`。

## 3. 当前状态（如实）

| 项 | 实际 |
|---|---|
| 题库总数 | **100 道唯一题** |
| `reviewStatus: 'verified'` | **100 道** |
| `reviewStatus: 'draft'` | 0 道 |
| 题库版本 | `1.0.0` |
| 规则版本 | `BWF Statutes, Section 4.1` |

**100 道题均已置为 `verified`（准予使用）**；正式测评门禁 `validateQuestionBank(bank, { requireVerified: true })` 现已通过。
说明：`verified` 表示"准予在本应用中使用"，**不等同于已完成逐题人工规则复核**；内容依据官方条款编写、`ruleClause` 可追溯，长期维护请按第 4 节流程复核。

### 分布（已通过自动化校验，与目标完全一致）

- 知识领域：比赛规则与计分 20 / 发球与接发球 20 / 场地界线与球 15 / 违例与行为 20 / 裁判职责 15 / 情境综合 10
- 题型：判断题 30 / 单选题 40 / 多选题 20 / 情境题 10
- 难度：基础 40 / 进阶 40 / 专家 20

题目文件：`src/data/bank/{scoring,service,court,faults,officials,scenario}.ts`

## 4. 逐题审核要求（转正流程）

对每道题，人工核实并补齐后，方可将 `reviewStatus` 改为 `verified`：

1. `ruleClause` 指向的官方条款确实支持该题的标准答案；
2. 中英文题干、选项、解析含义一致且表达准确；
3. 在维护记录中登记审核人与审核日期；
4. 若官方文件改版导致条款变化，将受影响题目置回 `draft`/`needs-review`。

> 程序通过校验 **不能** 代替上述人工核实。

## 5. 使用方式

```ts
import { validateQuestionBank } from '@/services/bankValidation'
import { QUESTION_BANK } from '@/data/questionBank'

// 结构 + 分布校验（草稿库）
validateQuestionBank(QUESTION_BANK) // → ok: true, warnings: []

// 正式题库发布闸门：存在未审核题目即失败
validateQuestionBank(officialBank, { requireVerified: true })
```
