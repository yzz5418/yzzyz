const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { account, password } = event;
  try {
    const res = await db.collection('users')
     .where({
        account: account
      })
     .get();
    if (res.data.length === 0) {
      return {
        success: false,
        message: '账号不存在'
      };
    }
    const user = res.data[0];
    if (user.password !== password) {
      return {
        success: false,
        message: '密码错误'
      };
    }
    return {
      success: true,
      userId: user._id
    };
  } catch (e) {
    console.error('登录云函数出错', e);
    return {
      success: false,
      message: '服务器内部错误，请稍后重试'
    };
  }
};  