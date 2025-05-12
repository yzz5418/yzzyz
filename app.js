// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-5g4e6jr638296257', // 环境ID
        traceUser: true,                // 追踪用户
        defaultEnv: 'cloud1-5g4e6jr638296257' // 指定默认环境
      });
    }
    
    this.globalData = {
      userInfo: null
    };
  }
});