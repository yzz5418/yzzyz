Page({
  data: {
    courses: [],
    showModal: false,
    price: 0
  },
  onLoad: function () {
    this.getCourses()
  },
  getCourses: function () {
    wx.cloud.callFunction({
      name: 'getCourses',
      success: res => {
        if (res.result.success) {
          this.setData({
            courses: res.result.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.result.message
          })
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用云函数失败'
        })
      }
    })
  },
  showQRCode: function (e) {
    let price = e.currentTarget.dataset.price
    this.setData({
      showModal: true,
      price: price
    })
  },
  hideQRCode: function () {
    this.setData({
      showModal: false
    })
  },
  onShareAppMessage: function () {
    return {
      title: '快来体验超棒的健身课程！',
      path: '/pages/home/home',
      imageUrl: '/pages/images/diannao.png'
    }
  }
})