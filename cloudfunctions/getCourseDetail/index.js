// cloudfunctions/getCourseDetail/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { courseId } = event;
    const courseRes = await db.collection('courses').doc(courseId).get();
    const course = courseRes.data;
    return {
      success: true,
      data: course
    };
  } catch (e) {
    console.error('获取课程详情失败', e);
    return {
      success: false,
      message: '获取课程详情失败，请稍后重试'
    };
  }
};