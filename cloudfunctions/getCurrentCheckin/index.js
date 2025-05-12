// cloudfunctions/getCurrentCheckin/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 查询用户是否有未完成的打卡记录（假设没有endTime的记录为未完成）
    const result = await db.collection('checkinRecords')
      .where({
        _openid: openid,
        endTime: db.command.exists(false) // 没有endTime字段的记录
      })
      .limit(1)
      .get()
    
    if (result.data && result.data.length > 0) {
      return result.data[0]
    } else {
      return null
    }
  } catch (e) {
    console.error('获取当前打卡记录失败', e)
    throw e
  }
}