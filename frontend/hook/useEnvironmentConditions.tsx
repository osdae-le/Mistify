// src/hook/useEnvironmentConditions.tsx

import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

interface EnvironmentConditions {
  temperatureThreshold?: number;
  humidityThreshold?: number;
  brightnessThreshold?: number;
}

/**
 * Hook để lấy dữ liệu conditions từ Firestore realtime.
 */
export const useEnvironmentConditions = () => {
  const [conditions, setConditions] = useState<EnvironmentConditions | null>(null);

  useEffect(() => {
    const docRef = doc(firestore, "environmentConditions", "currentConditions");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as EnvironmentConditions;
        setConditions(data);
      } else {
        setConditions(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return conditions;
};
