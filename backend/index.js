const express = require('express');
const http = require('http');
const cors = require('cors'); 
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// ✅ CORS middleware (QUAN TRỌNG: phải đặt trước route)
app.use(cors({
  origin: '*', // hoặc dùng cụ thể như: ['http://localhost:8081', 'http://10.0.141.90:8081']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const { syncAllFeeds, syncHistoricalData } = require('./services/dataSync');
const { userRoutes } = require('./routes/user');
const { mistingRoutes } = require('./routes/misting');
const setupSocketServer = require('./realtime/socketServer');
const { setupRealtimeListeners } = require('./services/autoWatering');

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1', userRoutes);
app.use('/api/v1/misting', mistingRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('☁️ Misting system backend is running!');
});

// WebSocket server
setupSocketServer(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`✅ Server listening on port ${PORT}`);

  // Sync toàn bộ dữ liệu lịch sử từ Adafruit IO (chỉ 1 lần khi khởi động)
  console.log("📦 Syncing historical data from Adafruit IO...");
  await syncHistoricalData();
  console.log("✅ Historical data sync completed.");

  // Sau đó sync dữ liệu mới mỗi 60 giây
  console.log("🚀 Starting real-time sync every 60 seconds...");
  syncAllFeeds(); // Chạy lần đầu
  setInterval(syncAllFeeds, 60 * 1000);
  
  // Start the automatic watering service
  console.log("🌱 Initializing AI-based automatic watering service...");
  setupRealtimeListeners();
  console.log("✅ AI watering service enabled - monitoring sensor changes");
});
