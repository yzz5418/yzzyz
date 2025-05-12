// pages/userinfo/userinfo.js
Page({
  data: {
    userInfo: {
      account: '',
      totalCheckins: 0,
      totalDuration: 0,
      avatar: ''
    },
    isCheckingIn: false, // 是否正在打卡中
    currentCheckinId: '' // 当前打卡记录ID
  },
  
  onLoad: function () {
    this.getUserStatistics()
    this.checkCurrentStatus()
  },
  // 联系客服
contactCustomerService: function () {
  wx.openCustomerServiceChat({
    extInfo: { url: '' },
    success: (res) => {
      console.log('客服会话已打开', res)
    },
    fail: (err) => {
      console.error('打开客服会话失败', err)
      wx.showToast({
        icon: 'none',
        title: '客服功能暂不可用,可拨打客服电话123123'
      })
    }
  })
},
  
  // 检查当前打卡状态
  checkCurrentStatus: function() {
    wx.cloud.callFunction({
      name: 'getCurrentCheckin',
      success: res => {
        if (res.result && res.result._id) {
          this.setData({
            isCheckingIn: true,
            currentCheckinId: res.result._id
          })
        }
      },
      fail: err => {
        console.error('检查当前打卡状态失败', err)
      }
    })
  },
  
  // 获取用户统计信息
  getUserStatistics: function () {
    wx.cloud.callFunction({
      name: 'getStatistics',
      success: res => {
        const { totalCheckins, totalDuration } = res.result
        const account = wx.getStorageSync('account') || ''
        const avatar = wx.getStorageSync('avatar') || ''
        
        // 检查是否有未完成的打卡
        if (this.data.isCheckingIn) {
          // 计算当前正在进行的打卡时长并累加到总时长
          this.calculateOngoingDuration()
        }
        
        this.setData({
          userInfo: {
            account,
            totalCheckins,
            totalDuration,
            avatar
          }
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取统计信息失败'
        })
      }
    })
  },
  
  // 计算正在进行的打卡时长
  calculateOngoingDuration: function() {
    if (!this.data.currentCheckinId) return
    
    wx.cloud.callFunction({
      name: 'getRecord',
      data: {
        id: this.data.currentCheckinId
      },
      success: res => {
        const record = res.result
        if (record && record.startTime) {
          const startTime = new Date(record.startTime).getTime()
          const currentTime = new Date().getTime()
          const ongoingDuration = Math.round((currentTime - startTime) / (1000 * 60)) // 转换为分钟
          
          // 更新总时长显示（临时加上当前打卡时长）
          this.setData({
            'userInfo.totalDuration': this.data.userInfo.totalDuration + ongoingDuration
          })
        }
      },
      fail: err => {
        console.error('获取当前打卡记录失败', err)
      }
    })
  },
  
 
goToHistory: function () {
  wx.navigateTo({
    url: '/pages/history/history'
  });
}


})