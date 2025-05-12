const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const res = await db.collection('fitness_records')
     .where({
        openid: wxContext.OPENID
      })
     .get();
    const records = res.data;
    const totalCheckins = records.length;
    let totalDuration = 0;
    records.forEach(record => {
      totalDuration += record.duration;
    });
    return {
      totalCheckins,
      totalDuration
    };
  } catch (e) {
    console.error(e);
  }
};    