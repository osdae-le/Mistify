const express = require('express');
const mistingRoutes = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/verifyToken');
const axios = require('axios');
const { spawn } = require('child_process');

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

// Endpoint to predict water to pump
mistingRoutes.post('/predict-water', async (req, res) => {
    const { temperature, humidity } = req.body;

    if (temperature == null || humidity == null) {
        return res.status(400).json({ error: 'Temperature and humidity are required' });
    }

    const pythonProcess = spawn('python', ['./services/waterPumpPrediction.py', temperature, humidity]);

    pythonProcess.stdout.on('data', (data) => {
        const prediction = parseInt(data.toString().trim());
        res.json({ prediction });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: 'Failed to predict water amount' });
    });
});

// ===========================================
// 5. POST /api/v1/misting/pump-predicted-amount
// ===========================================
mistingRoutes.post('/pump-predicted-amount', verifyToken, async (req, res) => {
    const { temperature, humidity } = req.body;
    const PUMP_SPEED_ML_PER_SEC = 3; // Speed of pump in ml per second

    if (temperature == null || humidity == null) {
        return res.status(400).json({ error: 'Temperature and humidity are required' });
    }

    try {
        // Get predicted water amount
        const pythonProcess = spawn('python', ['./services/waterPumpPrediction.py', temperature, humidity]);
        
        let predictionData = '';
        
        pythonProcess.stdout.on('data', async (data) => {
            predictionData += data.toString();
        });

        // Handle potential errors from the Python script
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Prediction error: ${data}`);
            throw new Error('Failed to predict water amount');
        });

        // Wait for the Python process to complete
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        // Parse the predicted water amount
        const predictedAmount = parseInt(predictionData.trim());
        if (isNaN(predictedAmount) || predictedAmount <= 0) {
            throw new Error('Invalid prediction value');
        }

        // Calculate how long to run the pump (in seconds)
        const pumpDuration = predictedAmount / PUMP_SPEED_ML_PER_SEC;

        // Start the pump
        await sendPumpSignalToAdafruit('on');
        
        // Log pump start
        await db.collection('logs').add({
            mode: 'ai_control',
            status: 'on',
            timestamp: new Date(),
            action: `Started pumping ${predictedAmount} ml based on temperature ${temperature}°C and humidity ${humidity}%`,
            predictedAmount,
            pumpDuration
        });

        // Return immediately to client with the predicted information
        res.status(200).json({
            message: 'Pumping started',
            predictedAmount,
            estimatedPumpTime: pumpDuration
        });

        // Set a timer to turn off the pump after the calculated duration
        setTimeout(async () => {
            try {
                // Turn off pump
                await sendPumpSignalToAdafruit('off');
                
                // Log pump stop
                await db.collection('logs').add({
                    mode: 'ai_control',
                    status: 'off',
                    timestamp: new Date(),
                    action: `Completed pumping ${predictedAmount} ml of water`
                });
                
                console.log(`✅ Pump stopped after delivering ${predictedAmount} ml of water`);
            } catch (error) {
                console.error('❌ Error stopping pump:', error);
            }
        }, pumpDuration * 1000); // Convert seconds to milliseconds

    } catch (error) {
        console.error('❌ Error in pump-predicted-amount:', error);
        // If there was an error, try to turn off the pump to be safe
        try {
            await sendPumpSignalToAdafruit('off');
        } catch {
            // Ignore errors when trying to shut off pump in error handler
        }
        res.status(500).json({ error: 'Failed to control pump: ' + error.message });
    }
});

// ===========================================
// 6. POST /api/v1/misting/auto-pump-from-sensor
// ===========================================
mistingRoutes.post('/auto-pump-from-sensor', verifyToken, async (req, res) => {
    const { temperature, humidity, light = 50 } = req.body;
    const PUMP_SPEED_ML_PER_SEC = 3; // Speed of pump in ml per second

    if (temperature == null || humidity == null) {
        return res.status(400).json({ error: 'Temperature and humidity are required' });
    }

    try {
        // Check if AI control mode is enabled
        const settingsDoc = await db.collection('mistingSettings').doc('global').get();
        const settings = settingsDoc.data();
        
        if (!settings || !settings.ai_control || settings.ai_control.status !== 'on') {
            return res.status(403).json({ 
                error: 'AI control mode is not enabled', 
                message: 'Please enable AI control mode in settings first'
            });
        }

        // Get predicted water amount using the Python model
        const pythonProcess = spawn('python', [
            './services/waterPumpPrediction.py', 
            temperature, 
            humidity,
            light
        ]);
        
        let predictionData = '';
        
        pythonProcess.stdout.on('data', async (data) => {
            predictionData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Prediction error: ${data}`);
            throw new Error('Failed to predict water amount');
        });

        // Wait for the Python process to complete
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });

        // Parse the predicted water amount
        const predictedAmount = parseInt(predictionData.trim());
        if (isNaN(predictedAmount) || predictedAmount <= 0) {
            return res.status(200).json({ 
                message: 'No water needed at this time based on sensor readings',
                predictedAmount: 0
            });
        }

        // Calculate how long to run the pump (in seconds)
        const pumpDuration = predictedAmount / PUMP_SPEED_ML_PER_SEC;

        // Start the pump
        await sendPumpSignalToAdafruit('on');
        
        // Log pump start with sensor data
        await db.collection('logs').add({
            mode: 'ai_control',
            status: 'on',
            timestamp: new Date(),
            sensorReadings: {
                temperature,
                humidity,
                light
            },
            action: `Started pumping ${predictedAmount} ml based on sensor readings`,
            predictedAmount,
            pumpDuration
        });

        // Return immediately to client with the predicted information
        res.status(200).json({
            message: 'Pumping started based on sensor readings',
            predictedAmount,
            estimatedPumpTime: pumpDuration,
            pumpSpeed: PUMP_SPEED_ML_PER_SEC
        });

        // Set a timer to turn off the pump after the calculated duration
        setTimeout(async () => {
            try {
                // Turn off pump
                await sendPumpSignalToAdafruit('off');
                
                // Log pump stop
                await db.collection('logs').add({
                    mode: 'ai_control',
                    status: 'off',
                    timestamp: new Date(),
                    action: `Completed pumping ${predictedAmount} ml of water based on sensor readings`
                });
                
                console.log(`✅ Pump stopped after delivering ${predictedAmount} ml of water`);
            } catch (error) {
                console.error('❌ Error stopping pump:', error);
                
                // Safety measure: try one more time to stop the pump
                try {
                    await sendPumpSignalToAdafruit('off');
                } catch {
                    // If it fails again, we've done our best
                }
            }
        }, pumpDuration * 1000); // Convert seconds to milliseconds

    } catch (error) {
        console.error('❌ Error in auto-pump-from-sensor:', error);
        // If there was an error, try to turn off the pump to be safe
        try {
            await sendPumpSignalToAdafruit('off');
        } catch {
            // Ignore errors when trying to shut off pump in error handler
        }
        res.status(500).json({ error: 'Failed to control pump: ' + error.message });
    }
});

module.exports = { mistingRoutes };
