Component({
    properties: {
      selected: {
        type: Number,
        value: 0
      }
    },
    data: {
      list: [
        { pagePath: "/pages/index/index", text: "首页" },
        { pagePath: "/pages/products/products", text: "产品" },
        { pagePath: "/pages/warranty/warranty", text: "质保" },
        { pagePath: "/pages/profile/profile", text: "我的" }
      ]
    },
    methods: {
      switchTab(e) {
        const { index, path } = e.currentTarget.dataset
        wx.switchTab({ url: path })
      }
    }
  })