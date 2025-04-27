// src/hook/useEnvironmentAutoController.tsx

import { useEffect, useRef, useState } from "react";
import { useEnvironmentConditions } from "./useEnvironmentConditions";
import useRealtimeValue from "./useRealtimeValue";
import { updateEnvironmentMode } from "../utils/updateEnvironmentMode";
import { firestore } from "../firebaseConfig"; 
import { doc, onSnapshot } from "firebase/firestore"; 
import axios from "axios"; 

const ADAFRUIT_IO_KEY = process.env.EXPO_PUBLIC_ADAFRUIT_IO_KEY;

// Hàm gửi tín hiệu lên Adafruit IO
const sendPumpSignalToAdafruit = async (state: "on" | "off") => {
  try {
    const url = `https://io.adafruit.com/api/v2/truongthien144/feeds/pump-btn/data`;
    const payload = { value: state === "on" ? "1" : "0" };

    await axios.post(url, payload, {
      headers: {
        "X-AIO-Key": ADAFRUIT_IO_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(`✅ Pump state sent to Adafruit IO: ${state}`);
  } catch (error) {
    console.error("❌ Failed to send pump state to Adafruit IO:", error);
  }
};

export const useEnvironmentAutoController = () => {
  const conditions = useEnvironmentConditions();

  const latestTemp = useRealtimeValue("temperatureData");
  const latestHumid = useRealtimeValue("humidityData");
  const latestLight = useRealtimeValue("lightData");

  const [isSpraying, setIsSpraying] = useState(false);
  const [conditionHoldStart, setConditionHoldStart] = useState<number | null>(null);
  const lastSprayTime = useRef<number | null>(null);
  const [environmentAutoEnabled, setEnvironmentAutoEnabled] = useState(false); // ✅ thêm biến bật/tắt Auto Mode

  // ✅ Lắng nghe trạng thái Environment Auto từ Firestore
  useEffect(() => {
    const docRef = doc(firestore, "mistingSettings", "global");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const status = data?.environment_auto?.status;
        setEnvironmentAutoEnabled(status === "on");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAutoControl = async () => {
      if (!environmentAutoEnabled) return; // ✅ Nếu Auto Mode OFF, không làm gì cả

      if (!conditions) return;
      if (latestTemp == null || latestHumid == null || latestLight == null) return;

      const now = Date.now();

      const shouldSprayBasedOnSensor = 
        (conditions.temperatureThreshold !== undefined && latestTemp > conditions.temperatureThreshold) ||
        (conditions.humidityThreshold !== undefined && latestHumid < conditions.humidityThreshold) ||
        (conditions.brightnessThreshold !== undefined && latestLight > conditions.brightnessThreshold);

      if (!shouldSprayBasedOnSensor) {
        setConditionHoldStart(null);
        return;
      }

      if (conditionHoldStart === null) {
        setConditionHoldStart(now);
      }

      if (conditionHoldStart && now - conditionHoldStart >= 30 * 1000) {
        const lastSpray = lastSprayTime.current;

        if (!lastSpray || now - lastSpray >= 8 * 60 * 1000) {
          await updateEnvironmentMode("on");         
          await sendPumpSignalToAdafruit("on");      
          console.log("💦 Start spraying! (Environment Auto)");
          setIsSpraying(true);
          lastSprayTime.current = now;

          setTimeout(async () => {
            await updateEnvironmentMode("off");        
            await sendPumpSignalToAdafruit("off");     
            console.log("🚫 Stop spraying after 2 minutes.");
            setIsSpraying(false);
          }, 2 * 60 * 1000);
        }
      }
    };

    const interval = setInterval(checkAutoControl, 3000);
    return () => clearInterval(interval);
  }, [
    environmentAutoEnabled, 
    conditions,
    latestTemp,
    latestHumid,
    latestLight,
    conditionHoldStart,
  ]);
};
