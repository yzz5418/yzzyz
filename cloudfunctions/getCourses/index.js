const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const res = await db.collection('courses').get()
    return {
      success: true,
      data: res.data
    }
  } catch (e) {
    console.error('获取课程数据失败', e)
    return {
      success: false,
      message: '获取课程数据失败'
    }
  }
}