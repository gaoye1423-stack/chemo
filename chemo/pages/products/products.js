Page({
    data: {
      currentSeries: 0,
      seriesList: [
        { id: 1, name: '隔热膜', tag: 'WINDOW FILM' },
        { id: 2, name: '隐形车衣', tag: 'PPF' },
        { id: 3, name: '改色膜', tag: 'COLOR CHANGE' }
      ],
      banners: [
        { tag: 'WINDOW FILM', title: '纳米陶瓷 5G畅行', subtitle: '不阻隔信号的隔热膜' },
        { tag: 'PPF', title: '隐形车衣 守护原厂', subtitle: 'TPU材质 自动修复划痕' },
        { tag: 'COLOR CHANGE', title: '千款颜色 个性定制', subtitle: 'PET底纸 无橘皮纹' }
      ],
      currentBanner: {},
      currentProducts: [],
      allProducts: [], 
      loading: true
    },
  
    onLoad() {
      this.fetchAllProducts();
    },
  
    fetchAllProducts() {
      const db = wx.cloud.database();
      wx.showLoading({ title: '加载产品中...' });
      
      db.collection('products').get({
        success: res => {
          console.log('云端产品库加载成功:', res.data);
          this.setData({
            allProducts: res.data
          }, () => {
            this.updateDisplayData(0); 
          });
        },
        fail: err => {
          console.error('产品库调取失败:', err);
        },
        complete: () => {
          wx.hideLoading();
          this.setData({ loading: false });
        }
      });
    },
  
    updateDisplayData(index) {
      const selectedSeries = this.data.seriesList[index];
      const banner = this.data.banners[index];
      const filteredProducts = this.data.allProducts.filter(item => item.tag === selectedSeries.tag);
  
      this.setData({
        currentSeries: index,
        currentBanner: banner,
        currentProducts: filteredProducts
      });
    },
  
    switchSeries(e) {
      const index = e.currentTarget.dataset.index;
      if (this.data.currentSeries === index) return;
      this.updateDisplayData(index);
      wx.pageScrollTo({ scrollTop: 0, duration: 300 });
    },
  
    goToDetail(e) {
      // 【核心修复】直接取数据库原生的 _id
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ 
        url: `/pages/product-detail/product-detail?id=${id}` 
      });
    },
  
    consult() {
      wx.makePhoneCall({ phoneNumber: '15238370760' });
    }
  });