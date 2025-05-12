// pages/userinfo/userinfo.js
const app = getApp();

Page({
  data: {
    userInfo: {
      account: '',
      totalCheckins: 0,
      totalDuration: 0,
      loading: true
    }
  },
  
  onLoad: function() {
    this.getUserStatistics();
  },
  
  onShow: function() {
    this.getUserStatistics();
  }, 
  goToHistory: function() {
    // 跳转到历史记录页面
    wx.navigateTo({
      url: '/pages/history/history' // 根据实际页面路径修改
    });
  },
  contactCustomerService: function() {
    // 实现联系客服的逻辑
    wx.showModal({
      title: '联系客服',
      content: '如有问题，请拨打客服电话：400-123-4567',
      confirmText: '拨打',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          // 调用拨号功能
          wx.makePhoneCall({
            phoneNumber: '4001234567' // 客服电话
          });
        }
      }
    });
  },
  
  getUserStatistics: function() {
    const userInfo = app.globalData.userInfo;
    
    // 检查用户是否已登录
    if (!userInfo || !userInfo.account) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/login' });
          }, 1500);
        }
      });
      return;
    }
    
    
    // 直接从数据库获取统计信息
    wx.cloud.database().collection('users')
      .where({ account: userInfo.account })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          throw new Error('用户记录不存在');
        }
        
        const userData = res.data[0];
        this.setData({
          'userInfo.account': userInfo.account,
          'userInfo.totalCheckins': userData.totalCheckins || 0,
          'userInfo.totalDuration': userData.totalDuration || 0,
          'userInfo.loading': false
        });
      })
      .catch(err => {
        console.error('获取统计信息失败:', err);
        wx.showToast({
          icon: 'none',
          title: '获取统计信息失败'
        });
        this.setData({ 'userInfo.loading': false });
      });
  }
  
});