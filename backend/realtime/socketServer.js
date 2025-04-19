const { db } = require('../config/firebase');

let previous = {
  temperature: null,
  humidity: null,
  brightness: null
};

function getDifference(current, type) {
  const diff = previous[type] !== null ? current - previous[type] : 0;
  previous[type] = current;
  return diff;
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    // Lắng nghe client yêu cầu từng loại dữ liệu
    const setupRealtimeStream = (collection, eventName, type) => {
      return db.collection(collection)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const current = data.value;
            const difference = getDifference(current, type);
            socket.emit(eventName, {
              type,
              current,
              difference,
            });
          }
        }, err => {
          console.error(`❌ Error streaming ${type}:`, err);
          socket.emit(eventName, {
            type: 'error',
            message: 'Invalid request'
          });
        });
    };

    const unsubscribeTemp = setupRealtimeStream('temperatureData', 'temperature', 'temperature');
    const unsubscribeHumid = setupRealtimeStream('humidityData', 'humidity', 'humidity');
    const unsubscribeLight = setupRealtimeStream('lightData', 'brightness', 'brightness');

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      unsubscribeTemp();
      unsubscribeHumid();
      unsubscribeLight();
    });
  });
};
