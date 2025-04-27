// src/utils/updateEnvironmentMode.ts

import axios from "axios";
import { BASE_URL } from "../constants"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getToken = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem("userToken");
    } else {
      return await AsyncStorage.getItem("userToken");
    }
  } catch (err) {
    console.error("❌ Failed to load token:", err);
    return null;
  }
};

/**
 * Hàm bật/tắt Environment Auto mode.
 * @param status - "on" hoặc "off"
 */
export const updateEnvironmentMode = async (status: "on" | "off") => {
  const token = await getToken();
  if (!token) {
    console.error("❌ No token available to update environment mode");
    return;
  }

  try {
    await axios.post(
      `${BASE_URL}/api/v1/misting/update-mode`,
      { mode: "environment_auto", status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`✅ Environment Auto Mode updated to ${status}`);
  } catch (err) {
    console.error("❌ Failed to update environment auto mode:", err);
  }
};
