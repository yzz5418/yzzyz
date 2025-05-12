// pages/home/home.js
Page({
  data: {
    courses: [],
    showModal: false,
    price: 0,
    selectedCourse: null
  },
  onLoad: function () {
    this.getCourses();
  },
  getCourses: function () {
    wx.showLoading({
      title: '正在加载课程...'
    });
    // 假设这里调用云函数获取课程数据
    wx.cloud.callFunction({
      name: 'getCourses',
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          this.setData({
            courses: res.result.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.result.message
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('调用云函数失败', err);
        wx.showToast({
          icon: 'none',
          title: '网络错误，请重试'
        });
      }
    });
  },
  showQRCode: function (e) {
    let price = e.currentTarget.dataset.price;
    let course = e.currentTarget.dataset.course;
    this.setData({
      showModal: true,
      price: price,
      selectedCourse: course
    });
  },
  hideQRCode: function () {
    this.setData({
      showModal: false
    });
  },
  simulatePayment: function () {
    // 模拟支付成功
    wx.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        this.setData({
          showModal: false
        });
        // 可以在这里添加支付成功后的逻辑，如记录订单信息等
      }
    });
  },
  goToCourseDetail: function (e) {
    let course = e.currentTarget.dataset.course;
    wx.navigateTo({
      url: `/pages/courseDetail/courseDetail?courseId=${course._id}`
    });
  },
  onShareAppMessage: function () {
    return {
      title: '快来体验超棒的健身课程！',
      path: '/pages/home/home',
      imageUrl: '/pages/images/diannao.png'
    };
  }
});