// cloudfunctions/getCourses/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const coursesRes = await db.collection('courses').get();
    const courses = coursesRes.data;
    return {
      success: true,
      data: courses
    };
  } catch (e) {
    console.error('获取课程数据失败', e);
    return {
      success: false,
      message: '获取课程数据失败，请稍后重试'
    };
  }
};