//src/hooks/useRealtimeNotifications.ts 도큐먼트/컬렉션을 구독할 범용 훅

// src/hooks/useRealtimeNotifications.ts
"use client";

import { useEffect } from "react";
import { doc, onSnapshot, DocumentReference } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

interface Options<T = any> {
  ref: DocumentReference<T>;                     // 구독할 Firestore 문서
  onDataChange?: (data: T) => void;             // 데이터 변경 시 콜백
}

export function useRealtimeNotifications<T>({ ref, onDataChange }: Options<T>) {
  useEffect(() => {
    if (!ref) return;

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as T;
      if (onDataChange) onDataChange(data);
    });

    return () => unsubscribe();
  }, [ref, onDataChange]);
}
