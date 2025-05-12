const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const goals = {
      openid: wxContext.OPENID,
      weeklyCheckins: event.weeklyCheckins,
      monthlyDuration: event.monthlyDuration
    };
    const existingGoals = await db.collection('fitness_goals')
     .where({
        openid: wxContext.OPENID
      })
     .get();
    if (existingGoals.data.length > 0) {
      return await db.collection('fitness_goals')
       .doc(existingGoals.data[0]._id)
       .update({
          data: goals
        });
    } else {
      return await db.collection('fitness_goals').add({
        data: goals
      });
    }
  } catch (e) {
    console.error(e);
  }
};    