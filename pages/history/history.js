Page({
  data: {
    records: []
  },
  onLoad: function () {
    this.getRecords();
  },
  getRecords: function () {
    wx.cloud.callFunction({
      name: 'getRecords',
      success: res => {
        this.setData({
          records: res.result.data
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取记录失败'
        });
      }
    });
  }
});    