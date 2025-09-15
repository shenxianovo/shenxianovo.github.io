import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "_(:з」∠)_",
  description: "Personal blog",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '技术', link: '/tech/' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' },
    ],
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    sidebar: {
      '/tech/': [
        {
          text: "C#",
          collapsed: true,
          items: [
            { text: "C#基础", link: "/tech/csharp/" },
          ]
        },
        {
          text: "杂项",
          collapsed: true,
          items: [
            { text: "正则表达式", link: "/tech/regex" },
          ]
        },
      ],
      'archive': [
        { text: "归档", link: "/archive" },
      ],
      'about': [
        { text: "关于", link: "/about" },
      ]
    }
  }
})
