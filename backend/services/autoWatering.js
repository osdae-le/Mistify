/**
 * Auto Watering Service
 * 
 * This service monitors Firebase for new sensor data and automatically
 * pumps water based on ML predictions when AI control mode is enabled.
 */

const { db } = require('../config/firebase');
const { spawn } = require('child_process');
const axios = require('axios');
require('dotenv').config();

const ADAFRUIT_IO_KEY = process.env.ADAFRUIT_IO_KEY; // paste riêng key vào đây
const ADAFRUIT_IO_USERNAME = process.env.ADAFRUIT_IO_USERNAME || 'truongthien144';
const PUMP_SPEED_ML_PER_SEC = 3; // Speed of pump in ml per second

// Store the timestamp of the last processed data to avoid duplication
let lastProcessedTimestamps = {
  temperature: null,
  humidity: null,
  light: null
};

// Track if a pump operation is currently in progress
let pumpOperationInProgress = false;

/**
 * Send pump control signal to Adafruit IO
 * @param {string} state - 'on' or 'off'
 */
async function sendPumpSignalToAdafruit(state) {
  const url = `https://io.adafruit.com/api/v2/truongthien144/feeds/pump-btn/data`;
  const payload = { value: state === 'on' ? '1' : '0' };

  try {
    await axios.post(url, payload, {
      headers: {
        'X-AIO-Key': ADAFRUIT_IO_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Pump state sent to Adafruit IO: ${state}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending pump signal to Adafruit IO:', error);
    throw error;
  }
}

/**
 * Check if AI control mode is enabled in Firebase settings
 */
async function isAIControlEnabled() {
  try {
    const settingsDoc = await db.collection('mistingSettings').doc('global').get();
    
    if (!settingsDoc.exists) {
      console.warn('⚠️ Settings document not found in Firebase');
      return false;
    }
    
    const settings = settingsDoc.data();
    return settings && settings.ai_control && settings.ai_control.status === 'on';
  } catch (error) {
    console.error('❌ Error checking AI control mode:', error);
    return false;
  }
}

/**
 * Get the latest sensor readings from Firebase
 */
async function getLatestSensorValues() {
  try {
    async function getLatestValue(collection) {
      const snap = await db.collection(collection).orderBy('timestamp', 'desc').limit(1).get();
      if (snap.empty) return { value: null, timestamp: null };
      
      const doc = snap.docs[0].data();
      let timestamp = null;
      
      // Handle different timestamp formats safely
      if (!doc.timestamp) {
        timestamp = Date.now();
      } else if (typeof doc.timestamp === 'object' && doc.timestamp !== null) {
        // Check if it's a Firestore Timestamp with toDate method
        if (typeof doc.timestamp.toDate === 'function') {
          timestamp = doc.timestamp.toDate().getTime();
        } else if (doc.timestamp instanceof Date) {
          timestamp = doc.timestamp.getTime();
        } else if (doc.timestamp.seconds) {
          // Handle Firestore Timestamp format {seconds: number, nanoseconds: number}
          timestamp = doc.timestamp.seconds * 1000;
        } else {
          timestamp = Date.now();
        }
      } else if (typeof doc.timestamp === 'number') {
        // Unix timestamp (milliseconds)
        timestamp = doc.timestamp;
      } else if (typeof doc.timestamp === 'string') {
        // ISO string or other date string
        timestamp = new Date(doc.timestamp).getTime();
      } else {
        // Fallback to current time
        timestamp = Date.now();
      }
      
      return { 
        value: parseFloat(doc.value), 
        timestamp: timestamp 
      };
    }

    const [tempData, humidData, lightData] = await Promise.all([
      getLatestValue('temperatureData'),
      getLatestValue('humidityData'),
      getLatestValue('lightData')
    ]);

    return {
      temperature: tempData,
      humidity: humidData,
      light: lightData
    };
  } catch (error) {
    console.error('❌ Error getting latest sensor values:', error);
    throw error;
  }
}

/**
 * Check if there are new sensor values that haven't been processed
 * @param {Object} sensorValues - The latest sensor values with timestamps
 */
function hasNewSensorData(sensorValues) {
  const { temperature, humidity, light } = sensorValues;
  
  // Check if we have all three sensor readings
  if (!temperature.value || !humidity.value || !light.value) {
    console.log('⚠️ Missing one or more sensor values, cannot process data');
    return false;
  }

  // Always process available data when AI control is enabled
  return true;
}

/**
 * Run the Python model to predict water amount
 */
async function predictWaterAmount(temperature, humidity, light) {
  try {
    const pythonProcess = spawn('python', [
      './services/waterPumpPrediction.py', 
      temperature,
      humidity,
      light
    ]);
    
    let predictionData = '';
    let errorData = '';
    
    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      predictionData += data.toString();
    });
    
    // Collect any errors
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    // Wait for the process to complete
    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        } else {
          const prediction = parseInt(predictionData.trim());
          if (isNaN(prediction)) {
            reject(new Error(`Invalid prediction result: ${predictionData}`));
          } else {
            resolve(prediction);
          }
        }
      });
    });
  } catch (error) {
    console.error('❌ Error predicting water amount:', error);
    throw error;
  }
}

/**
 * Handle automatic watering based on current sensor data
 */
async function processAutomaticWatering() {
  // Don't start a new pump operation if one is already in progress
  if (pumpOperationInProgress) {
    console.log('⚠️ Skipping automatic watering - pump operation already in progress');
    return;
  }
  
  try {
    // Check if AI control is enabled
    const aiEnabled = await isAIControlEnabled();
    if (!aiEnabled) {
      console.log('ℹ️ AI control is not enabled, skipping automatic watering');
      return;
    }
    
    // Get the latest sensor readings
    const sensorValues = await getLatestSensorValues();
    
    // Check if we have new data since last processing
    if (!hasNewSensorData(sensorValues)) {
      console.log('ℹ️ No new sensor data to process');
      return;
    }
    
    // Extract the values
    const temp = sensorValues.temperature.value;
    const humidity = sensorValues.humidity.value;
    const light = sensorValues.light.value;
    
    console.log(`🌡️ Processing new sensor data: temp=${temp}°C, humidity=${humidity}%, light=${light} lux`);
    
    // Update the last processed timestamps
    lastProcessedTimestamps.temperature = sensorValues.temperature.timestamp;
    lastProcessedTimestamps.humidity = sensorValues.humidity.timestamp;
    lastProcessedTimestamps.light = sensorValues.light.timestamp;
    
    // Predict the water amount needed
    const predictedAmount = await predictWaterAmount(temp, humidity, light);
    
    if (predictedAmount <= 0) {
      console.log('ℹ️ No water needed based on current conditions');
      return;
    }
    
    // Calculate how long to run the pump
    const pumpDuration = predictedAmount / PUMP_SPEED_ML_PER_SEC;
    
    // Prevent other operations from starting
    pumpOperationInProgress = true;
    
    // Log the operation to Firebase
    await db.collection('logs').add({
      mode: 'ai_control',
      status: 'on',
      timestamp: new Date(),
      sensorReadings: {
        temperature: temp,
        humidity: humidity,
        light: light
      },
      action: `Auto-triggered: Pumping ${predictedAmount} ml based on sensor readings`,
      predictedAmount,
      pumpDuration
    });
    
    console.log(`🚿 Starting auto pump: ${predictedAmount} ml for ${pumpDuration} seconds`);
    
    // Turn on the pump
    await sendPumpSignalToAdafruit('on');
    
    // Set a timer to turn off the pump after the calculated duration
    setTimeout(async () => {
      try {
        // Turn off the pump
        await sendPumpSignalToAdafruit('off');
        
        // Log the completion
        await db.collection('logs').add({
          mode: 'ai_control',
          status: 'off',
          timestamp: new Date(),
          action: `Auto-triggered: Completed pumping ${predictedAmount} ml of water`
        });
        
        console.log(`✅ Auto pump completed: ${predictedAmount} ml delivered`);
      } catch (error) {
        console.error('❌ Error stopping pump:', error);
        // Safety measure: try again to turn off the pump
        try {
          await sendPumpSignalToAdafruit('off');
        } catch (secondError) {
          console.error('‼️ Critical: Failed to stop pump after multiple attempts', secondError);
        }
      } finally {
        // Allow new pump operations
        pumpOperationInProgress = false;
      }
    }, pumpDuration * 1000);
    
  } catch (error) {
    console.error('❌ Error in automatic watering process:', error);
    
    // Safety measure - make sure pump is turned off in case of errors
    try {
      await sendPumpSignalToAdafruit('off');
    } catch {
      // Already logged in sendPumpSignalToAdafruit
    }
    
    // Reset the pump operation flag
    pumpOperationInProgress = false;
  }
}

/**
 * Initialize Firebase listeners for real-time monitoring
 */
function setupRealtimeListeners() {
  // Monitor temperature changes
  db.collection('temperatureData')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        processAutomaticWatering().catch(err => {
          console.error('❌ Error processing automatic watering after temperature change:', err);
        });
      }
    }, error => {
      console.error('❌ Error in temperature listener:', error);
    });
  
  // Monitor humidity changes
  db.collection('humidityData')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        processAutomaticWatering().catch(err => {
          console.error('❌ Error processing automatic watering after humidity change:', err);
        });
      }
    }, error => {
      console.error('❌ Error in humidity listener:', error);
    });
  
  // Monitor light changes
  db.collection('lightData')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        processAutomaticWatering().catch(err => {
          console.error('❌ Error processing automatic watering after light change:', err);
        });
      }
    }, error => {
      console.error('❌ Error in light listener:', error);
    });
  
  // Also monitor settings changes to detect when AI control mode is toggled
  db.collection('mistingSettings')
    .doc('global')
    .onSnapshot(doc => {
      if (doc.exists) {
        const settings = doc.data();
        if (settings && settings.ai_control && settings.ai_control.status === 'on') {
          // AI mode was just enabled, trigger a check
          processAutomaticWatering().catch(err => {
            console.error('❌ Error processing automatic watering after AI mode change:', err);
          });
        }
      }
    }, error => {
      console.error('❌ Error in settings listener:', error);
    });
  
  console.log('✅ Realtime listeners established for temperature, humidity, light, and settings');
}

// Export the functions for use in other modules
module.exports = {
  setupRealtimeListeners,
  processAutomaticWatering
};