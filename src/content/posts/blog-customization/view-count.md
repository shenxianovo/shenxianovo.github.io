---
title: "Fuwari 功能扩展：View Count"
published: 2026-04-02
description: '为博客添加阅读量计数功能，使用 Cloudflare KV 与 Workers 实现'
image: ''
tags: []
category: '博客改造'
draft: false 
lang: ''
---

## 实现思路

使用的方案是 Cloudflare Workers + KV Storage，整体架构如下：

前端页面 → Cloudflare Worker → KV Storage

- 前端通过 API 获取阅读量（GET）
- 页面加载时可选择上报一次访问（POST）
- Worker 负责计数、防刷与存储

其中，对于 API 防刷，基于 IP + slug 设计了 5 分钟的冷却期：统一用户短时间内重复访问不会重复计数。并通过白名单限制允许访问的域名，避免滥用接口。

KV 结构：
- views:{slug} → 阅读数
- cooldown:{ip}:{slug} → 冷却标记

## 代码实现

::::details

:::code-group

```js title="worker.js" tab="Cloudflare 配置"
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // CORS 预检
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders(request),
        });
      }

      if (path.startsWith("/blog/views")) {
        const slug = url.searchParams.get("slug");
        // 校验 slug 格式，只允许合法路径字符
        if (!slug || !/^[a-zA-Z0-9\-_\/]+$/.test(slug)) {
          return corsResponse("Invalid or missing slug", 400, request);
        }

        const key = `views:${slug}`;

        if (request.method === "POST") {
          // —— 防刷：基于 IP + slug 的冷却期（同一 IP 对同一篇文章 5 分钟内只算 1 次）——
          const ip = request.headers.get("CF-Connecting-IP") || "unknown";
          const cooldownKey = `cooldown:${ip}:${slug}`;
          const cooldown = await env.BLOG_VIEWS.get(cooldownKey);

          if (cooldown) {
            // 冷却期内，直接返回当前值，不计数
            const current = (await env.BLOG_VIEWS.get(key)) || "0";
            return corsResponse(current, 200, request);
          }

          // 设置冷却期 5 分钟（300 秒后自动过期）
          await env.BLOG_VIEWS.put(cooldownKey, "1", { expirationTtl: 300 });

          // 递增计数
          const current = parseInt((await env.BLOG_VIEWS.get(key)) || "0");
          const updated = current + 1;
          await env.BLOG_VIEWS.put(key, updated.toString());

          return corsResponse(updated.toString(), 200, request);
        } else if (request.method === "GET") {
          const current = (await env.BLOG_VIEWS.get(key)) || "0";
          return corsResponse(current, 200, request);
        } else {
          return corsResponse("Method not allowed", 405, request);
        }
      }

      return corsResponse("Not found", 404, request);
    } catch (err) {
      return new Response("Worker error: " + err.message, { status: 500 });
    }
  },
};

// —— 工具函数 ——

const ALLOWED_ORIGINS = [
  "https://shenxianovo.github.io",
  "https://blog.shenxianovo.com",
  // "http://localhost:4321"
];

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function corsResponse(body, status, request) {
  return new Response(body, {
    status,
    headers: corsHeaders(request),
  });
}
```

```diff lang="ts" title="src/constants/constants.ts" tab="博客配置"
+ // Cloudflare Worker view count API
+ export const VIEW_COUNT_API = "https://api.shenxianovo.com/blog/views";
```

```svelte title="src/components/ViewCount.svelte" tab="博客配置"
<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

export let slug: string;
export let increment = false;
export let apiBase: string;

let count: number | null = null;

onMount(async () => {
	try {
		if (increment) {
			const res = await fetch(`${apiBase}?slug=${encodeURIComponent(slug)}`, {
				method: "POST",
			});
			if (res.ok) {
				count = Number.parseInt(await res.text(), 10) || 0;
			}
		} else {
			const res = await fetch(`${apiBase}?slug=${encodeURIComponent(slug)}`);
			if (res.ok) {
				count = Number.parseInt(await res.text(), 10) || 0;
			}
		}
	} catch {
		// silently fail — view count is non-critical
	}
});
</script>

<div class="flex flex-row items-center">
  <slot />
  <div class="text-sm">
    {#if count !== null}
      {count} 次浏览
    {:else}
      <span class="opacity-50">- 次浏览</span>
    {/if}
  </div>
</div>
```

```diff lang="astro" title="src/components/PostCard.astro" tab="博客配置"
+ import { VIEW_COUNT_API } from "../constants/constants";
+ import ViewCount from "./ViewCount.svelte";

        <div class="text-sm text-black/30 dark:text-white/30 flex gap-4 transition">
+            <div>|</div>
+            <ViewCount client:idle slug={entry.slug} apiBase={VIEW_COUNT_API} />
        </div>

```

```diff lang="astro" title="src/pages/posts/[...slug].astro" tab="博客配置"
+ import ViewCount from "../../components/ViewCount.svelte";
+ import { VIEW_COUNT_API } from "../../constants/constants";

<MainGridLayout banner={entry.data.image} title={entry.data.title} description={entry.data.description} lang={entry.data.lang} setOGTypeArticle={true} headings={headings}>
    <script is:inline slot="head" type="application/ld+json" set:html={JSON.stringify(jsonLd)}></script>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative mb-4">
        <div id="post-container" class:list={["card-base z-10 px-6 md:px-9 pt-6 pb-4 relative w-full ",
            {}
        ]}>
            <!-- word count and reading time -->
            <div class="flex flex-row text-black/30 dark:text-white/30 gap-5 mb-3 transition onload-animation">
+                <div class="flex flex-row items-center">
+                    <ViewCount client:idle slug={entry.slug} increment={true} apiBase={VIEW_COUNT_API}>
+                        <div class="transition h-6 w-6 rounded-md bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center mr-2">
+                            <Icon name="material-symbols:visibility-outline-rounded"></Icon>
+                        </div>
+                    </ViewCount>
+                </div>
            </div>

```
:::

::::
