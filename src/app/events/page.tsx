// src/app/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EventList from './components/EventList';
import EventMap from './components/EventMap';
import EventFilterBar from './components/EventFilter';
import type { Event } from '@/types';

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');

  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return {
      from: now.toISOString().slice(0, 10),
      to: nextWeek.toISOString().slice(0, 10),
    };
  });

  /** ✅ 사용자 위치 가져오기 */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Location access denied')
      );
    }
  }, []);

  /** ✅ 이벤트 불러오기 */
  useEffect(() => {
    async function fetchAllEvents() {
      setLoading(true);
        try {
          const [baseRes, footballRes] = await Promise.allSettled([
            fetch('/api/events'),
            fetch('/api/events/england/football'),
          ]);

          let baseEvents: Event[] = [];
          if (baseRes.status === 'fulfilled' && baseRes.value.ok) {
            const json = await baseRes.value.json();
            baseEvents = json.events ?? [];
          }

          let footballEvents: Event[] = [];
          if (footballRes.status === 'fulfilled' && footballRes.value.ok) {
            const data = await footballRes.value.json();
            footballEvents = (data.matches ?? []).map((m: any) => ({
              id: m.id,
              date: m.date ?? m.utcDate,
              competition: m.competition ?? 'Unknown',
              homeTeam: m.homeTeam ?? 'Unknown Home',
              awayTeam: m.awayTeam ?? 'Unknown Away',
              homeTeamLogo: m.homeTeamLogo ?? '',
              awayTeamLogo: m.awayTeamLogo ?? '',
              venue: m.venue ?? 'Unknown Stadium',
              status: m.status,
              teams: [m.homeTeam ?? '', m.awayTeam ?? ''],
              location: m.location ?? null,
              title: m.title ?? `${m.homeTeam} vs ${m.awayTeam}`,
              city: m.city ?? '',
              region: m.region ?? '',
              category: 'football',
              homepageUrl: m.homepageUrl ?? undefined,
            }));
          }

          // ⭐⭐⭐ 여기서 중복 제거
          const merged = [...baseEvents, ...footballEvents];

          const uniqueEvents = Array.from(
            new Map(
              merged.map((e) => [`${e.id}-${e.title}`, e])
            ).values()
          );

          setEvents(uniqueEvents);

        } catch (err) {
          console.error('Failed to fetch events:', err);
        } finally {
          setLoading(false);
        }

    }

    fetchAllEvents();
  }, []);

  /** ✅ 필터 적용 */
  useEffect(() => {
    let temp = [...events];

    // 미래 일정만
    temp = temp.filter((e) => new Date(e.date).getTime() >= Date.now());

    // 지역, 도시, 종목, 리그 필터
    temp = temp.filter(
      (e) =>
        (!selectedRegion || e.region === selectedRegion) &&
        (!selectedCity || e.city === selectedCity) &&
        (!selectedCategory || e.category === selectedCategory) &&
        (!selectedCompetition || e.competition === selectedCompetition)
    );

    // 날짜 범위 필터
    if (dateRange.from) temp = temp.filter((e) => new Date(e.date) >= new Date(dateRange.from!));
    if (dateRange.to) temp = temp.filter((e) => new Date(e.date) <= new Date(dateRange.to!));

    // 시간순 정렬
    temp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEvents(temp);
  }, [events, selectedRegion, selectedCity, selectedCategory, selectedCompetition, dateRange]);

  /** ✅ 로딩 상태 */
  if (loading)
    return (
      <main className="flex items-center justify-center min-h-dvh bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-base animate-pulse">Loading events...</p>
      </main>
    );

  return (
    <main
      className="
        max-w-7xl mx-auto p-4 pt-24 
        text-gray-900 dark:text-gray-100
      "
    >
      <h1 className="text-3xl font-semibold text-blue-600 mb-6 text-center">All Events</h1>

      {selectedEvent && (
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href={`/meetups?new=1&eventId=${encodeURIComponent(selectedEvent.id)}`}
            className="px-4 py-3 rounded-xl shadow-lg bg-blue-600 text-white hover:bg-blue-700"
            title="Create a meetup for this event"
          >
            🤝 Create meetup for “{selectedEvent.title ?? `${selectedEvent.homeTeam} vs ${selectedEvent.awayTeam}` }”
          </a>
        </div>
      )}


      {/* 🔹 필터 바 */}
      <EventFilterBar
        selectedRegion={selectedRegion}
        selectedCity={selectedCity}
        selectedCategory={selectedCategory}
        selectedCompetition={selectedCompetition}
        events={events}
        onRegionChange={(r) => {
          setSelectedRegion(r);
          setSelectedCity('');
        }}
        onCityChange={setSelectedCity}
        onCategoryChange={setSelectedCategory}
        onCompetitionChange={setSelectedCompetition}
      >
        {/* 🔸 날짜 범위 선택 */}
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">From</span>
            <input
              type="date"
              value={dateRange.from ?? ''}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="
                w-32 rounded-md border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">To</span>
            <input
              type="date"
              value={dateRange.to ?? ''}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="
                w-32 rounded-md border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
        </div>
      </EventFilterBar>

      {/* 🔹 지도 + 리스트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <EventMap
            events={filteredEvents}
            filteredEvents={filteredEvents}
            setFilteredEvents={setFilteredEvents}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            selectedCity={selectedCity}
            selectedRegion={selectedRegion}
            userLocation={userLocation ?? undefined}
          />
        </div>

        
        {/* 리스트 영역 */}
        <EventList events={filteredEvents} onEventClick={(event) => setSelectedEvent(event)} />        
      </div>
    </main>
  );
}
