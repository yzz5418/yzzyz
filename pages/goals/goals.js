Page({
  data: {
    weeklyCheckins: 0,
    monthlyDuration: 0
  },
  inputWeeklyCheckins: function (e) {
    this.setData({
      weeklyCheckins: e.detail.value
    });
  },
  inputMonthlyDuration: function (e) {
    this.setData({
      monthlyDuration: e.detail.value
    });
  },
  submitGoals: function () {
    wx.cloud.callFunction({
      name: 'setGoals',
      data: {
        weeklyCheckins: this.data.weeklyCheckins,
        monthlyDuration: this.data.monthlyDuration
      },
      success: res => {
        wx.showToast({
          title: '目标设置成功'
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '目标设置失败'
        });
      }
    });
  }
});    