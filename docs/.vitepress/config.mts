import { defineConfig } from 'vitepress'
import { 
  GitChangelog, 
  GitChangelogMarkdownSection, 
} from '@nolebase/vitepress-plugin-git-changelog/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: "名無しのひとりごと",
  description: "Personal blog",
  sitemap: {
		hostname: "https://shenxianovo.github.io/", // 网站域名
	},
  vite: {
    plugins: [
      GitChangelog({
        repoURL: () => 'https://github.com/shenxianovo/shenxianovo.github.io',
      }),
      GitChangelogMarkdownSection({
        sections: {
          disableContributors: true,
        }
      }),
    ],
  },
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
    },
    lastUpdated: {
			text: "最后更新",
			formatOptions: {
				dateStyle: "medium",
				timeStyle: "short"
			}
		},
		docFooter: {
			prev: "上一页",
			next: "下一页"
		},
		search: {
			provider: "local",
		},
  }
})
