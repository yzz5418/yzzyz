// cloudfunctions/getRecords/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    // 获取当前用户的 openid，这里假设使用云开发的安全调用机制
    const wxContext = cloud.getWXContext()
    const account = wx.getStorageSync('account')

    // 从数据库中查询用户信息，获取用户 ID
    const userRes = await db.collection('users').where({
      account: account
    }).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '未找到该用户信息'
      }
    }

    const userId = userRes.data[0]._id

    // 查询该用户的所有打卡记录
    const recordsRes = await db.collection('checkins').where({
      userId: userId
    }).orderBy('date', 'desc').get()

    const records = recordsRes.data

    return {
      success: true,
      data: records
    }
  } catch (e) {
    console.error('获取打卡记录失败', e)
    return {
      success: false,
      message: '获取打卡记录失败，请稍后重试'
    }
  }
}