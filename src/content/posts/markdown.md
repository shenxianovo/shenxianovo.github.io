---
title: '博客样式预览'
published: 2026-03-23
description: 'Markdown语法与Fuwari扩展预览'
image: ''
tags: []
category: '杂项'
draft: false 
lang: ''
---
# Markdown 基础语法

## 标题层级
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 分割线

--- 

## 列表

### 无序列表
- 一级
  - 二级
    - 三级
      - 四级

### 有序列表
1. 第一项
   1. 子项
   2. 子项
2. 第二项

### 任务列表
- [x] 已完成
- [ ] 未完成


## 行内样式

**加粗**  
*斜体*  
~~删除线~~  
`行内代码`  

**加粗 + `代码` + *斜体***  


## 引用块

> 一级引用
>> 二级引用
>>> 三级引用


## 代码块

```cs
using System;

Console.WriteLine("Hello World!");
```
```py
print("Hello World")
```
```ts
const a: number = 1
```
```diff
- old line
+ new line
```
```js
const a = 1
const b = 2
```

## 表格

| 表头             | 表头  |   表头 |
|  | : |--: |
| 左对齐           | 居中  | 右对齐 |
| 内容很长很长很长 | 内容  |   内容 |

| 字段 | 示例 |
| ---- ||
| 代码 | `const a = 1`               |
| 多行 | 你好呀<br>这里是shenxianovo |

## 链接

[普通链接](https://github.com/shenxianovo)  
<https://github.com/shenxianovo>

## 图片

![示例图片](https://avatars.githubusercontent.com/u/138359094?s=64&v=4)

## HTML

<div style="color: red;">红色的字</div>

Bilibili:
<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1706416465&bvid=BV1UT42167xb&cid=1641702404&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

YouTube:
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>

## 数学公式

行内公式：$E = mc^2$

$$
\int_0^1 x^2 dx
$$


## 脚注

这是一个脚注示例[^1]

[^1]: 这是脚注内容

# Fuwari 扩展

## GitHub Repo 卡片

::github{repo="shenxianovo/Heartbeat"}
使用`::github{repo="<owner>/<repo>"}`创建一个 GitHub Repo 卡片。

## 告示框 | Admonition

支持以下syntax： `note` `tip` `important` `warning` `caution`

:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::

:::important
Crucial information necessary for users to succeed.
:::

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

:::caution
Negative potential consequences of an action.
:::

使用方法如下：
```markdown
:::note
Highlights information that users should take into account, even when skimming.
:::

:::tip
Optional information to help a user be more successful.
:::
```

还可以自定义标题
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::

```markdown
:::note[MY CUSTOM TITLE]
This is a note with a custom title.
:::
```

### GitHub Syntax

> [!TIP]
> [The GitHub syntax](https://github.com/orgs/community/discussions/16925) is also supported.

```
> [!NOTE]
> The GitHub syntax is also supported.

> [!TIP]
> The GitHub syntax is also supported.
```

### Spoiler

You can add spoilers to your text. The text also supports **Markdown** syntax.

The content :spoiler[is hidden **ayyy**]!

```markdown
The content :spoiler[is hidden **ayyy**]!

```