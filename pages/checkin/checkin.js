// pages/checkin/checkin.js
Page({
  data: {
    checkinType: '',
    isRunning: false,
    totalSeconds: 0,
    formattedTime: '00:00:00',
    timer: null,
    note: '',
    statusText: '准备开始'
  },

  onLoad: function(options) {
    if (options.type) {
      this.setData({ checkinType: options.type });
    }
  },

  onUnload: function() {
    // 页面卸载时清除计时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 返回上一页
  goBack: function() {
    if (this.data.isRunning) {
      wx.showModal({
        title: '提示',
        content: '正在计时中，确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            if (this.data.timer) {
              clearInterval(this.data.timer);
            }
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 开始/暂停计时器
  toggleTimer: function() {
    if (this.data.isRunning) {
      // 暂停计时器
      clearInterval(this.data.timer);
      this.setData({
        isRunning: false,
        statusText: '已暂停'
      });
    } else {
      // 开始计时器
      const timer = setInterval(() => {
        const totalSeconds = this.data.totalSeconds + 1;
        const formattedTime = this.formatTime(totalSeconds);
        
        this.setData({
          totalSeconds: totalSeconds,
          formattedTime: formattedTime,
          statusText: '计时中'
        });
      }, 1000);
      
      this.setData({
        timer: timer,
        isRunning: true,
        statusText: '计时中'
      });
    }
  },

  // 格式化时间为 HH:MM:SS
  formatTime: function(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  },

  // 备注输入事件
  onNoteInput: function(e) {
    this.setData({ note: e.detail.value });
  },

  // 保存打卡记录
  saveCheckin: function() {
    if (this.data.totalSeconds < 1) {
      wx.showToast({
        icon: 'none',
        title: '打卡时长不能为0'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    const account = wx.getStorageSync('account');
    if (!account) {
      wx.hideLoading();
      wx.showToast({
        icon: 'none',
        title: '请先设置账号'
      });
      return;
    }
    
    const db = wx.cloud.database();
    db.collection('checkins').add({
      data: {
        account: account,
        type: this.data.checkinType,
        duration: this.data.totalSeconds,
        note: this.data.note,
        date: db.serverDate()
      }
    })
    .then(() => {
      // 更新用户统计信息
      return this.updateUserStatistics();
    })
    .then(() => {
      wx.hideLoading();
      wx.showToast({
        icon: 'success',
        title: '打卡成功'
      });
      
      // 延迟返回首页，确保用户看到提示
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
          success: () => {
            // 触发首页刷新数据
            const pages = getCurrentPages();
            if (pages.length > 1) {
              const prevPage = pages[pages.length - 2];
              if (prevPage.route === 'pages/home/home') {
                prevPage.onShow(); // 调用首页的onShow方法刷新数据
              }
            }
          }
        });
      }, 1500);
    })
    .catch(err => {
      console.error('保存打卡记录失败', err);
      wx.hideLoading();
      wx.showToast({
        icon: 'none',
        title: '保存失败，请重试'
      });
    });
  },

  // 更新用户统计信息
  updateUserStatistics: function() {
    const account = wx.getStorageSync('account');
    const db = wx.cloud.database();
    const _ = db.command;
    
    return db.collection('users').where({
      account: account
    }).get()
    .then(res => {
      if (res.data.length === 0) {
        // 用户记录不存在，创建新记录
        return db.collection('users').add({
          data: {
            account: account,
            totalCheckins: 1,
            totalDuration: this.data.totalSeconds,
            lastCheckinDate: db.serverDate(),
            continuousCheckins: 1
          }
        });
      } else {
        const user = res.data[0];
        const now = new Date();
        const lastCheckinDate = user.lastCheckinDate ? new Date(user.lastCheckinDate) : null;
        
        // 计算连续打卡天数
        let continuousCheckins = user.continuousCheckins || 0;
        if (lastCheckinDate) {
          const dateDiff = Math.floor((now - lastCheckinDate) / (1000 * 60 * 60 * 24));
          
          if (dateDiff === 1) {
            // 昨天打卡了，连续天数加1
            continuousCheckins += 1;
          } else if (dateDiff > 1) {
            // 断签了，重置连续天数
            continuousCheckins = 1;
          }
        } else {
          // 首次打卡
          continuousCheckins = 1;
        }
        
        // 更新用户统计信息
        return db.collection('users').where({
          account: account
        }).update({
          data: {
            totalCheckins: _.inc(1),
            totalDuration: _.inc(this.data.totalSeconds),
            lastCheckinDate: db.serverDate(),
            continuousCheckins: continuousCheckins
          }
        });
      }
    });
  }
});