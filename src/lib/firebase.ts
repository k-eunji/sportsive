// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase } from "firebase/database"; // 추가

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

// Firebase App 초기화 (서버/클라이언트 공통)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore (서버/클라이언트 공통)
export const db: Firestore = getFirestore(app);

// Auth, Storage, Functions (클라이언트 전용)
export const auth = typeof window !== "undefined" ? getAuth(app) : null;
export const storage = typeof window !== "undefined" ? getStorage(app) : null;
export const functions = typeof window !== "undefined" ? getFunctions(app) : null;

// 에뮬레이터 연결 (옵션)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  if (auth) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export { app };

export const rtdb = typeof window !== "undefined" ? getDatabase(app) : null;
