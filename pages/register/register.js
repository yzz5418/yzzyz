// pages/register/register.js
const db = wx.cloud.database()

Page({
  data: {
    account: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
    passwordType: 'password',
    showPassword: false,
    confirmPasswordType: 'password',
    showConfirmPassword: false
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
  
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword,
      passwordType: this.data.showPassword ? 'text' : 'password'
    })
  },
  
  toggleConfirmPasswordVisibility() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword,
      confirmPasswordType: this.data.showConfirmPassword ? 'text' : 'password'
    })
  },
  
  onRegister() {
    const { account, password, confirmPassword } = this.data
    const PASSWORD_MIN_LENGTH = 6 // 密码最小长度
    
    // 表单验证
    if (!account) {
      this.setData({ errorMessage: '请输入账号' })
      return
    }
    
    if (!password) {
      this.setData({ errorMessage: '请输入密码' })
      return
    }
    
    if (password.length < PASSWORD_MIN_LENGTH) {
      this.setData({ 
        errorMessage: `密码长度不能少于${PASSWORD_MIN_LENGTH}位` 
      })
      return
    }
    
    if (!confirmPassword) {
      this.setData({ errorMessage: '请确认密码' })
      return
    }
    
    if (password !== confirmPassword) {
      this.setData({ errorMessage: '两次输入的密码不一致' })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '注册中...',
      mask: true
    })
    
    // 检查账号是否已存在
    db.collection('users').where({
      account: account
    }).get().then(res => {
      if (res.data.length > 0) {
        wx.hideLoading()
        this.setData({ errorMessage: '该账号已存在' })
        return
      }
      
      // 账号不存在，创建新用户
      db.collection('users').add({
        data: {
          account: account,
          password: password, // 注意：实际项目中应加密存储密码
          createTime: db.serverDate(),
          checkins: [],
          totalCheckins: 0,
          totalDuration: 0
        }
      }).then(res => {
        wx.hideLoading()
        console.log('注册成功', res)
        
        // 注册成功，存储用户信息并跳转
        wx.setStorageSync('userInfo', {
          account,
          userId: res._id
        })
        
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.navigateBack() // 返回上一页或跳转到登录页
            }, 2000)
          }
        })
      }).catch(err => {
        wx.hideLoading()
        console.error('注册失败', err)
        this.setData({ errorMessage: '注册失败，请稍后重试' })
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('查询账号失败', err)
      this.setData({ errorMessage: '网络错误，请稍后重试' })
    })
  },
  
  goToLogin() {
    wx.navigateBack()
  }
})