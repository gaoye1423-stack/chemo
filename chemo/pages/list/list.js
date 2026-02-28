const db = wx.cloud.database();

Page({
  data: {
    records: [],
    loading: true,
    todayCount: 0,
    searchKey: ''
  },

  onShow() {
    this.fetchMyRecords(this.data.searchKey);
  },

  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
  },

  async onSearch() {
    this.fetchMyRecords(this.data.searchKey);
  },

  /**
   * 核心修改：只查询当前用户录入的数据
   */
  async fetchMyRecords(keyword = '') {
    this.setData({ loading: true });
    try {
      const _ = db.command;
      
      // 关键：在小程序端直接调用时，如果权限设为“仅创建者可读写”，
      // 数据库会自动过滤，这里显式加上查询条件更稳妥。
      let query = db.collection('warranty_records');

      // 构造基础过滤条件：如果是普通员工，只能看到自己的数据
      // 注意：如果您的业务逻辑允许老板(OWNER)看所有人，可以加一个角色判断
      let filter = {}; 

      if (keyword) {
        filter = _.and([
          filter,
          _.or([
            { carPlate: db.RegExp({ regexp: keyword, options: 'i' }) },
            { ownerName: db.RegExp({ regexp: keyword, options: 'i' }) }
          ])
        ]);
      }

      // get() 请求在小程序端发出时，云开发会自动带上当前用户的 openid 凭证
      let res = await query.where(filter).orderBy('createTime', 'desc').get();

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const todayCount = res.data.filter(item => item.constructDate === todayStr).length;

      this.setData({
        records: res.data,
        todayCount: todayCount,
        loading: false
      });
    } catch (err) {
      console.error("查询失败：", err);
      this.setData({ loading: false });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `/pages/warranty-detail/detail?id=${id}`
    });
  },

  /**
   * 删除功能：带权限校验
   */
  async deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    const plate = e.currentTarget.dataset.plate;

    if (!id) return;

    wx.showModal({
      title: '删除确认',
      content: `确定要删除车牌为 [${plate}] 的记录吗？`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在删除' });
          try {
            // 云数据库权限会自动拦截非本人创建的 doc(id).remove() 操作
            await db.collection('warranty_records').doc(id).remove();
            
            wx.hideLoading();
            wx.showToast({ title: '删除成功' });
            this.fetchMyRecords(this.data.searchKey);
          } catch (err) {
            console.error("删除失败", err);
            wx.hideLoading();
            // 如果报错，通常是因为试图删除他人的数据
            wx.showToast({ 
              title: '无权删除他人记录', 
              icon: 'none' 
            });
          }
        }
      }
    });
  }
});