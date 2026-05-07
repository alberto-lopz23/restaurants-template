import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPsBu_WJ5c2dTBOt_CKEX3L_zZxh3ERMc",
  authDomain: "restaurants-template-1eb41.firebaseapp.com",
  projectId: "restaurants-template-1eb41",
  storageBucket: "restaurants-template-1eb41.firebasestorage.app",
  messagingSenderId: "814401210123",
  appId: "1:814401210123:web:f02e9ebd3124b2c87f040e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);