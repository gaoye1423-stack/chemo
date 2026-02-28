const db = wx.cloud.database()

Page({
  data: {
    inputName: '',
    inputPhone: '',
    staffList: []
  },

  onLoad() {
    this.fetchStaffList()
  },

  onNameInput(e) { this.setData({ inputName: e.detail.value }) },
  onPhoneInput(e) { this.setData({ inputPhone: e.detail.value }) },

  // 获取本门店店员列表
  async fetchStaffList() {
    wx.showLoading({ title: '加载中' })
    try {
      // 假设 storeId 存在全局变量或本地缓存
      const res = await db.collection('dealers').where({
        role: 'STAFF' 
        // 如果需要按门店隔离，加上：storeId: getApp().globalData.roleInfo.storeId
      }).get()
      this.setData({ staffList: res.data })
    } finally {
      wx.hideLoading()
    }
  },

  // 提交添加
  async submitStaff() {
    const { inputName, inputPhone } = this.data
    if (!inputName || !inputPhone) {
      return wx.showToast({ title: '请填写完整', icon: 'none' })
    }

    wx.showLoading({ title: '添加中' })
    try {
      await db.collection('dealers').add({
        data: {
          name: inputName,
          phone: inputPhone,
          role: 'STAFF',
          isAuthorized: true,
          createTime: db.serverDate()
        }
      })
      wx.showToast({ title: '添加成功' })
      this.setData({ inputName: '', inputPhone: '' })
      this.fetchStaffList() // 刷新列表
    } catch (err) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  // 删除店员
  async deleteStaff(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: `确定要移除店员 ${name} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          await db.collection('dealers').doc(id).remove()
          wx.showToast({ title: '已删除' })
          this.fetchStaffList()
        }
      }
    })
  }
})