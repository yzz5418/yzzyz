Page({
  data: {
      courses: [
          {
              title: "减脂塑形课程",
              price: 199,
              imgUrl: "/pages/images/diannao.png"
          },
          {
              title: "增肌力量课程",
              price: 299,
              imgUrl: "/pages/images/phone.png"
          }
      ],
      showModal: false,
      price: 0
  },
  showQRCode: function (e) {
      let price = e.currentTarget.dataset.price;
      this.setData({
          showModal: true,
          price: price
      });
  },
  hideQRCode: function () {
      this.setData({
          showModal: false
      });
  },
  onShareAppMessage: function () {
      return {
          title: '快来体验超棒的健身课程！',
          path: '/pages/home/home',
          imageUrl: '/pages//images/diannao.png'
      };
  }
})
  