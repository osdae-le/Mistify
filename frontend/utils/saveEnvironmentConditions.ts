// src/utils/saveEnvironmentConditions.ts

import { firestore } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save environment auto conditions into Firestore.
 */
export const saveEnvironmentConditions = async (conditions: {
  temperature?: number;
  humidity?: number;
  brightness?: number;
}) => {
  try {
    const docRef = doc(firestore, "environmentConditions", "currentConditions");

    await setDoc(docRef, {
      temperatureThreshold: conditions.temperature ?? null,
      humidityThreshold: conditions.humidity ?? null,
      brightnessThreshold: conditions.brightness ?? null,
      mode: "environment_auto",
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("❌ Error saving environment conditions:", error);
    throw error;
  }
};
