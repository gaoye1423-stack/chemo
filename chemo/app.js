App({
    onLaunch() {
      // 初始化云开发，必须在所有云操作之前执行
      wx.cloud.init({
        // 粘贴你刚才复制的环境 ID
        env: 'cloud1-7gkprfo6e421a02b', 
        traceUser: true
      });
      console.log('云开发环境已激活');
    }
  })