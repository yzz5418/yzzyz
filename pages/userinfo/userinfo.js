Page({
  data: {
    userInfo: {
      account: '', // 假设从登录信息中获取
      totalCheckins: 0, // 总打卡次数
      totalDuration: 0 // 总打卡时长
    }
  },
  onLoad: function () {
      

    this.getUserStatistics();
  },
  onShow(){



  },
  getUserStatistics: function () {
    wx.cloud.callFunction({
      name: 'getStatistics',
      success: res => {
        const { totalCheckins, totalDuration } = res.result;
        // 假设这里可以从全局数据或缓存中获取账号信息
        const account = wx.getStorageSync('account') || ''; 
        this.setData({
          userInfo: {
            account,
            totalCheckins,
            totalDuration
          }
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取统计信息失败'
        });
      }
    });
  }
});