// pages/courseDetail/courseDetail.js
Page({
  data: {
    course: {}
  },
  onLoad: function (options) {
    let courseId = options.courseId;
    // 调用云函数获取课程详情
    wx.cloud.callFunction({
      name: 'getCourseDetail',
      data: {
        courseId: courseId
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            course: res.result.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.result.message
          });
        }
      },
      fail: err => {
        console.error('调用云函数失败', err);
        wx.showToast({
          icon: 'none',
          title: '网络错误，请重试'
        });
      }
    });
  }
});