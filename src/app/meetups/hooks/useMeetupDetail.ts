// src/app/meetups/hooks/useMeetupDetail.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";
import { MeetupWithEvent } from "@/types/event";
import { useUser } from "@/context/UserContext";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface Message {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
}

/**
 * ✅ useMeetupDetail
 * - 특정 Meetup 상세 정보 (참가자, 메시지, 실시간 업데이트 포함)
 */
export const useMeetupDetail = (meetupId?: string) => {
  const { user } = useUser();
  const currentUserId = user?.uid ?? "";

  const [meetup, setMeetup] = useState<MeetupWithEvent | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const meetupRef = meetupId ? doc(firebaseDb, "meetups", meetupId) : null;

  /** ✅ 참가 상태 계산 */
  const joinStatus: "none" | "pending" | "joined" =
    meetup && currentUserId
      ? meetup.participants?.some((p: any) =>
          typeof p === "string" ? p === currentUserId : p.id === currentUserId
        )
        ? "joined"
        : meetup.pendingParticipants?.some((p: any) =>
            typeof p === "string" ? p === currentUserId : p.id === currentUserId
          )
        ? "pending"
        : "none"
      : "none";

  /** 🟢 실시간 참가자 상태 업데이트 */
  useRealtimeNotifications({
    ref: meetupRef!,
    onDataChange: (data: any) => {
      if (!data) return;
      setMeetup((prev) =>
        prev
          ? {
              ...prev,
              participants: data.participants,
              participantsCount: data.participants?.length || 0,
              pendingParticipants: data.pendingParticipants || [],
            }
          : prev
      );
    },
  });

  /** 📦 Meetup 및 Event 데이터 불러오기 */
  useEffect(() => {
    if (!meetupId) return;

    const fetchMeetup = async () => {
      try {
        const snap = await getDoc(doc(firebaseDb, "meetups", meetupId));
        if (!snap.exists()) return;
        const snapData = snap.data();

        const meetupData: MeetupWithEvent = {
          ...(snapData as any),
          id: meetupId,
          participantsCount: snapData.participants?.length || 0,
          pendingParticipants: snapData.pendingParticipants || [],
        };

        // ✅ 이벤트 정보 연결
        const res = await fetch("/api/events/england/football");
        const eventData = await res.json();
        const eventInfo = eventData.matches.find(
          (m: any) => m.id === meetupData.eventId
        );

        setMeetup(meetupData);
        setEventDetails(eventInfo || null);
      } catch (err) {
        console.error("❌ Failed to load meetup:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetup();
  }, [meetupId]);

  /** 💬 실시간 메시지 구독 */
  useEffect(() => {
    if (!meetupId) return;

    const messagesQuery = query(
      collection(firebaseDb, "meetups", meetupId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Message) }))
      );
    });

    return () => unsubscribe();
  }, [meetupId]);

  /** 🧩 참가 / 취소 / 승인 */
  const handleJoin = useCallback(async () => {
    if (!meetupRef || !currentUserId) return;
    try {
      await updateDoc(meetupRef, {
        pendingParticipants: arrayUnion(currentUserId),
      });
    } catch (err) {
      console.error("❌ Failed to join meetup:", err);
    }
  }, [meetupRef, currentUserId]);

  const handleLeave = useCallback(async () => {
    if (!meetupRef || !currentUserId) return;
    try {
      await updateDoc(meetupRef, {
        pendingParticipants: arrayRemove(currentUserId),
        participants: arrayRemove(currentUserId),
      });
    } catch (err) {
      console.error("❌ Failed to leave meetup:", err);
    }
  }, [meetupRef, currentUserId]);

  const handleApprove = useCallback(
    async (uid: string) => {
      if (!meetupRef) return;
      try {
        await updateDoc(meetupRef, {
          participants: arrayUnion(uid),
          pendingParticipants: arrayRemove(uid),
        });
      } catch (err) {
        console.error("❌ Failed to approve participant:", err);
      }
    },
    [meetupRef]
  );

  /** ✉️ 메시지 전송 */
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !meetupRef) return;
    try {
      const messagesRef = collection(meetupRef, "messages");
      await addDoc(messagesRef, {
        senderId: currentUserId,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  }, [newMessage, meetupRef, currentUserId]);

  /** 📤 반환 */
  return {
    meetup,
    eventDetails,
    messages,
    newMessage,
    joinStatus,
    loading,
    hostId: currentUserId,
    handlers: {
      handleJoin,
      handleLeave,
      handleApprove,
      sendMessage,
      setNewMessage,
    },
  };
};
