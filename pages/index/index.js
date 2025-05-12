// pages/index/index.js
Page({
  data: {
    selectedType: '',
    selectedTypeIndex: 0, // 新增：记录当前选择的打卡类型的索引
    duration: '',
    note: '',
    types: ['专注', '学习', '工作', '运动', '阅读'],
    userInfo: {},
    isLoading: false,
    currentDate: '',
    showSuccessToast: false,
    successMessage: ''
  },
  
  onLoad: function() {
    this.initPageData()
  },
  
  onShow: function() {
    this.initPageData()
  },
  
  // 初始化页面数据
  initPageData: function() {
    var userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo: userInfo })
    }
    
    this.setData({
      currentDate: this.formatTime(new Date()),
      selectedType: '',
      selectedTypeIndex: 0, // 新增：初始化选择索引
      duration: '',
      note: ''
    })
  },
  
  // 格式化时间显示
  formatTime: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
  },
  
  // 类型选择
  onTypeSelect: function(e) {
    var index = e.detail.value;
    var type = this.data.types[index];
    if (type) {
      this.setData({ 
        selectedType: type,
        selectedTypeIndex: index // 新增：更新选择索引
      })
    }
  },
  
  // 时长输入
  onDurationInput: function(e) {
    this.setData({ duration: e.detail.value })
  },
  
  // 备注输入
  onNoteInput: function(e) {
    this.setData({ note: e.detail.value })
  },
  
  // 验证表单
  validateForm: function() {
    if (!this.data.selectedType) {
      this.showToast('请选择打卡类型')
      return false
    }
    
    var duration = parseInt(this.data.duration)
    if (isNaN(duration) || duration <= 0) {
      this.showToast('请输入有效的时长')
      return false
    }
    
    return true
  },
  
  // 显示提示
  showToast: function(message) {
    this.setData({
      showSuccessToast: true,
      successMessage: message
    })
    
    var that = this
    setTimeout(function() {
      that.setData({ showSuccessToast: false })
    }, 2000)
  },
  
  // 提交打卡记录
  submitRecord: function() {
    if (!this.validateForm()) {
      return
    }
    
    var userInfo = this.data.userInfo
    if (!userInfo || !userInfo.account) {
      this.showToast('请先登录')
      return
    }
    
    this.setData({ isLoading: true })
    
    var that = this
    wx.cloud.callFunction({
      name: 'addRecord',
      data: {
        account: userInfo.account,
        date: new Date().toISOString(),
        duration: parseInt(this.data.duration),
        type: this.data.selectedType,
        note: this.data.note
      },
      success: function(res) {
        that.setData({ isLoading: false })
        
        if (res.result && res.result.success) {
          var duration = parseInt(that.data.duration)
          var isNewRecord = res.result.message === '打卡记录添加成功'
          
         
          userInfo.totalCheckins = (userInfo.totalCheckins || 0) + 1
          userInfo.totalDuration = (userInfo.totalDuration || 0) + duration
          wx.setStorageSync('userInfo', userInfo)
          
          that.setData({ 
            userInfo: userInfo,
            showSuccessToast: true,
            successMessage: '打卡成功！已记录' + that.data.selectedType + that.data.duration + '分钟'
          })
          
          setTimeout(function() {
            that.setData({ showSuccessToast: false })
          }, 3000)
        } else {
          that.showToast(res.result.message || '打卡失败，请重试')
        }
      },
      fail: function(err) {
        that.setData({ isLoading: false })
        console.error('调用云函数失败', err)
        that.showToast('网络错误，请重试')
      }
    })
  }
})