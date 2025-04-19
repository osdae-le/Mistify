import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "../firebaseConfig"; 

export default function useRealtimeValue(collectionName: string): number | null {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(firestore, collectionName), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doc = snapshot.docs[0];
      setValue(doc?.data()?.value ?? null);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return value;
}
