Page({
  data: {
    totalCheckins: 0,
    totalDuration: 0
  },
  onLoad: function () {
    this.getStatistics();
  },
  getStatistics: function () {
    wx.cloud.callFunction({
      name: 'getStatistics',
      success: res => {
        this.setData({
          totalCheckins: res.result.totalCheckins,
          totalDuration: res.result.totalDuration
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