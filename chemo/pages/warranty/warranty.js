Page({
    data: {
      // 查询表单数据
      carPlate: '',
      ownerPhone: '',
      warrantyId: '',
      rightsList: [
        { icon: '🛡️', title: '官方正品保证', desc: '一车一码，品牌官方数字化追溯' },
        { icon: '📜', title: '十年超长质保', desc: '针对起泡、脱落、变色提供售后保障' },
        { icon: '🌐', title: '全国联保', desc: '全国授权施工门店均可提供售后服务' }
      ]
    },
  
    // 输入框同步逻辑
    onInput(e) {
      const { field } = e.currentTarget.dataset;
      this.setData({
        [field]: e.detail.value
      });
    },
  
    // 查询逻辑
    async onSearch() {
      const { carPlate, ownerPhone, warrantyId } = this.data;
  
      // 1. 基础校验
      if (!carPlate || !ownerPhone) {
        wx.showToast({ title: '请填写车牌和手机号', icon: 'none' });
        return;
      }
  
      wx.vibrateShort();
      wx.showLoading({ title: '核验信息中', mask: true });
  
      try {
        const db = wx.cloud.database();
        
        // 2. 构建查询条件
        // 必须确保这里的字段名与录入页面存入的数据一致
        let queryCondition = {
          carPlate: carPlate,
          ownerPhone: ownerPhone
        };
  
        // 如果填写了质保单号，则加入单号匹配条件
        if (warrantyId) {
          queryCondition._id = warrantyId;
        }
  
        // 3. 执行查询
        const res = await db.collection('warranty_records').where(queryCondition).get();
  
        wx.hideLoading();
  
        if (res.data.length > 0) {
          // 4. 查询成功：跳转详情页并传递记录ID
          const record = res.data[0];
          wx.navigateTo({
            url: `/pages/warranty-detail/detail?id=${record._id}`
          });
        } else {
          // 5. 查询失败：显示未找到弹窗
          wx.showModal({
            title: '查询结果',
            content: '抱歉，暂未查询到相关的电子质保记录。请联系您的施工门店确认信息是否录入。',
            showCancel: false,
            confirmColor: '#ff6b35'
          });
        }
      } catch (err) {
        wx.hideLoading();
        console.error("查询出错：", err);
        wx.showToast({ title: '网络繁忙，请重试', icon: 'none' });
      }
    }
  });