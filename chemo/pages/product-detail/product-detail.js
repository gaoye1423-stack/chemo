Page({
    data: {
      product: null,
      loading: true,
      detailImages: [] 
    },
  
    onLoad(options) {
      // 这里的 id 接收的是 _id (那串长字符串)
      const id = options.id ? String(options.id).trim() : '';
      this.fetchCloudData(id);
    },
  
    fetchCloudData(id) {
      if (!id) return;
      const db = wx.cloud.database();
      
      // 【核心修复】直接使用 .doc(id) 获取唯一数据，保证内外一致
      db.collection('products').doc(id).get({
        success: res => {
          if (res.data) {
            const productData = res.data;
            this.setData({ 
              product: productData, 
              loading: false,
              // 确保数据库字段名是 detailImages (注意大小写)
              detailImages: productData.detailImages || [] 
            });
            wx.setNavigationBarTitle({ title: productData.name });
          }
        },
        fail: err => {
          console.error('详情获取失败:', err);
          this.setData({ loading: false });
        }
      });
    },
  
    goHome() {
      wx.switchTab({ url: '/pages/index/index' });
    },
  
    makeCall() {
      wx.makePhoneCall({ phoneNumber: '15238370760' });
    }
  });