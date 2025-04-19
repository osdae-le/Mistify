// services/pumpControl.js
const { db } = require('../config/firebase');

/**
 * Hàm xác định trạng thái bơm dựa theo cấu hình chế độ đang bật
 * Ưu tiên: manual > scheduler > environment > ai
 * Trả về: "on" hoặc "off"
 */
async function evaluatePumpStatus() {
  try {
    const doc = await db.collection('mistingSettings').doc('global').get();
    const config = doc.data();

    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // 1. Manual mode được bật → bật bơm ngay
    if (config.manual_control?.status === 'on') return 'on';

    // 2. Scheduler mode → kiểm tra thời gian hiện tại nằm trong khoảng ON/OFF
    if (config.scheduler_spraying?.status === 'on') {
      const on = config.scheduler_spraying.schedule?.schedule_time_on;
      const off = config.scheduler_spraying.schedule?.schedule_time_off;
      if (on && off && isTimeInRange(nowTime, on, off)) return 'on';
    }

    // 3. Environment auto mode → kiểm tra các ngưỡng
    if (config.environment_auto?.status === 'on') {
      const cond = config.environment_auto.conditions;
      const sensor = await getLatestSensorValues();

      const isHot = sensor.temp >= cond.temperature_threshold;
      const isDry = sensor.humid <= cond.humidity_threshold;
      const isBright = sensor.light >= cond.brightness_threshold;

      if (isHot || isDry || isBright) return 'on';
    }

    // 4. AI mode → có thể tích hợp sau
    if (config.ai_control?.status === 'on') {
      // TODO: Xử lý AI inference tại đây nếu có
      return 'off'; // tạm thời không điều khiển
    }

    // Không có điều kiện nào khớp → tắt bơm
    return 'off';
  } catch (err) {
    console.error('❌ evaluatePumpStatus error:', err);
    return 'off';
  }
}

/**
 * Kiểm tra thời gian hiện tại có nằm trong khoảng on/off không (HH:MM string)
 */
function isTimeInRange(current, start, end) {
  return start <= current && current <= end;
}

/**
 * Truy vấn giá trị cảm biến mới nhất từ Firestore
 */
async function getLatestSensorValues() {
  async function getLatestValue(collection) {
    const snap = await db.collection(collection).orderBy('timestamp', 'desc').limit(1).get();
    if (!snap.empty) return snap.docs[0].data().value;
    return null;
  }

  const temp = await getLatestValue('temperatureData');
  const humid = await getLatestValue('humidityData');
  const light = await getLatestValue('lightData');

  return { temp, humid, light };
}

module.exports = { evaluatePumpStatus };
