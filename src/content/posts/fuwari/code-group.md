---
title: "Fuwari 功能扩展：Code Group"
published: 2026-03-29
description: '为博客添加 code group 功能，基于 rehype 实现，支持多代码块的 Tab 切换'
image: ''
tags: []
category: 'Fuwari'
draft: false 
lang: ''
---

给博客加了个代码组功能，类似 VitePress 的 [code-groups](https://vitepress.dev/guide/markdown#code-groups)，可以把多个代码块放在一起用 Tab 切换

## 效果

:::code-group

```cs tab="C#" title="Foo.cs"
Console.WriteLine("Hello");
```

```cs tab="C#" title="Bar.cs"
Console.WriteLine("World");
```

```py tab="Python" title="foo.py"
print("Hello")
```

:::

相同 `tab` 值的代码块会归到同一个 Tab 下，通过 sub-tab（文件名）切换

## 用法

用 `:::code-group` 包裹代码块，每个代码块通过 `tab` 指定所属 Tab，`title` 指定文件名：

````md
:::code-group

```cs tab="C#" title="Foo.cs"
Console.WriteLine("Hello");
```

```cs tab="C#" title="Bar.cs"
Console.WriteLine("World");
```

```py tab="Python" title="foo.py"
print("Hello")
```

:::
````

- `tab="..."` — Tab 标签名，相同值的代码块归为一组
- `title="..."` — 文件名，显示在 sub-tab 上（EC 原生属性）
- 不写 `tab` 时回退到语言名大写

## 实现

整个功能涉及四个部分，走的是 **SSR 优先** 的路线——Tab 导航和面板结构全部在 rehype 阶段构建，客户端只负责点击切换

渲染管线：`Markdown → remark-directive → rehype（构建结构）→ Expressive Code（渲染代码块）→ HTML`

### Rehype 插件

`:::code-group` 由 [remark-directive](https://github.com/remarkjs/remark-directive) 解析为容器指令，在 rehype 阶段会变成 `<code-group>` 元素。用一个直接操作 HAST 的 rehype 插件把它改写成完整的 Tab 结构：

```js title="rehype-code-group.mjs"
import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";

function parseMeta(meta, key) {
    const match = meta?.match(new RegExp(`${key}="([^"]+)"`));
    return match ? match[1] : null;
}

export function rehypeCodeGroup() {
    return (tree) => {
        visit(tree, "element", (node) => {
            if (node.tagName !== "code-group") return;

            const codeBlocks = node.children
                .filter((c) => c.tagName === "pre");

            // 按 tab 值分组
            const tabOrder = [];
            const tabGroups = new Map();
            for (const pre of codeBlocks) {
                const code = pre.children
                    ?.find((c) => c.tagName === "code");
                const meta = code?.data?.meta || "";
                const tab = parseMeta(meta, "tab") || "Code";
                if (!tabGroups.has(tab)) {
                    tabOrder.push(tab);
                    tabGroups.set(tab, []);
                }
                tabGroups.get(tab).push({
                    pre,
                    title: parseMeta(meta, "title"),
                });
            }

            // 构建导航栏
            const nav = h("div", { className: ["code-group-nav"] },
                tabOrder.map((label, i) =>
                    h("button", {
                        className: ["code-group-tab",
                            ...(i === 0 ? ["active"] : [])],
                        "data-idx": String(i),
                        type: "button",
                    }, label)
                )
            );

            // 构建面板（含 sub-tab）
            const panels = [];
            tabOrder.forEach((label, ti) => {
                const items = tabGroups.get(label);
                if (items.length > 1 || items.some((i) => i.title)) {
                    // sub-nav
                    panels.push(h("div", {
                        className: ["code-group-sub-nav"],
                        "data-tab": String(ti),
                        style: ti !== 0 ? "display:none" : undefined,
                    }, items.map((item, si) =>
                        h("button", {
                            className: ["code-group-tab",
                                ...(si === 0 ? ["active"] : [])],
                            "data-idx": String(si),
                            type: "button",
                        }, item.title || `#${si + 1}`)
                    )));
                    items.forEach((item, si) => {
                        panels.push(h("div", {
                            className: ["code-group-panel"],
                            "data-tab": String(ti),
                            "data-sub": String(si),
                            style: ti !== 0 || si !== 0
                                ? "display:none" : undefined,
                        }, [item.pre]));
                    });
                } else {
                    panels.push(h("div", {
                        className: ["code-group-panel"],
                        "data-tab": String(ti),
                        style: ti !== 0 ? "display:none" : undefined,
                    }, [items[0].pre]));
                }
            });

            // 原地替换
            node.tagName = "div";
            node.properties = { className: ["code-group"] };
            node.children = [nav, ...panels];
            return SKIP;
        });
    };
}
```

关键点：
- 在 rehype 阶段 `<pre><code>` 还是原始状态，可以从 `code.data.meta` 读取 `tab` 和 `title`
- 用 `h()` 构建导航栏 + 面板结构，直接改写 `node.tagName` / `node.children` 就地替换
- EC 的 rehype 插件在用户插件 **之后** 运行，会把 `<pre>` 替换成渲染后的代码块，但外层的 `div.code-group-panel` 等包装结构不受影响

在 `astro.config.mjs` 里注册为独立 rehype 插件：

```js title="astro.config.mjs"
import { rehypeCodeGroup } from "./src/plugins/rehype-code-group.mjs";

// rehypePlugins 数组
rehypePlugins: [
    rehypeCodeGroup,    // 在 rehype-components 之后
    // ...
]
```

### Expressive Code 插件

EC 不认识 `tab` 属性，会当作未知 meta 报错。写个插件在预处理阶段把它剥掉：

```ts title="code-group-tab.ts"
import { definePlugin } from "@expressive-code/core";

export function pluginCodeGroupTab() {
    return definePlugin({
        name: "Code Group Tab",
        hooks: {
            preprocessMetadata: (context) => {
                const meta = context.codeBlock.meta;
                const match = meta.match(/tab="([^"]+)"/);
                if (match) {
                    context.codeBlock.meta = meta
                        .replace(/tab="[^"]+"/, "").trim();
                }
            },
        },
    });
}
```

只做一件事：从 meta 中移除 `tab="..."`，让 EC 正常解析 `title` 等其他属性

### 客户端脚本

结构已经在 rehype 阶段构建好了，客户端只需要一个全局 click 事件监听器处理 Tab 切换：

```ts title="code-group.ts"
document.addEventListener("click", (e: MouseEvent) => {
    const btn = (e.target as Element | null)
        ?.closest(".code-group-tab") as HTMLElement | null;
    if (!btn) return;
    const nav = btn.parentElement as HTMLElement | null;
    const group = nav?.closest(".code-group") as HTMLElement | null;
    if (!group) return;

    const idx = btn.getAttribute("data-idx")!;

    // 切换 active 状态
    nav!.querySelectorAll(".code-group-tab")
        .forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");

    if (nav!.classList.contains("code-group-nav")) {
        // 顶层 Tab：切换 sub-nav 和 panel 的显示
        group.querySelectorAll<HTMLElement>(
            ":scope > .code-group-sub-nav"
        ).forEach((sn) => {
            sn.style.display =
                sn.getAttribute("data-tab") === idx ? "" : "none";
        });
        group.querySelectorAll<HTMLElement>(
            ":scope > .code-group-panel"
        ).forEach((panel) => {
            if (panel.getAttribute("data-tab") !== idx) {
                panel.style.display = "none";
                return;
            }
            const sub = panel.getAttribute("data-sub");
            if (sub !== null) {
                const activeSub = group.querySelector(
                    `.code-group-sub-nav[data-tab="${idx}"] .active`
                )?.getAttribute("data-idx");
                panel.style.display =
                    sub === activeSub ? "" : "none";
            } else {
                panel.style.display = "";
            }
        });
    } else if (nav!.classList.contains("code-group-sub-nav")) {
        // Sub-tab：只切换同组面板
        const tabIdx = nav!.getAttribute("data-tab")!;
        group.querySelectorAll<HTMLElement>(
            `:scope > .code-group-panel[data-tab="${tabIdx}"]`
        ).forEach((panel) => {
            panel.style.display =
                panel.getAttribute("data-sub") === idx
                    ? "" : "none";
        });
    }
});
```

不需要 `initCodeGroups` 也不需要监听 Swup 的 `page:view` 事件——因为没有 DOM 构建，HTML 就绪即可用

### 样式

Tab 导航栏的背景色复用了 EC 的 `--codeblock-topbar-bg`，保持视觉一致。code-group 内部的 EC 原生标题栏被隐藏（由自定义 Tab 导航替代），圆角也被重置为 0 交给外层容器统一处理