const db = wx.cloud.database();

Page({
  data: {
    info: null,
    loading: true,
    displayTime: ''
  },

  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id);
    } else {
      wx.showToast({ title: '参数缺失', icon: 'none' });
    }
  },

  async fetchDetail(id) {
    this.setData({ loading: true });
    try {
      const res = await db.collection('warranty_records').doc(id).get();
      let data = res.data;

      // 格式化备案时间
      let timeStr = "已联网备案";
      if (data.createTime) {
        const t = new Date(data.createTime);
        timeStr = `${t.getFullYear()}-${(t.getMonth() + 1).toString().padStart(2, '0')}-${t.getDate().toString().padStart(2, '0')} ${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      }

      this.setData({
        info: data,
        displayTime: timeStr,
        loading: false
      });
    } catch (err) {
      console.error("详情拉取失败", err);
      wx.showToast({ title: '记录不存在', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.info.imagePhotos
    });
  }
});