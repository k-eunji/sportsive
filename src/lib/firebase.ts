// src/lib/firebase.ts

console.log(
  "🔥 EMULATOR FLAG:",
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR
);

console.log("🔥 firebase.ts loaded");

console.log("🔥 firebase.ts loaded");



import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  onSnapshot as _onSnapshot,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// 🔥🔥🔥 여기 추가 🔥🔥🔥
console.log("🔥 Firebase projectId from ENV:", firebaseConfig.projectId);

// Firebase App 초기화
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore
export const db: Firestore = getFirestore(app);

// Client-only services
export const auth = typeof window !== "undefined" ? getAuth(app) : null;
export const storage = typeof window !== "undefined" ? getStorage(app) : null;
export const functions = typeof window !== "undefined" ? getFunctions(app) : null;
export const rtdb = typeof window !== "undefined" ? getDatabase(app) : null;

// Emulator
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  if (auth) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  }
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export { app };

// ===============================
// 🔥 onSnapshot 전역 디버깅 래퍼
// ===============================
export const onSnapshot = (ref: any, ...rest: any[]) => {
  if (typeof window === "undefined") {
    console.warn("❌ onSnapshot called on SERVER");
  }

  try {
    if (ref?.path) {
      console.log("🚨 onSnapshot path:", ref.path);
    } else if (ref?._query?.path?.segments) {
      console.log(
        "🚨 onSnapshot query path:",
        ref._query.path.segments
      );
    } else {
      console.log("🚨 onSnapshot unknown ref:", ref);
    }
  } catch (e) {
    console.log("🚨 onSnapshot inspect error:", e);
  }

  // 🔴 타입 오버로드 때문에 반드시 any 캐스팅
  return (_onSnapshot as any)(ref, ...rest);
};

// ===============================
// 🔥 Firebase Analytics (Client only)
// ===============================
export const analytics =
  typeof window !== "undefined"
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : null;

