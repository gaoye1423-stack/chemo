Component({
    properties: {
      title: {
        type: String,
        value: ''
      }
    },
    data: {
      statusBarHeight: 20,
      navBarHeight: 44
    },
    attached() {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
        navBarHeight: 44
      })
    }
  })