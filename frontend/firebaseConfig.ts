// firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyD6IyDvsZ90HaAwtPlUxyixPA_N0Lxm6JY",
    authDomain: "misting-system-52.firebaseapp.com",
    databaseURL: "https://misting-system-52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "misting-system-52",
    storageBucket: "misting-system-52.firebasestorage.app",
    messagingSenderId: "14603783156",
    appId: "1:14603783156:web:60abf1075c1de1835cc7a1",
    measurementId: "G-8FB6VWDG0X"
  };

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)







