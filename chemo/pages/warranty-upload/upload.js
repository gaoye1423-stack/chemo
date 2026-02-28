const db = wx.cloud.database();

Page({
  data: {
    currentStep: 2,
    isEditMode: false, // 是否为编辑模式
    recordId: '',      // 编辑状态下的记录ID
    form: {
      productType: '漆面膜',
      productDetails: [],
      selectedPartsMap: {},
      carBrand: '',
      constructDate: '',
      warrantyYear: '1',
      vin: '',
      carPlate: '',
      ownerName: '',
      ownerPhone: '',
      storeName: '',
      productSeries: '',
      snCode: '',
      productPrice: '',
      remark: '',
      technician: ''
    },
    carBrands: ['特斯拉', '奔驰', '宝马', '奥迪', '理想', '蔚来', '比亚迪'],
    warrantyYears: ['1', '2', '3', '5', '10', '终身'],
    solarParts: ['前挡', '侧前挡', '侧后挡', '天窗'],
    tempImages: [],      // 存放新选中的图片本地路径
    oldCloudImages: []   // 存放编辑时原有的云端图片路径
  },

  onLoad(options) {
    // 检查是否有 ID 传入，如果有则进入编辑模式
    if (options.id) {
      this.setData({
        isEditMode: true,
        recordId: options.id
      });
      this.fetchRecordDetail(options.id);
    }
  },

  // 获取详情并反填表单
  async fetchRecordDetail(id) {
    wx.showLoading({ title: '加载原始数据...' });
    try {
      const res = await db.collection('warranty_records').doc(id).get();
      const data = res.data;
      
      // 处理太阳膜的选中状态映射
      let partsMap = {};
      if (data.productType === '太阳膜') {
        data.productDetails.forEach(item => { partsMap[item.part] = true; });
      }

      this.setData({
        'form': { ...data },
        'form.selectedPartsMap': partsMap,
        'oldCloudImages': data.imagePhotos || [],
        'tempImages': data.imagePhotos || [] // 预览图先展示旧图
      });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '获取详情失败', icon: 'none' });
    }
  },

  // 选择产品类型
  selectProductType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'form.productType': type,
      'form.productDetails': [],
      'form.selectedPartsMap': {},
      'form.productSeries': '',
      'form.snCode': '',
      'form.productPrice': ''
    });
  },

  // 太阳膜多选部位处理
  bindPartsChange(e) {
    const selected = e.detail.value;
    const currentDetails = this.data.form.productDetails;
    const nextDetails = selected.map(part => {
      const existing = currentDetails.find(d => d.part === part);
      return existing || { part: part, series: '', sn: '', price: '' };
    });
    const map = {};
    selected.forEach(p => map[p] = true);
    this.setData({
      'form.productDetails': nextDetails,
      'form.selectedPartsMap': map
    });
  },

  onDetailInput(e) {
    const { index, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    const details = this.data.form.productDetails;
    details[index][field] = value;
    this.setData({ 'form.productDetails': details });
  },

  bindBrandChange(e) { this.setData({ 'form.carBrand': this.data.carBrands[e.detail.value] }); },
  bindDateChange(e) { this.setData({ 'form.constructDate': e.detail.value }); },
  bindWarrantyChange(e) { this.setData({ 'form.warrantyYear': this.data.warrantyYears[e.detail.value] }); },
  
  scanVIN() {
    wx.scanCode({ success: (res) => { this.setData({ 'form.vin': res.result }); } });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.tempImages.length,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const paths = res.tempFiles.map(item => item.tempFilePath);
        this.setData({ tempImages: [...this.data.tempImages, ...paths] });
      }
    });
  },

  deleteImg(e) {
    const index = e.currentTarget.dataset.index;
    let list = this.data.tempImages;
    list.splice(index, 1);
    this.setData({ tempImages: list });
  },

  // 核心提交逻辑
  async submitForm(e) {
    const formData = e.detail.value;
    const { form, tempImages, isEditMode, recordId } = this.data;

    if (!formData.carPlate || !formData.vin || !formData.ownerPhone || !form.constructDate) {
      wx.showToast({ title: '请填写完整必填项', icon: 'none' });
      return;
    }

    wx.showLoading({ title: isEditMode ? '正在保存修改...' : '正在加密上传...', mask: true });

    try {
      // 图片处理逻辑：区分云端图和新选图
      const newUploadFiles = tempImages.filter(path => !path.startsWith('cloud://'));
      const alreadyCloudFiles = tempImages.filter(path => path.startsWith('cloud://'));

      const uploadTasks = newUploadFiles.map((path, index) => {
        const cloudPath = `warranties/${Date.now()}-${index}.png`;
        return wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: path });
      });

      const uploadResults = await Promise.all(uploadTasks);
      const newFileIDs = uploadResults.map(res => res.fileID);
      const finalFileIDs = [...alreadyCloudFiles, ...newFileIDs];

      const finalData = {
        storeName: formData.storeName,
        technician: formData.technician,
        carPlate: formData.carPlate.toUpperCase().trim(),
        vin: formData.vin.toUpperCase().trim(),
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone.trim(),
        productType: form.productType,
        productDetails: form.productType === '太阳膜' ? form.productDetails : [],
        productSeries: form.productType !== '太阳膜' ? formData.productSeries : "",
        snCode: form.productType !== '太阳膜' ? formData.snCode : "",
        productPrice: form.productType !== '太阳膜' ? (formData.productPrice || "未填写") : "见明细",
        imagePhotos: finalFileIDs, 
        constructDate: form.constructDate,
        warrantyYear: form.warrantyYear,
        remark: formData.remark,
        updateTime: db.serverDate()
      };

      if (isEditMode) {
        // 修改模式：使用 update
        await db.collection('warranty_records').doc(recordId).update({ data: finalData });
      } else {
        // 新增模式：使用 add
        finalData.createTime = db.serverDate();
        await db.collection('warranty_records').add({ data: finalData });
      }

      wx.hideLoading();
      wx.showToast({ title: isEditMode ? '修改已保存' : '备案成功' });
      setTimeout(() => { wx.navigateBack(); }, 1500);

    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});