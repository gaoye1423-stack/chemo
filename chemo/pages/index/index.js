const db = wx.cloud.database();

Page({
  data: {
    banners: [
      {
        id: 1,
        tag: 'PREMIUM FILM',
        title: '极致保护 焕新如初',
        subtitle: '专业级汽车膜解决方案',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop'
      },
      {
        id: 2,
        tag: 'NEW ARRIVAL',
        title: '纳米陶瓷 5G畅行',
        subtitle: '不阻隔信号的隔热膜',
        image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop'
      },
      {
        id: 3,
        tag: 'BEST SELLER',
        title: '隐形车衣 守护原厂',
        subtitle: 'TPU材质 自动修复划痕',
        image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1200&h=800&fit=crop'
      }
    ],
    
    productSeries: [], 
    
    hotCases: [
      {
        id: 1,
        carModel: 'Porsche 911',
        product: '全车隐形车衣',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=600&fit=crop'
      },
      {
        id: 2,
        carModel: 'Mercedes E-Class',
        product: '陶瓷隔热膜',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=600&fit=crop'
      },
      {
        id: 3,
        carModel: 'Tesla Model S',
        product: '哑光改色膜',
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=600&fit=crop'
      }
    ]
  },

  onLoad() {
    this.fetchProducts();
  },

  fetchProducts() {
    db.collection('products').limit(5).get({
      success: res => {
        this.setData({
          productSeries: res.data
        });
      },
      fail: err => {
        console.error('数据库读取失败：', err);
      }
    });
  },

  onPullDownRefresh() {
    this.fetchProducts();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 200);
  },

  goToWarranty() {
    wx.switchTab({ url: '/pages/warranty/warranty' });
  },

  goToCases() {
    wx.switchTab({ url: '/pages/cases/cases' });
  },

  goToProducts() {
    wx.switchTab({ url: '/pages/products/products' });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  goToCaseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/case-detail/case-detail?id=${id}` });
  },

  makeAppointment() {
    wx.makePhoneCall({ phoneNumber: '400-888-8888' });
  }
});