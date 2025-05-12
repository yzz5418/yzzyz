// yzzyz/pages/userinfo/userinfo.js
Page({
  data: {
      userInfo: {
          account: '',
          totalCheckins: 0,
          totalDuration: 0,
          userinfo:{}
      }
  },
  onLoad: function () {
        this.getUserStatistics();
      

  },
  onGetaccount: function(){
      wx.getStorageSync('account')



  },
  onShow: function () {
      this.getUserStatistics();
  },
  getUserStatistics: function () {
      wx.cloud.callFunction({
          name: 'getStatistics',
          success: res => {
              if (res.result.success) {
                  const { totalCheckins, totalDuration } = res.result;
                  const userinfo = wx.getStorageSync('userinfo') || '';
                  const account = userinfo.account;
                  
                  this.setData({
                      userInfo: {
                          account,
                          totalCheckins,
                          totalDuration
                      }
                  });
              } else {
                  wx.showToast({
                      icon: 'none',
                      title: res.result.message
                  });
              }
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