import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";


/**
 * Tính trung bình giá trị mỗi ngày trong tuần (Mon → Sun)
 * @param collectionName tên collection trong Firestore
 * @returns Mảng 7 số tương ứng trung bình từ Monday → Sunday
 */
export const getWeeklyAverage = async (collectionName: string): Promise<number[]> => {
  try {
    const snapshot = await getDocs(collection(firestore, collectionName));
    const data = snapshot.docs.map(doc => doc.data());

    // Map ngày (0 = Sun, 1 = Mon, ..., 6 = Sat) → mảng giá trị
    const dayMap: { [key: number]: number[] } = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    for (const item of data) {
      if (!item.timestamp || typeof item.value !== "number") continue;

      const date = new Date(item.timestamp);
      const day = date.getDay(); // 0 = Sun, ..., 6 = Sat
      dayMap[day].push(item.value);
    }

    // Trả về mảng theo thứ tự Mon → Sun (1,2,3,4,5,6,0)
    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    const result = orderedDays.map(day => {
      const values = dayMap[day];
      if (values.length === 0) return 0;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return parseFloat(avg.toFixed(1));
    });

    return result;
  } catch (error) {
    console.error("❌ Error calculating weekly average:", error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
};
