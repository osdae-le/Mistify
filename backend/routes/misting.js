const express = require('express');
const mistingRoutes = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/verifyToken');
const axios = require('axios');

const ADAFRUIT_IO_KEY = process.env.ADAFRUIT_IO_KEY;

// 🚀 Gửi tín hiệu bật/tắt đến phần cứng thông qua feed Adafruit IO (pump-btn)
async function sendPumpSignalToAdafruit(state) {
  const url = `https://io.adafruit.com/api/v2/truongthien144/feeds/pump-btn/data`;
  const payload = { value: state === 'on' ? '1' : '0' };

  await axios.post(url, payload, {
    headers: {
      'X-AIO-Key': ADAFRUIT_IO_KEY,
      'Content-Type': 'application/json'
    }
  });

  console.log(`✅ Pump state sent to Adafruit IO: ${state}`);
}

// ===========================================
// 1. GET /api/v1/misting/status
// ===========================================
mistingRoutes.get('/status', async (req, res) => {
  try {
    const doc = await db.collection('mistingSettings').doc('global').get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('❌ Error getting misting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// 2. POST /api/v1/misting/update-mode
// ===========================================
mistingRoutes.post('/update-mode', verifyToken, async (req, res) => {
  const { mode, status } = req.body;

  if (!mode || !status) {
    return res.status(400).json({ error: 'Missing mode or status' });
  }

  const validModes = ['manual_control', 'scheduler_spraying', 'environment_auto', 'ai_control'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  try {
    // ✅ Cập nhật trạng thái bật/tắt của mode
    await db.collection('mistingSettings').doc('global').update({
      [`${mode}.status`]: status
    });

    // ✅ Ghi log bật/tắt vào collection 'logs'
    await db.collection('logs').add({
      mode,
      status,
      timestamp: new Date(),
      action: `User toggled ${mode} to ${status}`
    });

    // ✅ Nếu là manual_control thì điều khiển bơm thật
    if (mode === 'manual_control') {
      await sendPumpSignalToAdafruit(status);
    }

    res.status(200).json({
      message: 'Mode updated successfully',
      current_mode: mode,
      status
    });
  } catch (error) {
    console.error('❌ Error updating mode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// 3. POST /api/v1/misting/set-schedule
// ===========================================
mistingRoutes.post('/set-schedule', verifyToken, async (req, res) => {
  const { schedule_time_on, schedule_time_off } = req.body;

  if (!schedule_time_on || !schedule_time_off) {
    return res.status(400).json({ error: 'Missing schedule time' });
  }

  try {
    await db.collection('mistingSettings').doc('global').update({
      'scheduler_spraying.schedule.schedule_time_on': schedule_time_on,
      'scheduler_spraying.schedule.schedule_time_off': schedule_time_off
    });

    res.status(200).json({
      message: 'Schedule set successfully'
    });
  } catch (error) {
    console.error('❌ Error setting schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// 4. POST /api/v1/misting/config-enviroment
// ===========================================
mistingRoutes.post('/config-enviroment', verifyToken, async (req, res) => {
  const { temperature_threshold, humidity_threshold, brightness_threshold } = req.body;

  if (
    temperature_threshold === undefined ||
    humidity_threshold === undefined ||
    brightness_threshold === undefined
  ) {
    return res.status(400).json({ error: 'Missing threshold values' });
  }

  try {
    await db.collection('mistingSettings').doc('global').update({
      'environment_auto.conditions.temperature_threshold': temperature_threshold,
      'environment_auto.conditions.humidity_threshold': humidity_threshold,
      'environment_auto.conditions.brightness_threshold': brightness_threshold
    });

    res.status(200).json({
      message: 'Environmental conditions updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating environmental config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { mistingRoutes };
