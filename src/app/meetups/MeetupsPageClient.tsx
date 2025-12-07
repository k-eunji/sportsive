// src/app/meetups/MeetupsPageClient.tsx

"use client";

import MeetupList from "./components/MeetupList";
import BottomNav from "@/components/layout/BottomNav";
import SearchBar from "./components/search/SearchBar";
import CreateMeetupModal from "./components/CreateMeetupModal";
import { useRouter } from "next/navigation"; // ✅ useSearchParams 제거
import { useEffect, useState } from "react";
import { useMeetups } from "./hooks/useMeetups";
import { useUser } from "@/context/UserContext";

export default function MeetupsPageClient() {
  const {
    filteredMeetups,
    events,
    isLoadingMeetups,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterAge,
    setFilterAge,
    filterDate,
    setFilterDate
  } = useMeetups();

  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const hostId = user?.uid ?? "";

  // ✅ useSearchParams → window.location.search 로 대체
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldOpen = params.get("new") === "1";

    if (shouldOpen) {
      setShowModal(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        filterAge={filterAge}
        setFilterAge={setFilterAge}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />

      <MeetupList
        meetups={filteredMeetups}
        hostId={hostId}
        isLoading={isLoadingMeetups}
      />

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full bg-blue-600 text-white text-3xl shadow-xl flex items-center justify-center z-40"
      >
        +
      </button>

      <BottomNav />

      {showModal && (
        <CreateMeetupModal
          upcomingEvents={events}
          onClose={() => setShowModal(false)}
          onCreated={(id) => router.push(`/meetups/${id}`)}
        />
      )}

    </main>
  );
}
