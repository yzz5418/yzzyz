Page({
  data: {
    account: ''
  },

  onLoad: function() {
    const account = wx.getStorageSync('account');
    if (account) {
      this.setData({ account: account });
    }
  },

  onAccountInput: function(e) {
    this.setData({ account: e.detail.value });
  },

  saveSettings: function() {
    if (!this.data.account) {
      wx.showToast({
        icon: 'none',
        title: '账号不能为空'
      });
      return;
    }
    
    wx.setStorageSync('account', this.data.account);
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    // 返回上一页
    wx.navigateBack();
  }
});