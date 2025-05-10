// firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBDAoIICyiHINZ21kfNGHCBKif7neyQjMk",
  authDomain: "misting-bu.firebaseapp.com",
  projectId: "misting-bu",
  storageBucket: "misting-bu.firebasestorage.app",
  messagingSenderId: "742051277179",
  appId: "1:742051277179:web:e474d392c991603ca035de"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)







