// firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBYerJVda78_IJ0buNa1v_ooxe65qsAM1Y",
  authDomain: "mistify-7d410.firebaseapp.com",
  projectId: "mistify-7d410",
  storageBucket: "mistify-7d410.firebasestorage.app",
  messagingSenderId: "172498413555",
  appId: "1:172498413555:web:0662deec75e8a6c6db5486"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)







