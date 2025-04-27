const cron = require("node-cron");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require('axios');

const db = getFirestore();

const ADAFRUIT_IO_KEY = process.env.ADAFRUIT_IO_KEY;

// 🚀 Hàm gửi tín hiệu bật/tắt bơm lên Adafruit IO (có retry nhẹ)
const sendPumpSignal = async (state, retry = 0) => {
  try {
    const url = `https://io.adafruit.com/api/v2/truongthien144/feeds/pump-btn/data`;
    const value = state === "on" ? "1" : "0";

    await axios.post(
      url,
      { value },
      {
        headers: {
          "X-AIO-Key": ADAFRUIT_IO_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`🚀 Pump signal sent: ${state} (value=${value})`);

  } catch (error) {
    console.error(`❌ Error sending pump signal: ${error.message}`);
    if (retry < 2) { // thử lại tối đa 2 lần
      console.log(`🔁 Retrying to send pump signal (attempt ${retry + 1})...`);
      setTimeout(() => sendPumpSignal(state, retry + 1), 1000);
    }
  }
};

// 🕰️ Utility: lấy giờ hiện tại "HH:MM"
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 🗓️ Utility: lấy thứ hiện tại ("Mon", "Tue", "Wed",...)
const getCurrentDay = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

// 🔍 Hàm kiểm tra lịch tưới
const checkSchedules = async () => {
  try {
    console.log("🔍 Checking schedules...");

    // 🔥 Sửa đúng collection mistingSettings/global
    const mistingSettingsSnap = await db.collection("mistingSettings").doc("global").get();
    const mistingSettings = mistingSettingsSnap.exists ? mistingSettingsSnap.data() : null;

    console.log(`🔎 Scheduler spraying status: ${mistingSettings?.scheduler_spraying?.status}`);

    if (!mistingSettings || mistingSettings.scheduler_spraying?.status?.toLowerCase() !== "on") {
      console.log("⛔ Scheduler spraying is OFF. Skipping check.");
      return;
    }

    const nowTime = getCurrentTime();
    const today = getCurrentDay();

    const snapshot = await db.collection("scheduler_spraying").where("isActive", "==", true).get();

    console.log(`📦 Found ${snapshot.size} active schedules.`);

    snapshot.forEach(doc => {
      const schedule = doc.data();
      console.log(`🕰️ Now: ${nowTime}, Schedule: ${schedule.startTime} - ${schedule.endTime}, Days: ${schedule.daysOfWeek}`);

      if (schedule.daysOfWeek.includes(today)) {
        if (schedule.startTime === nowTime) {
          console.log(`🚿 Start misting (Schedule ${doc.id})`);
          sendPumpSignal("on");
        }
        if (schedule.endTime === nowTime) {
          console.log(`🛑 Stop misting (Schedule ${doc.id})`);
          sendPumpSignal("off");
        }
      }
    });

  } catch (error) {
    console.error("❌ Error checking schedules:", error.message);
  }
};

// ⏰ Cron job: mỗi phút kiểm tra lịch
cron.schedule("* * * * *", async () => {
  console.log("🕐 Cron triggered at:", new Date().toLocaleString());
  await checkSchedules();
});

console.log("⏰ Scheduler service started and running every minute.");
