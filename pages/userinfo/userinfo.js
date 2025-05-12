// pages/userinfo/userinfo.js
Page({
  data: {
    userInfo: {
      account: '',       // 存储账号信息
      totalCheckins: 0,  // 总打卡次数
      totalDuration: 0,  // 总打卡时长
      loading: true      // 加载状态
    }
  },
  
  onLoad: function() {
    // 从全局数据或本地存储获取 account
    this.getAccount();
    this.getUserStatistics();
  },
  
  onShow: function() {
    // 每次页面显示时更新 account
    this.getAccount();
    this.getUserStatistics();
  },
  
  // 获取账号信息
  getAccount: function() {
    const app = getApp();
    
    // 优先从全局数据获取
    if (app.globalData.userInfo && app.globalData.userInfo.account) {
      this.setData({ 'userInfo.account': app.globalData.userInfo.account });
      return;
    }
    
    // 否则从本地存储获取
    const account = wx.getStorageSync('account');
    if (account) {
      this.setData({ 'userInfo.account': account });
      
      // 更新全局数据
      if (!app.globalData.userInfo) {
        app.globalData.userInfo = { account };
      }
    } else {
      // 若未获取到账号，跳转到登录页
      wx.showToast({
        icon: 'none',
        title: '请先登录',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/login' });
          }, 1500);
        }
      });
    }
  },
  
  // 获取统计信息
  getUserStatistics: function() {
    const account = this.data.userInfo.account;
    
    if (!account) {
      this.setData({ 'userInfo.loading': false });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getStatistics',
      data: { account },  // 传递 account 给云函数
      success: res => {
        console.log('获取统计信息成功:', res);
        
        if (res.result.success) {
          this.setData({
            'userInfo.totalCheckins': res.result.totalCheckins,
            'userInfo.totalDuration': res.result.totalDuration,
            'userInfo.loading': false
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.result.message || '获取统计失败'
          });
          this.setData({ 'userInfo.loading': false });
        }
      },
      fail: err => {
        console.error('获取统计信息失败:', err);
        wx.showToast({
          icon: 'none',
          title: '网络错误，请重试'
        });
        this.setData({ 'userInfo.loading': false });
      }
    });
  }
});