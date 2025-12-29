// src/app/meetups/hooks/useMeetups.ts

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { MeetupWithEvent, Event } from "@/types/event";
import { db as firebaseDb } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import { useCommunity } from "@/context/CommunityContext";

type Debug = MeetupWithEvent;

export function useMeetups() {
  const [meetups, setMeetups] = useState<MeetupWithEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingMeetups, setIsLoadingMeetups] = useState(true);

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const { user } = useUser();
  const hostId = user?.uid ?? "";
  const { region } = useCommunity();

  // ───────────────────────────────────────────────
  // 🔥 Firestore: Meetup 불러오기
  // ───────────────────────────────────────────────
  const fetchMeetups = useCallback(async () => {
    try {
      const snap = await getDocs(collection(firebaseDb, "meetups"));
      const now = new Date();
      const deletions: Promise<void>[] = [];
      const valid: MeetupWithEvent[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        delete data.event;        
        const dt = new Date(data.datetime);
        const hoursSince = (now.getTime() - dt.getTime()) / 36e5;

        // 12시간 지난 Meetup 자동 삭제
        if (hoursSince >= 12) {
          deletions.push(deleteDoc(doc(firebaseDb, "meetups", docSnap.id)));
          continue;
        }

                // destructure to avoid event type conflict
        const { event: rawEvent, ...rest } = data;

        valid.push({
          id: docSnap.id,
          datetime: data.datetime?.toDate ? data.datetime.toDate().toISOString() : data.datetime,
          
          // ⭐ 필수
          location: {
            name: data.location?.name ?? "TBA",
            lat: data.location?.lat ?? 0,
            lng: data.location?.lng ?? 0,
            address: data.location?.address ?? "",
            city: data.location?.city ?? "",
            region: data.location?.region ?? "",
          },

          // ⭐ 필수
          teamType: data.teamType ?? "neutral",
          maxParticipants: data.maxParticipants ?? 10,
          participantsCount: data.participants?.length || 0,
          userJoined: data.participants?.includes(hostId) ?? false,

          // ⭐ 필수
          title: data.title ?? "",
          type: data.type ?? "other",
          hostId: data.hostId ?? "",
          eventId: data.eventId ?? null,
          // 선택
          event: events.find((e) => e.id === data.eventId) || null,
          participants: data.participants ?? [],
          sportType: data.sportType,
          fee: data.fee,
          imageUrl: data.imageUrl,
          purpose: data.purpose,
          details: data.details,
          findUsNote: data.findUsNote,
          onlineGameName: data.onlineGameName ?? "",
          onlineLink: data.onlineLink ?? "",
          skillLevel: data.skillLevel ?? "",
          ageLimit: data.ageLimit,
          ageFrom: data.ageFrom ?? null,
          ageTo: data.ageTo ?? null,
        });

      }

      if (deletions.length > 0) {
        await Promise.allSettled(deletions);
      }

      // 참가자 닉네임 매핑
      const allUids = new Set<string>();
      valid.forEach((m) => m.participants?.forEach((p) => allUids.add(p)));

      const nicknameMap: Record<string, string> = {};
      await Promise.all(
        Array.from(allUids).map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(firebaseDb, "users", uid));
            nicknameMap[uid] = userDoc.exists()
              ? userDoc.data().authorNickname || uid
              : uid;
          } catch {
            nicknameMap[uid] = uid;
          }
        })
      );

      const finalData = valid.map((m) => ({
        ...m,
        participantsNicknames:
          m.participants?.map((p) => nicknameMap[p] || p) || [],
      }));

      setMeetups(finalData);
    } catch (err) {
      console.error("❌ fetchMeetups 실패:", err);
    } finally {
      setIsLoadingMeetups(false);
    }
  }, [events, hostId]);

  // ───────────────────────────────────────────────
  // ⚽️ Event 불러오기 (1주일)
  // ───────────────────────────────────────────────
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [footballRes, rugbyRes] = await Promise.all([
          fetch("/api/events/england/football"),
          fetch("/api/events/england/rugby"),
        ]);

        const footballData = await footballRes.json();
        const rugbyData = await rugbyRes.json();

        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        const upcoming = [...footballData.matches, ...rugbyData.matches].filter(
          (m: Event) => {
            const matchDate = new Date(m.date);
            return matchDate >= now && matchDate <= sevenDaysLater;
          }
        );

        setEvents(upcoming);
      } catch (err) {
        console.error("❌ 이벤트 불러오기 실패:", err);
      }
    };

    loadEvents();
  }, []);

  // 이벤트 로딩 이후 Meetup 로딩
  useEffect(() => {
    if (events.length >= 0) fetchMeetups();
  }, [events, fetchMeetups]);

  // ───────────────────────────────────────────────
  // 📅 날짜 필터링
  // ───────────────────────────────────────────────
  const isWithinDateFilter = useCallback(
    (meetupDate: string) => {
      const d = new Date(meetupDate);
      const now = new Date();

      if (filterDate === "all") return true;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (filterDate === "this_week") return d >= startOfWeek && d <= endOfWeek;

      if (filterDate === "next_week") {
        const nextStart = new Date(endOfWeek);
        nextStart.setDate(nextStart.getDate() + 1);

        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextStart.getDate() + 6);

        return d >= nextStart && d <= nextEnd;
      }

      if (filterDate === "weekend") return d.getDay() === 6 || d.getDay() === 0;

      return true;
    },
    [filterDate]
  );

  // ───────────────────────────────────────────────
  // 🔍 필터링된 Meetup 리스트
  // ───────────────────────────────────────────────
  const filteredMeetups = useMemo(() => {
    return meetups.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.title?.toLowerCase().includes(q) ||
        m.location?.name?.toLowerCase().includes(q);

      const matchesType = filterType === "all" || m.type === filterType;

      // 나이 필터 로직 교체
      const matchesAge = (() => {
        if (filterAge === "all") return true;

        // under 18 모임만 보기
        if (filterAge === "under18") {
          // 저장된 문자열 버전
          if (m.ageLimit?.toLowerCase().includes("under")) return true;
          // 커스텀 범위: 최대 나이가 18 이하인지
          if (m.ageTo !== null && m.ageTo <= 18) return true;
          return false;
        }

        // 18+ 모임만 보기
        if (filterAge === "18plus") {
          // 문자열
          if (m.ageLimit === "18+") return true;
          // custom range: 최소 나이가 18 이상인지
          if (m.ageFrom !== null && m.ageFrom >= 18) return true;
          return false;
        }

        return true;
      })();


      const matchesDate = isWithinDateFilter(m.datetime);
      const matchesRegion = !region || m.location?.city === region;

      return (
        matchesSearch &&
        matchesType &&
        matchesAge &&
        matchesDate &&
        matchesRegion
      );
    });
  }, [
    meetups,
    searchQuery,
    filterType,
    filterAge,
    filterDate,
    region,
    isWithinDateFilter,
  ]);

  // ───────────────────────────────────────────────
  // 🔁 반환
  // ───────────────────────────────────────────────
  return {
    meetups,
    filteredMeetups,
    events,
    isLoadingMeetups,

    // 필터 관련
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterAge,
    setFilterAge,
    filterDate,
    setFilterDate,
  };
  
}

export type UseMeetupsReturn = ReturnType<typeof useMeetups>;
