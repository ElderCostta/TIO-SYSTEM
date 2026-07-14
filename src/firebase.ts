import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "resounding-hulling-4hh41",
  appId: "1:184225713848:web:0d0c36268786ec23bcae4d",
  apiKey: "AIzaSyAwcljF3CVjkSJCluaoCvmmctMC2FP9KMs",
  authDomain: "resounding-hulling-4hh41.firebaseapp.com",
  storageBucket: "resounding-hulling-4hh41.firebasestorage.app",
  messagingSenderId: "184225713848"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-tiosystem-d4cc566d-73cb-44bb-b966-6aace59b5eb9");
