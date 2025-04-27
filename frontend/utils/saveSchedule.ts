// src/utils/saveSchedule.ts

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getApp } from "firebase/app";

export const saveSchedule = async (
  startTime: Date,
  endTime: Date,
  daysOfWeek: string[]
) => {
  try {
    const app = getApp(); // lấy app firebase hiện tại
    const db = getFirestore(app);

    // Định dạng giờ thành "HH:MM"
    const formatTime = (date: Date) =>
      `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    const newSchedule = {
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      daysOfWeek: daysOfWeek,
      isActive: true,
    };

    await addDoc(collection(db, "scheduler_spraying"), newSchedule);
    console.log("✅ Schedule saved:", newSchedule);
  } catch (error) {
    console.error("❌ Failed to save schedule:", error);
  }
};
