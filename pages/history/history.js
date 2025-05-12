// pages/history/history.js
Page({
  data: {
    records: [],          // 打卡记录列表
    account: '',          // 本地存储的账号
    isLoading: false,     // 加载状态
    errorText: '',        // 错误提示文本
    emptyText: '暂无打卡记录' // 空状态提示
  },

  onLoad: function() {
    // 从本地存储获取账号
    const account = wx.getStorageSync('account') || '';
    if (!account) {
      this.setData({ errorText: '未找到账号信息' });
      return;
    }
    this.setData({ account, isLoading: true });
    this.fetchRecords();
  },

  // 获取打卡记录
  fetchRecords: function() {
    const account = this.data.account;
    if (!account) return;

    const db = wx.cloud.database();
    db.collection('checkins')
      .where({ account: account }) // 使用 account 作为查询条件
      .orderBy('date', 'desc')
      .get()
      .then(res => {
        const records = res.data.map(record => ({
          ...record,
          formattedDate: this.formatDate(record.date),
          formattedTime: this.formatTime(record.date)
        }));

        this.setData({
          records: records,
          isLoading: false,
          errorText: ''
        });
      })
      .catch(err => {
        console.error('获取记录失败:', err);
        this.setData({
          errorText: '获取记录失败，请检查账号是否正确',
          isLoading: false
        });
      });
  },

  // 日期格式化
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  // 时间格式化
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
});