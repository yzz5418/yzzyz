// cloudfunctions/addRecord/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
    try {
        const { userId, account, date, duration, type, note } = event;

        // 查询今天是否已有该账户的打卡记录
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 设置为今天凌晨

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // 设置为明天凌晨

        const existingRecord = await db.collection('checkins')
           .where({
                account: account,
                date: _.gte(today.toISOString()).lt(tomorrow.toISOString())
            })
           .get();

        if (existingRecord.data.length > 0) {
            // 如果存在今天的记录，累加 duration
            const recordId = existingRecord.data[0]._id;
            const originalDuration = existingRecord.data[0].duration;

            await db.collection('checkins').doc(recordId).update({
                data: {
                    duration: originalDuration + duration, // 累加时长
                    type: type, // 更新类型
                    note: note, // 更新备注
                    updateTime: db.serverDate() // 添加更新时间字段
                }
            });

            // 更新用户总时长（总次数不变，因为是同一条记录的更新）
            await db.collection('users').doc(userId).update({
                data: {
                    totalDuration: _.inc(duration) // 仅增加总时长
                }
            });

            return {
                success: true,
                message: '打卡记录已更新',
                recordId: recordId
            };
        } else {
            // 如果不存在今天的记录，创建新记录
            const result = await db.collection('fitness_records').add({
                data: {
                    userId: userId,
                    account: account,
                    date: date,
                    duration: duration,
                    type: type,
                    note: note,
                    createTime: db.serverDate(),
                }
            });

            // 更新用户总打卡次数和总时长
            await db.collection('users').doc(userId).update({
                data: {
                    totalCheckins: _.inc(1), // 新增记录时增加总次数
                    totalDuration: _.inc(duration) // 增加总时长
                }
            });

            return {
                success: true,
                message: '打卡记录添加成功',
                recordId: result._id
            };
        }
    } catch (e) {
        console.error('添加打卡记录失败', e);
        return {
            success: false,
            message: '打卡记录添加失败'
        };
    }
};