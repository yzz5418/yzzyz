// cloudfunctions/getStatistics/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 获取所有打卡记录
    const checkinRecords = await db.collection('checkinRecords')
      .where({
        _openid: openid
      })
      .get()
    
    // 计算总打卡次数
    const totalCheckins = checkinRecords.data.length
    
    // 计算总打卡时长（毫秒转分钟）
    let totalDuration = 0
    checkinRecords.data.forEach(record => {
      // 确保记录同时包含开始和结束时间
      if (record.startTime && record.endTime) {
        const startTime = new Date(record.startTime).getTime()
        const endTime = new Date(record.endTime).getTime()
        
        // 确保结束时间大于开始时间
        if (endTime > startTime) {
          totalDuration += (endTime - startTime) / (1000 * 60) // 转换为分钟
        }
      }
    })
    
    return {
      totalCheckins,
      totalDuration: Math.round(totalDuration) // 四舍五入取整
    }
  } catch (e) {
    console.error('获取统计信息失败', e)
    throw e
  }
}