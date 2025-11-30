// src/app/meetups/page.tsx

"use client";

import MeetupList from "./components/MeetupList";
import BottomNav from "@/components/layout/BottomNav";
import SearchBar from "./components/search/SearchBar";
import CreateMeetupModal from "./components/CreateMeetupModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMeetups } from "./hooks/useMeetups";
import { useUser } from "@/context/UserContext";

export default function MeetupsPage() {
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
  const search = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const hostId = user?.uid ?? "";

  useEffect(() => {
    const shouldOpen = search?.get("new") === "1";
    if (shouldOpen) {
      setShowModal(true);
    }
  }, [search]);

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

      {/* Create Button */}
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
