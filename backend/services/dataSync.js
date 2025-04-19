const axios = require('axios');
const {db} = require('../config/firebase');
require('dotenv').config();

const ADAFRUIT_IO_KEY = process.env.ADAFRUIT_IO_KEY;
const FEEDS = ["humid", "light", "pump-btn", "temp"];

const COLLECTION_MAP = {
  "humid": "humidityData",
  "light": "lightData",
  "temp": "temperatureData",
  "pump-btn": "pumpControl"
};

async function isDuplicate(feed, timestamp) {
  const collectionName = COLLECTION_MAP[feed];
  const snapshot = await db.collection(collectionName)
    .where("timestamp", "==", timestamp)
    .limit(1)
    .get();

  return !snapshot.empty;
}

async function fetchFeedData(feed, limit = 100, start_time = null) {
  let url = `https://io.adafruit.com/api/v2/truongthien144/feeds/${feed}/data?limit=${limit}`;
  if (start_time) {
    url += `&start_time=${start_time}`;
  }

  const response = await axios.get(url, {
    headers: { "X-AIO-Key": ADAFRUIT_IO_KEY }
  });

  return response.data;
}

async function processFeedItem(feed, item) {
  const timestamp = new Date(item.created_at).toISOString();
  const value = parseFloat(item.value);
  const location = item.location || null;

  const isDup = await isDuplicate(feed, timestamp);
  if (isDup) return false;

  const docData = (feed === "pump-btn")
    ? { state: value === 1 ? "ON" : "OFF", timestamp, location }
    : { value, timestamp, location };

  await db.collection(COLLECTION_MAP[feed]).add(docData);
  console.log(`✅ Synced ${feed}:`, docData);
  return true;
}

async function syncAllFeeds() {
  for (const feed of FEEDS) {
    try {
      const items = await fetchFeedData(feed, 2);
      for (const item of items) {
        await processFeedItem(feed, item);
      }
    } catch (err) {
      console.error(`❌ Error syncing latest ${feed}:`, err.message);
    }
  }
}

// 📦 New: Lấy toàn bộ lịch sử dữ liệu (phân trang 100 items/lần)
async function syncHistoricalData() {
  for (const feed of FEEDS) {
    console.log(`📦 Syncing full history for ${feed}...`);
    let syncedCount = 0;
    let keepGoing = true;
    let lastTimestamp = null;

    while (keepGoing) {
      try {
        const items = await fetchFeedData(feed, 100, lastTimestamp);
        if (!items.length) break;

        for (const item of items) {
          const synced = await processFeedItem(feed, item);
          if (synced) syncedCount++;
        }

        // Dùng timestamp của item cuối để phân trang tiếp
        lastTimestamp = items[items.length - 1].created_at;

        // Nếu ít hơn 100 thì đã lấy hết
        if (items.length < 100) keepGoing = false;

      } catch (error) {
        console.error(`❌ Error syncing history for ${feed}:`, error.message);
        keepGoing = false;
      }
    }

    console.log(`✅ Done syncing ${feed} (${syncedCount} new entries added)`);
  }
}

module.exports = { syncAllFeeds, syncHistoricalData };
