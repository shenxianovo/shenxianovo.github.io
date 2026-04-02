---
title: "博客框架修改汇总"
published: 2026-03-31T16:00:00+08:00
description: '记录对博客框架的一系列改造，包括功能扩展与实现方式。'
image: ''
tags: []
category: '博客改造'
draft: false 
lang: ''
---

## 博客框架

使用的框架是 `fuwari`，一个基于 `Astro` 开发的静态博客模板

::github{repo="withastro/astro"}
::github{repo="saicaca/fuwari"}

## 数据与统计

### 1. 阅读量统计(View Count)

使用了 Cloudflare KV 与 Workers [查看实现](/posts/blog-customization/view-count/)

## Markdown 处理与扩展

### 1. Code Group 支持

给 code-group 单独写了一个 rehype 插件 [查看实现](/posts/blog-customization/code-group/)

### 2. 外链默认开新标签页

使用插件：`rehype-external-links`

安装：`pnpm install rehype-external-links`  
配置： 
```diff lang="js" title="astro.config.mjs"
+import rehypeExternalLinks from "rehype-external-links";

rehypePlugins: [
+  [
+    rehypeExternalLinks,
+    { target: "_blank", rel: ["noopener", "noreferrer"] },
+  ],
]
```