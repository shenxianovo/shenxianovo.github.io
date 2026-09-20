---
title: '从对话到 Agent：用户、模型与环境的最小模型'
published: 2026-09-20
description: '用一组最小对象统一描述单轮交互、多轮对话与 Agent，并从用户—模型、模型—环境两条反馈回路理解它们的区别。'
image: ''
tags: ['LLM', 'Agent', '形式化建模']
category: 'AI'
draft: false
lang: 'zh-CN'
---

我们常说“单轮问答”“多轮对话”和“Agent”，但这三个概念的边界并不总是清楚：多聊几轮就算 Agent 吗？模型调用一次工具又改变了什么？Memory、Planner 和 Tool 是否都是不可缺少的新概念？

与其继续增加术语，不如先退回到最少的对象：**用户、模型、环境，以及它们之间流动的信息**。本文尝试用这组对象描述三种结构。它们可以彼此叠加，真正的差别在于用户、模型与环境如何交互。

## 基本符号

| 符号 | 含义 |
| --- | --- |
| $I$ | Intent，用户希望完成的目标 |
| $C^U$ | 用户生成请求时拥有的上下文 |
| $C^M$ | 模型生成输出时可见的上下文 |
| $R$ | Request，用户发给模型的请求 |
| $A$ | Answer，最终返回给用户的回答 |
| $U$ | 用户根据意图和上下文生成请求的过程 |
| $M$ | 模型根据输入和可见上下文生成输出的过程 |
| $X$ | Action，模型对外部环境发出的动作 |
| $O$ | Observation，环境返回给模型的观测 |
| $E$ | Environment，模型可以作用和观测的外部环境 |

用户上下文和模型上下文可能重合，但通常不相等：

$$
C^U \neq C^M
$$

用户知道自己的现实目标、处境和隐含动机；模型通常只能看到会话历史、System Prompt 和工具结果。很多交互问题——答非所问、意图误判、信息不足——都可以先从这两个上下文之间的差异来理解。

## 单轮交互：从请求到回答

用户根据意图和上下文生成请求，模型再生成回答：

$$
\boxed{
\begin{aligned}
R &= U(I,C^U)\\
A &= M(R,C^M)
\end{aligned}
}
$$

<div style="display:flex;justify-content:center;margin:1.5rem 0;overflow-x:auto;">
<svg viewBox="0 0 760 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="single-turn-title" style="min-width:620px;width:100%;max-width:760px;font-family:system-ui,sans-serif;color:inherit;">
  <title id="single-turn-title">单轮交互：意图与用户上下文生成请求，请求与模型上下文生成回答</title>
  <defs>
    <marker id="arrow-single" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)"/>
    </marker>
  </defs>
  <g fill="var(--card-bg)" stroke="var(--primary)" stroke-width="2">
    <rect x="20" y="20" width="130" height="50" rx="12"/>
    <rect x="20" y="120" width="130" height="50" rx="12"/>
    <rect x="210" y="70" width="120" height="50" rx="12"/>
    <rect x="395" y="70" width="120" height="50" rx="12"/>
    <rect x="580" y="70" width="120" height="50" rx="12"/>
    <rect x="395" y="140" width="120" height="38" rx="12" stroke-dasharray="5 4"/>
  </g>
  <g fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-single)">
    <path d="M150 45 C185 45 180 83 210 90"/>
    <path d="M150 145 C185 145 180 108 210 100"/>
    <path d="M330 95 H395"/>
    <path d="M515 95 H580"/>
    <path d="M455 140 V123"/>
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="16">
    <text x="85" y="51">意图 I</text>
    <text x="85" y="151">用户上下文 Cᵁ</text>
    <text x="270" y="101">用户 U</text>
    <text x="455" y="101">请求 R</text>
    <text x="640" y="101">模型 M</text>
    <text x="455" y="165" font-size="14">模型上下文 Cᴹ</text>
  </g>
  <path d="M700 95 H742" fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-single)"/>
  <text x="733" y="78" fill="currentColor" text-anchor="middle" font-size="16">回答 A</text>
</svg>
</div>

当模型没有额外上下文时，令 $C^M=\varnothing$，可简化为：

$$
A=M(R)
$$

因此，$A=M(R)$ 是特例，而不是一般形式。真实系统中的模型几乎总处在某种上下文中，只是这部分经常被表达式省略了。

## 多轮对话：用户与模型形成反馈

第 $t$ 轮仍遵循单轮关系，但请求和回答会更新双方的上下文：

$$
\boxed{
\begin{aligned}
R_t &= U(I_t,C^U_t)\\
A_t &= M(R_t,C^M_t)\\
C^U_{t+1} &= F_U(C^U_t,R_t,A_t)\\
C^M_{t+1} &= F_M(C^M_t,R_t,A_t)
\end{aligned}
}
$$

这里的 $F_U$ 和 $F_M$ 分别表示用户侧与模型侧的上下文更新过程。

<div style="display:flex;justify-content:center;margin:1.5rem 0;overflow-x:auto;">
<svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="multi-turn-title" style="min-width:600px;width:100%;max-width:720px;font-family:system-ui,sans-serif;color:inherit;">
  <title id="multi-turn-title">多轮对话：请求与回答在用户和模型之间形成反馈回路，并更新双方上下文</title>
  <defs>
    <marker id="arrow-multi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)"/>
    </marker>
  </defs>
  <g fill="var(--card-bg)" stroke="var(--primary)" stroke-width="2">
    <rect x="55" y="75" width="170" height="80" rx="14"/>
    <rect x="495" y="75" width="170" height="80" rx="14"/>
    <rect x="65" y="180" width="150" height="36" rx="12" stroke-dasharray="5 4"/>
    <rect x="505" y="180" width="150" height="36" rx="12" stroke-dasharray="5 4"/>
  </g>
  <g fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-multi)">
    <path d="M225 98 H495"/>
    <path d="M495 135 H225"/>
    <path d="M140 180 V158"/>
    <path d="M580 180 V158"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="140" y="108" font-size="18" font-weight="600">用户 U</text>
    <text x="140" y="135" font-size="14">意图 Iₜ · 上下文 Cᵁₜ</text>
    <text x="580" y="108" font-size="18" font-weight="600">模型 M</text>
    <text x="580" y="135" font-size="14">模型上下文 Cᴹₜ</text>
    <text x="360" y="87" font-size="15">请求 Rₜ</text>
    <text x="360" y="158" font-size="15">回答 Aₜ</text>
    <text x="140" y="203" font-size="13">Fᵁ 更新上下文</text>
    <text x="580" y="203" font-size="13">Fᴹ 更新上下文</text>
  </g>
</svg>
</div>

多轮对话的关键结构，是用户与模型之间出现反馈：

$$
\boxed{U \leftrightarrow M}
$$

回答可能改变用户对问题的认识，进而改变下一轮目标，因此不要求 $I_t=I_{t+1}$。多轮对话不只是把历史消息拼到 Prompt 后面，它还包含用户侧认知和意图的变化。

## Agent：模型与环境形成反馈

Agent 允许模型先作用于外部环境，再根据观测继续决策：

$$
\boxed{
\begin{aligned}
R &= U(I,C^U)\\
X_t &= M(R,C^M_t)\\
O_t &= E(X_t)\\
C^M_{t+1} &= F_M(C^M_t,X_t,O_t)\\
A &= M(R,C^M_n)
\end{aligned}
}
$$

其中，$X_t$ 可以是搜索、数据库查询、代码执行、文件读取或 API 调用，$O_t$ 是相应结果。模型可以重复产生 $X_t,O_t$，直到在第 $n$ 步拥有足够信息并输出最终回答。

<div style="display:flex;justify-content:center;margin:1.5rem 0;overflow-x:auto;">
<svg viewBox="0 0 780 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="agent-title" style="min-width:640px;width:100%;max-width:780px;font-family:system-ui,sans-serif;color:inherit;">
  <title id="agent-title">Agent：模型向环境发出动作，环境返回观测，观测更新模型上下文</title>
  <defs>
    <marker id="arrow-agent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)"/>
    </marker>
  </defs>
  <g fill="var(--card-bg)" stroke="var(--primary)" stroke-width="2">
    <rect x="20" y="85" width="125" height="60" rx="13"/>
    <rect x="220" y="85" width="125" height="60" rx="13"/>
    <rect x="430" y="85" width="125" height="60" rx="13"/>
    <rect x="630" y="85" width="125" height="60" rx="13"/>
    <rect x="220" y="190" width="125" height="38" rx="12" stroke-dasharray="5 4"/>
  </g>
  <g fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-agent)">
    <path d="M145 115 H220"/>
    <path d="M345 115 H430"/>
    <path d="M555 115 H630"/>
    <path d="M692 145 C692 205 380 205 345 135"/>
    <path d="M282 190 V148"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="82" y="121" font-size="16">请求 R</text>
    <text x="282" y="121" font-size="16">模型 M</text>
    <text x="492" y="121" font-size="16">动作 Xₜ</text>
    <text x="692" y="121" font-size="16">环境 E</text>
    <text x="520" y="193" font-size="15">观测 Oₜ</text>
    <text x="282" y="214" font-size="13">模型上下文 Cᴹₜ</text>
  </g>
  <path d="M282 85 V35 H385" fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#arrow-agent)"/>
  <text x="455" y="41" fill="currentColor" text-anchor="middle" font-size="16">最终回答 A</text>
</svg>
</div>

Agent 的关键结构，是模型与环境之间出现反馈：

$$
\boxed{M \leftrightarrow E}
$$

因此，Agent 不必被定义成一种全新的模型。更简单的理解是：**Agent 是 Model 与 Environment 的迭代交互过程**。模型未必变了，变化的是模型所处的系统结构。

## 三类结构放在一起

| 结构 | 核心关系 | 新增机制 |
| --- | --- | --- |
| 单轮交互 | $U \rightarrow M$ | 用户请求一次，模型回答一次 |
| 多轮对话 | $U \leftrightarrow M$ | 前一轮结果进入后一轮上下文 |
| Agent | $M \leftrightarrow E$ | 模型通过动作和观测与环境迭代 |

一个系统可以同时包含后两种反馈：

$$
\boxed{U \leftrightarrow M \leftrightarrow E}
$$

这也是今天常见的对话式 Agent：用户可以持续修正目标，模型也可以持续从环境获得新信息。它不是三种系统中的第四种，而是两条反馈回路的组合。

## 更复杂的系统

多用户、多模型和多环境只是在这套结构上增加节点或连接：

$$
\boxed{U_i \leftrightarrow M_j \leftrightarrow E_k}
$$

进一步，可以把整个系统写成一张动态图：

$$
\boxed{
\mathcal G=(V,L),\qquad
V=\{U_i,M_j,E_k\}
}
$$

其中，$L$ 表示节点之间的信息或作用关系。Multi-Agent、Human-in-the-loop Agent 和 Autonomous Agent 都可以在这套图结构上描述。

State、Memory、Planner 和 Tool 也不必立刻提升为新的基本对象：

$$
S_t \equiv (R,C^M_t,X_{<t},O_{<t})
$$

- **State** 是已有信息在某一时刻的封装。
- **Memory** 是 Context 的持久化来源。
- **Tool** 是 Environment 中接受 Action 并返回 Observation 的部分。
- **Planner** 是 Model 产生 Action 的策略或实现方式。

因此，当前用于描述系统的核心对象仍然可以保持为：

$$
\boxed{I,C,R,A,U,M,X,O,E}
$$

$F_U$ 与 $F_M$ 只是这些对象之间的上下文更新关系。只有当这组对象确实无法表达某种现象时，我们才需要增加新的基本对象。形式化的价值不在于把系统写得更复杂，而在于找到足以解释问题的最小结构。

## 一个例子：从单条消息的 Intent 还原用户请求

假设我们收集了一批用户与模型的对话，希望给其中的消息打标，并进一步还原用户真正想解决的问题。一段对话可以记为：

$$
H=(R_1,A_1,R_2,A_2,\ldots,R_T,A_T)
$$

例如：

> **$R_1$ 用户：** 钱怎么还没到？<br>
> **$A_1$ 模型：** 请问是退款、提现还是转账？<br>
> **$R_2$ 用户：** 退款。<br>
> **$A_2$ 模型：** 订单页显示退款成功了吗？<br>
> **$R_3$ 用户：** 昨天就成功了。<br>
> **$A_3$ 模型：** 原路退回银行卡通常还需要一段处理时间……

读完整段对话后，我们可以把请求概括为“查询退款成功后银行卡仍未到账”。但实际批量处理时，可以采用两种不同方式：一种是把每条 $R_t$ 和 $A_t$ **分别做 Embedding，再对单条消息聚类**；另一种是**先设计标签体系，再让 LLM 根据输入完成分类**。

要解释两种方式的结果为什么不同，需要先分清两件事：LLM 是和 Embedding 一样只看单条消息，还是会看到完整对话；它是在发现数据中的自然分组，还是在套用一套预先设计的标签。

### 单条消息 Embedding：识别局部语义

Embedding 方案对每条消息分别编码：

$$
\begin{aligned}
z^R_t &= \operatorname{Emb}(R_t)\\
z^A_t &= \operatorname{Emb}(A_t)
\end{aligned}
$$

再根据向量距离分别聚类：

$$
\hat y^R_t=\operatorname{Cluster}(z^R_t),\qquad
\hat y^A_t=\operatorname{Cluster}(z^A_t)
$$

在上面的例子中，各条消息可能呈现出这样的局部 Intent：

| 消息 | 单条消息可能聚出的 Intent |
| --- | --- |
| $R_1$：钱怎么还没到？ | 资金未到账 / 到账异常 |
| $A_1$：请问是退款、提现还是转账？ | 澄清资金类型 |
| $R_2$：退款。 | 补充业务类型 / 退款主题 |
| $A_2$：订单页显示退款成功了吗？ | 确认处理状态 |
| $R_3$：昨天就成功了。 | 补充状态与时间 |
| $A_3$：原路退回银行卡通常还需要…… | 解释退款到账时效 |

这些结果并没有错。它们描述的是**每条消息当下在做什么**。但没有任何一条消息独立包含“退款已经成功，但银行卡仍未到账”这一完整请求。完整语义是随着 $R_t$ 与 $A_t$ 交替出现、双方上下文不断更新后才形成的：

$$
C^U_{t+1}=F_U(C^U_t,R_t,A_t),\qquad
C^M_{t+1}=F_M(C^M_t,R_t,A_t)
$$

单独计算 $\operatorname{Emb}(R_t)$ 或 $\operatorname{Emb}(A_t)$，相当于在打标时没有显式带入这段对话上下文。它能发现消息级的语义相似性，却不会自动恢复被分散在多个轮次中的信息。

这里还要区分 $R_t$ 和 $A_t$ 的角色：$R_t$ 是用户在当前意图和上下文下产生的请求；$A_t$ 是模型在自己的上下文下产生的回答。因此，对 $A_t$ 聚类得到的更准确说是**回答 Intent**，例如澄清、确认、解释或拒答，而不是用户 Intent。

### 标签体系加 LLM：按预设边界分类

另一种方式是先定义标签集合 $\mathcal L$，写清标签边界和示例，再让 LLM 分类。如果同样对每条消息分别打标，可以写成：

$$
\begin{aligned}
\hat y^R_t &= M_{\text{tag}}(R_t,\mathcal L,C^M_{\text{tag}})\\
\hat y^A_t &= M_{\text{tag}}(A_t,\mathcal L,C^M_{\text{tag}})
\end{aligned}
$$

此时 LLM 和 Embedding 处理的是相同粒度的输入，但优化目标仍然不同：Embedding 聚类寻找的是表示空间中自然接近的样本；LLM 分类则是在 $\mathcal L$ 定义的边界内选择标签。标签定义、示例和打标 Prompt 都属于 $C^M_{\text{tag}}$，它们会主动规定哪些差异重要、哪些差异可以忽略。

例如，Embedding 可能把“钱怎么还没到？”与退款、提现、转账等消息聚成宽泛的“资金未到账”；如果预设标签要求区分具体业务，单条消息 LLM 则可能输出“信息不足”或一个兜底标签。反过来，如果标签体系只有“资金时效咨询”，LLM 会主动合并 Embedding 空间里原本可以分开的多个簇。

如果目标不是给单条消息打标，而是还原整段对话的用户请求，还可以把完整历史 $H$ 一起提供给 LLM：

$$
\hat y_H=M_{\text{tag}}(H,\mathcal L,C^M_{\text{tag}})
$$

这时 LLM 同时看到了“未到账”“退款”“已经成功”以及各条消息的先后关系，可以把分散在不同轮次的信息组合起来，并输出“退款成功但未到账”。这里的结果又多了一层差异：它已经从消息级分类变成了对话级归纳。

### 为什么两边的结果不同

| 维度 | 单条消息 Embedding 聚类 | 单条消息 LLM 分类 | 完整对话 LLM 分类 |
| --- | --- | --- | --- |
| 输入 | 单个 $R_t$ 或 $A_t$ | 单个 $R_t$ 或 $A_t$ | 完整对话 $H$ |
| 粒度 | 消息级 Intent | 消息级 Intent | 对话级用户请求 |
| 上下文 | 不显式包含其他轮次 | 标签、定义和示例 | 标签以及对话历史、顺序、角色 |
| 目标 | 找到语义相似的消息 | 映射到预设消息标签 | 映射到预设对话标签 |
| 输出 | 数据分布形成的一串局部簇 | 标签体系规定的一串局部标签 | 一个整体标签 |

从形式上看，无论使用 Embedding 聚类还是让 LLM 逐条分类，消息级方案最终得到的都是一个标签序列：

$$
(\hat y^R_1,\hat y^A_1,\ldots,\hat y^R_T,\hat y^A_T)
$$

而对话级 LLM 得到的是一个整体判断 $\hat y_H$。如果希望仅凭单条消息的打标结果还原整段请求，中间其实还缺少一个聚合过程：

$$
\hat y_H
=G(\hat y^R_1,\hat y^A_1,\ldots,\hat y^R_T,\hat y^A_T,
\text{order},\text{role})
$$

$G$ 不仅要合并局部标签，还要理解消息顺序和用户、模型的不同角色。这个聚合过程可以由规则、另一个模型或读取完整历史的 LLM 实现。没有 $G$，就不能直接拿“一串消息 Intent”与“一个对话标签”比较，并把差异归因于 Embedding 或 LLM 的能力。

回到最初的形式化描述，单条请求满足：

$$
R_t=U(I_t,C^U_t)
$$

当 $R_t$ 脱离 $C^U_t$ 单独出现时，省略、指代和承接关系都会丢失。“退款”“昨天就成功了”在完整对话中很关键，单独看却都不足以表达最终请求。这正是 $A=M(R)$ 只是一种特例、一般形式必须保留 Context 的实际例子。

因此，要分两层理解结果差异：在相同的单条消息粒度下，**Embedding 聚类发现的是数据中的相似结构，LLM 分类执行的是人为定义的标签边界**；当 LLM 读取完整对话时，它还额外承担了上下文恢复与消息聚合。要公平比较两种方法，需要先对齐输入、上下文、粒度与标签目标。
