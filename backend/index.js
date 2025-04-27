const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Khởi tạo Firebase App
require('./config/firebase'); 

// Bật Scheduler (cron job chạy mỗi phút)
require('./services/scheduler'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const { syncAllFeeds, syncHistoricalData } = require('./services/dataSync');
const { userRoutes } = require('./routes/user');
const { mistingRoutes } = require('./routes/misting');
app.use('/api/v1', userRoutes);
app.use('/api/v1/misting', mistingRoutes);

// WebSocket
const setupSocketServer = require('./realtime/socketServer');
setupSocketServer(io);

// Health check
app.get('/', (req, res) => {
  res.send('☁️ Misting system backend is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`✅ Server listening on port ${PORT}`);

  console.log("📦 Syncing historical data from Adafruit IO...");
  await syncHistoricalData();
  console.log("✅ Historical data sync completed.");

  console.log("🚀 Starting real-time sync every 60 seconds...");
  syncAllFeeds();
  setInterval(syncAllFeeds, 60 * 1000);
});
