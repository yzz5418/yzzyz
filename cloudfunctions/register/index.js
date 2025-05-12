const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { account, password } = event;
  try {
    const existingUser = await db.collection('users')
     .where({
        account: account
      })
     .get();
    if (existingUser.data.length > 0) {
      return {
        success: false,
        message: '该账号已存在'
      };
    }
    await db.collection('users').add({
      data: {
        account,
        password
      }
    });
    return {
      success: true,
      message: '注册成功'
    };
  } catch (e) {
    console.error('注册云函数出错', e);
    return {
      success: false,
      message: '服务器内部错误，请稍后重试'
    };
  }
};