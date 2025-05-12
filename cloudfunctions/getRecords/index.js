// cloudfunctions/getrecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { userId, recordId } = event
    
    // 1. 检查参数
    if (!userId || !recordId) {
      return {
        success: false,
        message: '缺少必要参数'
      }
    }
    
    // 2. 查询打卡记录
    const recordRes = await db.collection('checkins').doc(recordId).get()
    const record = recordRes.data
    
    // 3. 验证记录归属
    if (!record || record.userId !== userId) {
      return {
        success: false,
        message: '记录不存在或无权限访问'
      }
    }
    
    // 4. 获取用户信息（确保与 addrecord 中使用的用户信息一致）
    const userRes = await db.collection('users').doc(userId).get()
    const user = userRes.data
    
    // 5. 返回完整记录，包含用户 account 信息
    return {
      success: true,
      data: {
        ...record,
        account: user.account // 确保包含 account 字段
      }
    }
  } catch (e) {
    console.error('获取打卡记录失败', e)
    return {
      success: false,
      message: '获取打卡记录失败'
    }
  }
}