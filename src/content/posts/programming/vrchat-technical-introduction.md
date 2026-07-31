---
title: 'VRChat 技术入门：从 Unity 到 Udon'
published: 2026-07-31
description: '面向初学者介绍 VRChat 内容创作涉及的技术栈，包括 Unity、VRChat SDK、Udon、Avatar、World、渲染与上传流程。'
image: ''
tags: ['VRChat', 'Unity', 'Udon']
category: '编程'
draft: true
lang: ''
---

VRChat 给人的第一印象通常是一个可以聊天、交友和探索世界的 VR 社交平台。但从创作者的角度看，它也可以被理解为一个建立在 Unity 之上的内容平台：用户使用 Unity 制作 Avatar 和 World，再通过 VRChat SDK 将这些内容发布到平台上。

这篇文章不讨论如何从零制作一个 Avatar，也不展开 UdonSharp 的语法细节，只想先把 VRChat 的技术栈串起来，建立一个整体认识。

## 一、VRChat 的技术栈是什么

如果把 VRChat 的创作流程画成一条链路，大致是这样：

```text
Unity
  ├── 场景、模型、材质、动画、灯光
  └── 项目与资源管理
        ↓
VRChat SDK
  ├── Avatar SDK
  ├── Worlds SDK
  ├── 专用组件与 API
  └── 构建、验证与上传
        ↓
Udon
  ├── World 交互逻辑
  ├── Udon Graph
  ├── UdonSharp
  └── 网络同步
        ↓
VRChat Runtime
  ├── PC / VR / Android 等运行环境
  ├── 渲染与输入
  ├── 多人实例
  └── 性能与安全限制
```

其中最重要的几个词是：

- **Unity**：用来制作场景、模型、动画、材质和灯光。
- **VRChat SDK**：让 Unity 项目能够使用 VRChat 的组件，并完成内容验证、构建和上传。
- **Udon**：VRChat World 使用的脚本系统，用来实现按钮、门、小游戏、传送点等交互。
- **Avatar**：玩家使用的角色模型，以及与之相关的骨骼、动画、表情和物理效果。
- **World**：玩家进入的地图或房间，本质上通常是一个 Unity Scene。

VRChat 官方推荐使用 VRChat Creator Companion 管理 Unity、SDK 和项目。创建 Avatar 和 World 时，通常会分别建立不同类型的 Unity 项目。写作时官方文档列出的 Unity 版本是 `2022.3.22f1`，具体版本可能随着 SDK 更新而变化，实际使用时应以 Creator Companion 和官方文档为准。([官方入门文档](https://creators.vrchat.com/sdk/))

## 二、Unity：VRChat 内容的编辑器

VRChat 本身并不是一个独立的建模软件。创作者需要先在 Unity 中完成大部分内容制作工作。

制作一个 World 时，通常会在 Unity 中处理：

- 3D 模型和场景布局
- 材质与纹理
- 灯光和烘焙光照
- 音频和视频
- 碰撞体与物理组件
- UI 和动画
- VRChat 提供的专用组件

制作 Avatar 时，则会更多地接触：

- Humanoid 骨骼
- Skinned Mesh Renderer
- Animator Controller
- 表情参数
- 手势和动作
- PhysBone
- Contacts
- Avatar Descriptor

因此，VRChat 创作和普通 Unity 游戏开发有一部分共通之处，但并不是把一个普通 Unity 项目直接放进 VRChat 就可以运行。VRChat 对可使用的组件、脚本和资源类型有自己的限制，上传前还会由 SDK 进行检查。

## 三、VRChat SDK：连接 Unity 和 VRChat 的桥梁

VRChat SDK 可以理解为一套平台接入层。它在 Unity 中提供了 VRChat 专用的组件、编辑器窗口和上传工具。

例如，一个 World 通常需要使用 World SDK 提供的组件来描述：

- 玩家进入 World 后的出生点
- 玩家在场景中的初始视角
- World 的基本行为
- 可交互的物体
- 传送点、镜子和座位等平台功能

一个 Avatar 也需要通过 Avatar SDK 告诉 VRChat：

- 模型的根节点在哪里
- 哪些骨骼属于身体
- 如何控制表情和动作
- 哪些参数可以被菜单或手势修改

SDK 还负责处理内容验证、构建和发布。上传并不是简单地把 Unity 文件复制到服务器，而是要经过平台规定的构建流程，并将内容关联到对应的 Blueprint ID。

## 四、World 和 Avatar 是两种不同的内容类型

World 和 Avatar 都使用 Unity 制作，但它们的技术重点不一样。

| 内容 | 更关注什么 |
| --- | --- |
| Avatar | 模型、骨骼、动画、表情、物理和性能 |
| World | 场景、灯光、交互、UI、音视频和多人体验 |

Avatar 更像一个会被加载到其他玩家场景中的动态角色。它的模型、材质、骨骼和物理组件都会消耗性能，而且这种消耗可能会同时影响同一个房间中的其他玩家。

World 则更接近一个完整的多人场景。它除了包含静态环境，还可以通过 Udon 实现游戏规则、交互设备、传送系统、排行榜和各种社交功能。

## 五、渲染：为什么 VRChat 内容需要优化

VRChat 的画面最终仍然要经过 Unity 的渲染系统。模型会经过网格处理，材质会使用 Shader，场景中的灯光会参与实时或烘焙计算，摄像机再将结果输出到屏幕或 VR 设备中。

创作者经常需要关注这些概念：

- **Mesh**：模型的几何数据。
- **Material**：描述模型表面如何被渲染。
- **Shader**：决定材质如何计算颜色、光照和透明度。
- **Lightmap**：预先烘焙好的光照贴图。
- **Light Probe**：为动态物体提供环境光照参考。
- **Mirror**：使用额外渲染过程显示镜像画面。
- **Draw Call**：CPU 向 GPU 提交的一次绘制请求。

VRChat 的特殊之处在于，一个 World 里可能同时存在许多玩家，每个玩家还可能使用复杂的 Avatar。因此，性能不能只按照“自己的电脑能不能跑”来判断，还要考虑其他玩家的设备。

PC、VR 设备和 Android / Quest 设备的性能预算也不同。面向移动端制作内容时，通常需要更加严格地控制模型面数、材质数量、纹理大小、实时灯光、透明效果和镜子等高成本效果。([Android 内容优化文档](https://creators.vrchat.com/platforms/android/quest-content-optimization/))

## 六、Udon：让 World 动起来

如果说 Unity 负责搭建 World 的“身体”，那么 Udon 就负责实现它的“行为”。

有了 Udon，World 可以实现：

- 按钮和开关
- 自动门
- 传送点
- 可拾取物体
- 计分板
- 小游戏
- 交互式 UI
- 角色或物体状态切换
- 多人同步的游戏状态

Udon 主要有两种使用方式。

### Udon Graph

Udon Graph 是可视化脚本工具，通过节点和连线表达程序逻辑。它适合刚开始接触编程的人，也适合制作比较简单的交互。

```text
玩家点击按钮
      ↓
触发 Interact
      ↓
修改物体状态
      ↓
播放动画或音效
```

### UdonSharp

UdonSharp 使用类似 C# 的写法，让熟悉编程的人可以通过代码编写 Udon 逻辑。例如，一个简单的开关可能写成：

```csharp
public class Switch : UdonSharpBehaviour
{
    public GameObject target;

    public override void Interact()
    {
        target.SetActive(!target.activeSelf);
    }
}
```

需要注意的是，UdonSharp 虽然使用 C# 语法，但它不是普通 Unity C# 脚本的直接替代品。UdonSharp 代码最终会被转换为 Udon 程序，在 VRChat 提供的运行环境中执行。Udon 本身可以看作运行在虚拟机上的字节码系统，因此能够执行的 API 和组件受到平台限制。([Udon 官方文档](https://creators.vrchat.com/worlds/udon/))

这也是 VRChat 与普通 Unity 项目最大的区别之一：创作者不是在客户端上自由执行任意代码，而是在一个受约束的脚本环境中制作多人内容。

## 七、多人同步：本地状态不等于网络状态

VRChat World 中的脚本还需要区分“本地发生的事情”和“其他玩家也应该看到的事情”。

例如：

- 玩家自己按下按钮，按钮动画只在本地播放；
- 玩家按下按钮，所有人看到门打开；
- 玩家获得一分，所有人看到排行榜更新。

第一种情况只需要本地逻辑，后两种情况就需要使用网络同步。

可以简单地把它理解成：

```text
本地输入
   ↓
Udon 逻辑
   ↓
本地状态 / 同步变量 / 网络事件
   ↓
其他玩家的实例
```

持续存在的状态通常适合同步变量，例如“门是否打开”“当前比分是多少”；只需要触发一次的动作，则可以使用网络事件，例如“播放一次爆炸特效”。多人同步是 Udon 开发中比较容易遇到的概念，也是 VRChat World 和普通单机 Unity 场景的一个重要区别。

## 八、上传与发布流程

一个简化的 VRChat 内容发布流程如下：

```text
准备模型或场景
      ↓
导入 Unity
      ↓
添加 VRChat SDK 组件
      ↓
配置 Avatar 或 World
      ↓
运行 SDK 检查
      ↓
Build & Publish
      ↓
上传到 VRChat
```

上传之前，SDK 会检查内容是否满足平台要求。例如，World 中某些普通 Unity 脚本并不会在 VRChat 中工作，只有允许使用的组件才能正常运行。World SDK 还提供了 ClientSim，可以在 Unity 编辑器中对部分 World 行为进行测试。([World 官方文档](https://creators.vrchat.com/worlds/))

上传成功后，World 或 Avatar 会对应一个平台上的内容记录。之后修改 Unity 项目，可以继续上传新版本，而不是每次都创建一个全新的对象。

## 九、VRChat 技术生态的特点

VRChat 的技术生态并不只有官方 SDK，还包括大量围绕内容创作形成的工具和社区：

- Unity 和 Blender 教程
- Avatar 制作工具
- World 交互 Prefab
- Shader 和材质工具
- UdonSharp 示例项目
- 性能分析与优化经验
- 跨 PC / Android 平台的适配方案
- 官方文档和创作者社区

如果想开始学习，比较合理的顺序是：

```text
了解 Unity 基础
      ↓
创建一个简单的 World 或 Avatar 项目
      ↓
熟悉 VRChat SDK 组件
      ↓
使用 Udon Graph 制作简单交互
      ↓
学习 UdonSharp
      ↓
理解网络同步和性能优化
```

官方文档是最适合用来确认 SDK、Unity 版本和平台限制的入口；遇到具体问题时，再根据关键词去查 Udon、Avatar、World 或 Android 平台文档。

## 总结

VRChat 的创作技术栈可以概括为：

```text
Unity：制作内容
VRChat SDK：接入平台
Udon：编写 World 逻辑
Avatar / World：两种主要内容形态
渲染与优化：保证内容能够在不同设备上运行
网络同步：让多人看到一致的状态
上传系统：把 Unity 内容发布到 VRChat
```

所以，VRChat 开发并不是简单地“给 Unity 游戏写脚本”。它更像是在 Unity 中制作内容，再通过 VRChat SDK 接入一个带有多人同步、跨平台和安全限制的社交平台。

理解这条链路之后，再去学习 Avatar 制作、World 开发或 UdonSharp，就不会只是记住一堆零散的组件和操作步骤，而是能知道每个工具在整个系统中处于什么位置。

## 参考资料

- [VRChat Creator Documentation](https://creators.vrchat.com/)
- [Getting Started](https://creators.vrchat.com/sdk/)
- [Worlds](https://creators.vrchat.com/worlds/)
- [Udon](https://creators.vrchat.com/worlds/udon/)
- [Android Content Optimization](https://creators.vrchat.com/platforms/android/quest-content-optimization/)
- [Avatar Performance Ranks](https://creators.vrchat.com/avatars/avatar-performance-ranking-system/)
