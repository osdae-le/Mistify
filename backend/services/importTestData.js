const { db } = require('../config/firebase');

async function sendTestData() {
  const now = new Date();

  await db.collection('temperatureData').add({
    value: 32.5,
    timestamp: now
  });

  await db.collection('humidityData').add({
    value: 40,
    timestamp: now
  });

  await db.collection('lightData').add({
    value: 20,
    timestamp: now
  });

  console.log('✅ Test sensor data sent');
}

sendTestData().catch(console.error);
