// pages/login/login.js
const db = wx.cloud.database()

Page({
  data: {
    account: '',
    password: '',
    errorMessage: ''
  },
  
  onAccountInput(e) {
    this.setData({
      account: e.detail.value
    })
  },
  
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },
  
  onLogin() {
    const { account, password } = this.data
    const passwordMinLength = 6 // 设置密码最小长度为6位
    
    // 账号和密码非空校验
    if (!account) {
      this.setData({
        errorMessage: '请输入账号'
      })
      return
    }
    if (!password) {
      this.setData({
        errorMessage: '请输入密码'
      })
      return
    }
    
    // 密码长度校验
    if (password.length < passwordMinLength) {
      this.setData({
        errorMessage: `密码长度至少为${passwordMinLength}位`
      })
      return
    }
    
    wx.showLoading({
      title: '正在登录...'
    })
    
    // 调用云函数或直接查询数据库进行登录验证
    db.collection('users').where({
      account: account,
      password: password
    }).get().then(res => {
      wx.hideLoading()
      
      if (res.data.length === 0) {
        this.setData({
          errorMessage: '账号或密码错误'
        })
        return
      }
      
      // 登录成功，存储用户信息
      const userInfo = {
        account: account,
        userId: res.data[0]._id
      }

      
      
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('account', this.data.account)
      
      // 跳转到主页面
      wx.switchTab({
        url: '/pages/home/home'
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('登录失败', err)
      this.setData({
        errorMessage: '登录请求失败，请稍后重试'
      })
    })
  },
  
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})