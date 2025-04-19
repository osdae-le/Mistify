import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { firestore } from "../firebaseConfig"

type ChartDataPoint = {
  time: string;
  value: number;
};

export const fetchChartData = async (collectionName: string, limitCount: number): Promise<ChartDataPoint[]> => {
  try {
    const q = query(
      collection(firestore, collectionName),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const rawData = snapshot.docs.map(doc => doc.data());

    // Convert to format { time, value } and reverse for increasing time
    const formatted: ChartDataPoint[] = rawData
      .map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: item.value ?? 0, // fallback
      }))
      .reverse(); // reverse to get ascending order

    return formatted;
  } catch (error) {
    console.error(`❌ Error fetching ${collectionName}:`, error);
    return [];
  }
};
