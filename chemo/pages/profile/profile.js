const db = wx.cloud.database()

Page({
  data: {
    userInfo: null,
    role: '', 
    showLoginModal: false, // 弹窗控制
    inputPhone: '' // 记录输入的手机号
  },

  // 1. 点击“点击登录账户”触发授权
  async triggerLoginModal() {
    try {
      const res = await wx.getUserProfile({
        desc: '用于核验加盟商身份',
      });
      this.tempWechatInfo = res.userInfo; // 暂存微信信息

      wx.showLoading({ title: '身份核验中...' });

      // 自动尝试 OpenID 查询
      let check = await db.collection('dealers').where({
        _openid: '{openid}',
        isAuthorized: true
      }).get();

      wx.hideLoading();

      if (check.data.length > 0) {
        const myData = check.data[0];
        this.setData({
          userInfo: this.tempWechatInfo,
          role: myData.role
        });
        wx.showToast({ title: '欢迎回来' });
      } else {
        // 无 OpenID 记录，显示自定义黑金弹窗
        this.setData({ showLoginModal: true });
      }
    } catch (err) {
      console.log('用户拒绝授权', err);
    }
  },

  // 输入监听
  onPhoneInput(e) {
    this.setData({ inputPhone: e.detail.value });
  },

  // 关闭弹窗
  closeLoginModal() {
    this.setData({ showLoginModal: false });
  },

  // 2. 自定义弹窗点击“确定”
  async handleConfirmLogin() {
    const phone = this.data.inputPhone;
    if (!(/^1[3-9]\d{9}$/.test(phone))) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '正在关联身份...' });

    try {
      const match = await db.collection('dealers').where({
        phone: phone,
        isAuthorized: true
      }).get();

      if (match.data.length > 0) {
        const targetId = match.data[0]._id;
        // 绑定操作：将微信昵称存入数据库
        await db.collection('dealers').doc(targetId).update({
          data: { boundNickName: this.tempWechatInfo.nickName }
        });

        this.setData({
          userInfo: this.tempWechatInfo,
          role: match.data[0].role,
          showLoginModal: false
        });
        wx.hideLoading();
        wx.showToast({ title: '绑定成功' });
      } else {
        wx.hideLoading();
        wx.showToast({ title: '手机号未登记', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '绑定失败', icon: 'none' });
    }
  },

  // --- 跳转函数 ---
  
  // 录入新质保单
  goToUpload() { 
    wx.navigateTo({ url: '/pages/warranty-upload/upload' }) 
  },

  // 关键补齐：跳转至质保记录列表页
  goToRecords() {
    if (!this.data.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/list/list' });
  },

  // 成员管理
  goToStaffManage() { 
    wx.navigateTo({ url: '/pages/staff-manage/staff-manage' }) 
  },

  // 门店设置
  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出当前账号吗？',
      confirmColor: '#ff6b35',
      success: (res) => {
        if (res.confirm) {
          this.setData({ userInfo: null, role: '' });
          wx.showToast({ title: '已退出' });
        }
      }
    });
  }
});