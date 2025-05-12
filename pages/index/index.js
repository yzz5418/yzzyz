// pages/index/index.js
Page({
  data: {
    selectedType: '',       // 当前选择的打卡类型
    selectedTypeIndex: 0,   // 选择器中的类型索引
    duration: '',           // 打卡时长
    note: '',               // 备注信息
    types: ['专注', '学习', '工作', '运动', '阅读'], // 打卡类型列表
    userInfo: null,         // 用户信息
    isLoading: false,       // 加载状态
    errorMessage: '',       // 错误提示
    successMessage: '',     // 成功提示
    currentDate: ''         // 当前日期
  },

  onLoad() {
    this.initPageData();
  },

  onShow() {
    this.initPageData();
  },

  // 初始化页面数据
  initPageData() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }

    this.setData({
      currentDate: this.formatDate(new Date()),
      selectedType: '',
      selectedTypeIndex: 0,
      duration: '',
      note: '',
      errorMessage: '',
      successMessage: ''
    });
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 打卡类型选择器变更
  onTypeSelect(e) {
    const index = e.detail.value;
    const type = this.data.types[index];
    
    this.setData({
      selectedTypeIndex: index,
      selectedType: type
    });
  },

  // 时长输入处理
  onDurationInput(e) {
    this.setData({ duration: e.detail.value });
  },

  // 备注输入处理
  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  // 表单验证
  validateForm() {
    if (!this.data.selectedType) {
      this.showError('请选择打卡类型');
      return false;
    }

    const duration = parseInt(this.data.duration);
    if (isNaN(duration) || duration <= 0) {
      this.showError('请输入有效的时长');
      return false;
    }

    return true;
  },

  // 显示错误提示
  showError(message) {
    this.setData({
      errorMessage: message,
      successMessage: ''
    });

    setTimeout(() => {
      this.setData({ errorMessage: '' });
    }, 3000);
  },

  // 显示成功提示
  showSuccess(message) {
    this.setData({
      successMessage: message,
      errorMessage: ''
    });

    setTimeout(() => {
      this.setData({ successMessage: '' });
    }, 3000);
  },

  // 提交打卡记录
  async submitRecord() {
    if (!this.validateForm()) {
      return;
    }

    const userInfo = this.data.userInfo;
    if (!userInfo || !userInfo.account) {
      this.showError('请先登录');
      return;
    }

    this.setData({ isLoading: true });

    try {
      // 调用云函数添加打卡记录
      const result = await this.callAddRecordCloudFunction();
      
      console.log('云函数返回结果:', result);

      if (result && result.success) {
        // 更新本地用户信息
        userInfo.totalCheckins = (userInfo.totalCheckins || 0) + (result.isNewRecord ? 1 : 0);
        userInfo.totalDuration = (userInfo.totalDuration || 0) + parseInt(this.data.duration);
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          userInfo,
          isLoading: false
        });
        
        // 显示成功提示
        this.showSuccess(result.message || '打卡成功！');
        
        // 延迟重置表单
        setTimeout(() => {
          this.initPageData();
        }, 2000);
      } else {
        this.setData({ isLoading: false });
        this.showError(result.message || '打卡失败，请重试');
      }
    } catch (error) {
      console.error('调用云函数出错:', error);
      this.setData({ isLoading: false });
      this.showError('网络错误，请重试');
    }
  },

  // 调用添加打卡记录的云函数
  callAddRecordCloudFunction() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'addRecord',
        data: {
          account: this.data.userInfo.account,
          date: new Date(),
          duration: parseInt(this.data.duration),
          type: this.data.selectedType,
          note: this.data.note
        },
        success: res => {
          // 检查云函数返回格式是否符合预期
          if (res.result && typeof res.result.success !== 'undefined') {
            resolve(res.result);
          } else {
            reject(new Error('云函数返回格式不正确'));
          }
        },
        fail: err => {
          reject(err);
        }
      });
    });
  }
});