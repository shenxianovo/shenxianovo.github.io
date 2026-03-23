---
title: '视奸本人存活状态'
published: 2026-03-23
description: '一个 Windows 应用使用监视器的开发记录'
image: ''
tags: ['C#', 'WPF', 'Vue.js', 'TypeScript']
category: '编程'
draft: false 
lang: ''
---

2026.2.25开始做的一个小玩意。  
~~其实一开始是想做个类似 死了么 的东西，结果做成了应用时长监控（笑）~~

<center>
  <a href="https://shenxianovo.com/heartbeat/" target="_blank">点我视奸</a>
</center>

::github{repo="shenxianovo/Heartbeat"}

![](/images/posts/projects/image.png)


## 项目架构

```
客户端  →  ASP.NET Core 服务端  →  PostgreSQL
                    ↓
            Vue 3 Web 仪表盘
```

具体架构可以去 GitHub 仓库看看，README 和 docs 里面都有介绍

## 桌面端

做了一个终端和WPF应用，共用核心逻辑  
有几个比较好玩的点

### 前台应用获取

开了个线程跑 `GetMessage/DispatchMessage`，使用 `SetWinEventHook` 获取事件，避免了轮询

### 应用图标提取

获取应用图标的思路是：`拿到exe路径`->`提取图标`

但是实现起来比想象中要麻烦的多，因为 Windows 图标资源结构不统一（~~你看看微软出的一堆UI框架就知道了：WinForms，WPF，UWP，WinUI3~~）

所以写了一大堆：
1. MSIX / UWP / WinUI3 打包应用
   - `GetPackageFullName`
   - `GetPackagePathByFullName`
2. 从进程获取 exe 路径
   - `QueryFullProcessImageName` *这个 API 的 Image 并不是图片哦，而是映像*
   - `Process.MainModule.FileName`
3. 从 exe 提取图标
   - `SHGetFileInfo`，Win32 的 API
   - `Icon.ExtractAssociatedIcon`，.NET 的 API
4. 如果拿不到图标，或者提取失败，直接从主窗口获取 *有些应用只有窗口图标没有exe图标*
   1. `Process.MainWindowHandle` 获取窗口句柄
   2. `SendMessage` 发送 `WM_GETICON` 消息获取图标
5. 还拿不到就只能查注册表了

## 服务端

服务端比较标准，ASP.NET Core + EF Core + PostgreSQL

有一个值得一提的地方是使用记录合并：客户端每分钟会把累积的使用记录截断上传，这样同一个应用连续使用时会产生很多首尾相连的短记录。服务端在入库时做了 5 秒容差的自动合并，把这些碎片拼回去。

## 前端

纯 Vibe Coding（使用的编码模型是Claude Opus 4.6）。AI 神力

## 部署

写了个 bash 脚本做增量部署。只改了前端就只重新 build 前端，只改了后端就只重启后端进程