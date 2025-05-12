// yzzyz/cloudfunctions/getStatistics/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  
    const account  = wx.getStorageSync('account');
    if (!account) {
      return {
        success: false,
        message: '未获取到用户账号信息'
      };
    }
    console.log(account);
    // 查询 users 表中当前用户的总打卡次数和总时长
    const userRes = await db.collection('users').where({
      account: account
    }).get();

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '未找到该用户信息'
      };
    }


    return {
      success: true,
      totalCheckins: user.totalCheckins,
      totalDuration: user.totalDuration
    };
  };