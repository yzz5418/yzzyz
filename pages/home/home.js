// pages/home/home.js
Page({
  data: {
    userInfo: {},
    timeGreeting: '',
    todayChecked: false,
    todayCheckin: {},
    recentRecords: []
  },

  onLoad: function() {
    this.updateTimeGreeting();
  },

  onShow: function() {
    // 每次页面显示时刷新数据
    this.getUserInfo();
    this.checkTodayStatus();
    this.getRecentRecords();
  },

  // 更新问候语
  updateTimeGreeting: function() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 6) greeting = '凌晨好';
    else if (hour < 9) greeting = '早上好';
    else if (hour < 12) greeting = '上午好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else if (hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    
    this.setData({ timeGreeting: greeting });
  },

  // 获取用户信息
  getUserInfo: function() {
    const account = wx.getStorageSync('account');
    if (!account) {
      wx.showModal({
        title: '提示',
        content: '请先设置账号信息',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/settings/settings' });
          }
        }
      });
      return;
    }
    
    // 从云数据库获取用户统计信息
    const db = wx.cloud.database();
    db.collection('users').where({ account: account }).get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({ userInfo: res.data[0] });
        } 
      })
      .catch(err => {
        console.error('获取用户信息失败', err);
      });
  },

  // 检查今日是否已打卡
  checkTodayStatus: function() {
    const account = wx.getStorageSync('account');
    if (!account) return;
    
    const db = wx.cloud.database();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    db.collection('checkins')
      .where({
        account: account,
        date: db.command.gte(todayStart)
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          const todayRecord = res.data[0];
          this.setData({
            todayChecked: true,
            todayCheckin: {
              type: todayRecord.type,
              duration: Math.floor(todayRecord.duration / 60), // 转换为分钟
              note: todayRecord.note
            }
          });
        } else {
          this.setData({ todayChecked: false });
        }
      })
      .catch(err => {
        console.error('检查今日打卡状态失败', err);
      });
  },

  // 获取最近打卡记录
  getRecentRecords: function() {
    const account = wx.getStorageSync('account');
    if (!account) return;
    
    const db = wx.cloud.database();
    db.collection('checkins')
      .where({ account: account })
      .orderBy('date', 'desc')
      .limit(5)
      .get()
      .then(res => {
        const records = res.data.map(record => {
          const date = new Date(record.date);
          return {
            ...record,
            formattedDate: `${date.getMonth() + 1}/${date.getDate()}`,
            formattedTime: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            durationText: `${Math.floor(record.duration / 60)}分${record.duration % 60}秒`
          };
        });
        
        this.setData({ recentRecords: records });
      })
      .catch(err => {
        console.error('获取最近记录失败', err);
      });
  },

  // 开始快速打卡
  startCheckin: function(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/checkin/checkin?type=${type}`
    });
  },

  // 跳转到自定义打卡页面
  goToCheckin: function() {
    wx.navigateTo({ url: '/pages/checkin/checkin' });
  }
});