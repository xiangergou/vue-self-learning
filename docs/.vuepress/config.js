module.exports = {
  title: "vuepress-theme-reco",
  description: 'A simple and beautiful vuepress blog theme .',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/', icon: 'reco-home' },
      { text: 'Guide', link: '/views/art/page1', icon: 'reco-date', location: 2, },
      { text: 'TimeLine', link: '/timeLine/', icon: 'reco-date' },
      { text: 'Contact', 
        icon: 'reco-message',
        items: [
          { text: 'NPM', link: 'https://www.npmjs.com/~reco_luan', icon: 'reco-npm' },
          { text: 'GitHub', link: 'https://github.com/recoluan', icon: 'reco-github' },
          { text: '简书', link: 'https://www.jianshu.com/u/cd674a19515e', icon: 'reco-jianshu' },
          { text: 'CSDN', link: 'https://blog.csdn.net/recoluan', icon: 'reco-csdn' },
          { text: '博客圆', link: 'https://www.cnblogs.com/luanhewei/', icon: 'reco-bokeyuan' },
          { text: 'WeChat', link: 'https://mp.weixin.qq.com/s/mXFqeUTegdvPliXknAAG_A', icon: 'reco-wechat' },
        ]
      }
    ],
    // 博客设置
    blogConfig: {
      // category: {
      //   location: 2, // 在导航栏菜单中所占的位置，默认2
      //   text: 'Category' // 默认 “分类”
      // },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: 'Tag' // 默认 “标签”
      }
    },
    logo: '/head.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 自动形成侧边导航
    // sidebar: 'auto',
    sidebar: [
      {
        title: 'JavaScript', // 侧边栏名称
        collapsable: true, // 可折叠
        children: [
          '/views/art/page0',
          '/views/art/page1',
          '/views/art/page2',
          '/views/art/page3'
        ]

      },

    ],
    // sidebar: {
    //   '/views/art/': [
    //     {
    //       title: '正文(持续更新...)',
    //       children: [
    //         '',
    //         'page1'
    //       ]
    //     }
    //   ]
    // },
    // 最后更新时间
    lastUpdated: 'Last Updated',
    // 作者
    author: 'liuxia',
    // 备案号
    record: 'xxxx',
    // 项目开始时间
    startYear: '2017'
    /**
     * 密钥 (if your blog is private)
     */

    // keyPage: {
    //   keys: ['your password'],
    //   color: '#42b983',
    //   lineColor: '#42b983'
    // },

    /**
     * valine 设置 (if you need valine comment )
     */

    // valineConfig: {
    //   appId: '...',// your appId
    //   appKey: '...', // your appKey
    // }
  },
  markdown: {
    lineNumbers: true
  },
  plugins: ['@vuepress/medium-zoom', 'flowchart']
}  