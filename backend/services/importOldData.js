const { db } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

const FILES = {
  "humid": "humidchart.json",
  "light": "lightchart.json",
  "temp": "tempchart.json",
  "pump-btn": "pumpchart.json"
};

const COLLECTION_MAP = {
  "humid": "humidityData",
  "light": "lightData",
  "temp": "temperatureData",
  "pump-btn": "pumpControl"
};

async function importFromFile(feed, filename) {
  const fullPath = path.join(__dirname, filename);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const json = JSON.parse(raw);

  let success = 0, skipped = 0;

  for (const [timestamp, valueStr] of json.data) {
    const value = parseFloat(valueStr);
    const data = (feed === "pump-btn")
      ? { state: value === 1 ? "ON" : "OFF", timestamp }
      : { value, timestamp };

    // Kiểm tra trùng
    const snapshot = await db.collection(COLLECTION_MAP[feed])
      .where("timestamp", "==", timestamp).limit(1).get();
    if (!snapshot.empty) {
      skipped++;
      continue;
    }

    await db.collection(COLLECTION_MAP[feed]).add(data);
    success++;
    console.log(`✅ ${feed} @ ${timestamp}`);
  }

  console.log(`\n📦 Done: ${feed} → ${success} added, ${skipped} skipped\n`);
}

async function runImport() {
  for (const feed in FILES) {
    console.log(`🚀 Importing ${feed} from ${FILES[feed]}...`);
    await importFromFile(feed, FILES[feed]);
  }

  console.log("✅ All data imported.");
}

runImport();
