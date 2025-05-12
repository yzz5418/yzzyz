// cloudfunctions/deleteRecord/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { account } = event;

    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      account: account
    }).get();

    if (!userResult.data || userResult.data.length === 0) {
      console.error('用户不存在:', account);
      return {
        success: false,
        message: '用户不存在，请先注册'
      };
    }

    const userId = userResult.data[0]._id;

    // 开始事务
    const transaction = await db.startTransaction();

    try {
      // 删除所有打卡记录
      await transaction.collection('checkins').where({
        account: account
      }).remove();

      // 更新用户总打卡次数和总时长为0
      await transaction.collection('users').doc(userId).update({
        data: {
          totalCheckins: 0,
          totalDuration: 0
        }
      });

      console.log('所有打卡记录已删除，用户:', account);

      // 提交事务
      await transaction.commit();

      return {
        success: true,
        message: '所有打卡记录已删除'
      };
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error('事务执行失败，已回滚:', error);
      throw error;
    }
  } catch (error) {
    console.error('云函数执行出错:', error);
    return {
      success: false,
      message: '服务器内部错误，请稍后重试'
    };
  }
};