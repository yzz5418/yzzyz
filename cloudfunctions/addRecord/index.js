// cloudfunctions/addRecord/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log('addRecord 云函数被调用，参数:', event);
  
  try {
    const { account, date, duration, type, note } = event;
    
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
    
    // 获取今天的日期范围
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(date);
    todayEnd.setHours(23, 59, 59, 999);
    
    // 开始事务
    const transaction = await db.startTransaction();
    
    try {
      // 检查今天是否已有打卡记录
      const todayRecords = await transaction.collection('checkins').where({
        account: account,
        date: _.gte(todayStart).lt(todayEnd)
      }).get();
      
      if (todayRecords.data && todayRecords.data.length > 0) {
        // 如果已有记录，更新记录
        const recordId = todayRecords.data[0]._id;
        
        await transaction.collection('checkins').doc(recordId).update({
          data: {
            duration: _.inc(duration),
            type: type,
            note: note,
            updatedAt: db.serverDate()
          }
        });
        
        // 更新用户总时长（不增加打卡次数）
        await transaction.collection('users').doc(userId).update({
          data: {
            totalDuration: _.inc(duration)
          }
        });
        
        console.log('打卡记录已更新，用户:', account);
        
        // 提交事务
        await transaction.commit();
        
        return {
          success: true,
          message: '打卡记录已更新',
          isNewRecord: false
        };
      } else {
        // 如果没有记录，创建新记录
        await transaction.collection('checkins').add({
          data: {
            account: account,
            date: date,
            duration: duration,
            type: type,
            note: note,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        });
        
        // 更新用户总打卡次数和总时长
        await transaction.collection('users').doc(userId).update({
          data: {
            totalCheckins: _.inc(1),
            totalDuration: _.inc(duration)
          }
        });
        
        console.log('新打卡记录已创建，用户:', account);
        
        // 提交事务
        await transaction.commit();
        
        return {
          success: true,
          message: '打卡记录添加成功',
          isNewRecord: true
        };
      }
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