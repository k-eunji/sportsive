// src/app/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EventList from './components/EventList';
import EventMap from './components/EventMap';
import EventFilterBar from './components/EventFilter';
import type { Event } from '@/types';
import FocusFromQuery from './components/FocusFromQuery';


export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
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
          const [baseRes, footballRes, rugbyRes, tennisRes] = await Promise.allSettled([
            fetch('/api/events'),
            fetch('/api/events/england/football'),
            fetch('/api/events/england/rugby'),
            fetch('/api/events/england/tennis'),
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
              sport: 'football',
              kind: 'match',
              homepageUrl: m.homepageUrl ?? undefined,
            }));
          }

          let rugbyEvents: Event[] = [];
            if (rugbyRes.status === 'fulfilled' && rugbyRes.value.ok) {
              const data = await rugbyRes.value.json();
              rugbyEvents = (data.matches ?? []).map((m: any) => ({
                id: m.id,
                date: m.date,
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
                sport: 'rugby',
                kind: 'match',
                homepageUrl: m.homepageUrl ?? undefined,
              }));
            }

            let tennisEvents: Event[] = [];
              if (tennisRes.status === 'fulfilled' && tennisRes.value.ok) {
                const data = await tennisRes.value.json();

                tennisEvents = (data.matches ?? []).map((m: any) => ({
                  id: m.id,
                  title: m.title,

                  date: m.date,                 // 정렬 anchor
                  startDate: m.startDate,
                  endDate: m.endDate,

                  sport: 'tennis',
                  kind: 'session',

                  venue: m.venue,
                  city: m.city,
                  region: m.region,
                  location: m.location ?? { lat: null, lng: null },

                  homepageUrl: m.homepageUrl,
                  isPaid: m.isPaid ?? true,

                  // Event 타입 필수값들(없으면 UI/타입 깨짐 방지)
                  free: false,
                  organizerId: 'system',
                  attendees: [],
                }));
              }



          // ⭐⭐⭐ 여기서 중복 제거
          const merged = [...baseEvents, ...footballEvents, ...rugbyEvents, ...tennisEvents];

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

    const now = new Date();

      // 미래 + 진행 중 이벤트만
      temp = temp.filter((e) => {
        // 🎾 테니스 / 기간 이벤트
        if (e.kind === 'session' && e.startDate && e.endDate) {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);

          // 아직 안 시작했거나, 진행 중
          return start > now || (start <= now && now <= end);
        }

        // ⚽️🏉 match (단일 경기)
        return new Date(e.date).getTime() >= now.getTime();
      });


    // 지역, 도시, 종목, 리그 필터
    temp = temp.filter(
      (e) =>
        (!selectedRegion || e.region === selectedRegion) &&
        (!selectedCity || e.city === selectedCity) &&
        (!selectedSport || e.sport === selectedSport) &&
        (!selectedCompetition || e.competition === selectedCompetition)
    );

    // 날짜 범위 필터
    // 날짜 범위 필터 (session은 start~end 기준)
    if (dateRange.from || dateRange.to) {
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;

      temp = temp.filter((e) => {
        // 🎾 session (테니스 대회)
        if (e.kind === 'session' && e.startDate && e.endDate) {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);

          // 기간이 선택 범위와 겹치면 표시
          if (from && end < from) return false;
          if (to && start > to) return false;
          return true;
        }

        // ⚽️🏉 match (단일 경기)
        const d = new Date(e.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    // 시간순 정렬
    temp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEvents(temp);
  }, [events, selectedRegion, selectedCity, selectedSport, selectedCompetition, dateRange]);

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
        w-full
        lg:max-w-7xl lg:mx-auto
        px-0 lg:px-4
        pt-6
        text-gray-900 dark:text-gray-100
      "
    >

      <h1 className="text-3xl font-semibold mb-2 text-center">
        Matches near you
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Live, today, and upcoming sports matches
      </p>

      {/* 🔹 필터 바 */}
      <EventFilterBar
        selectedRegion={selectedRegion}
        selectedCity={selectedCity}
        selectedSport={selectedSport}
        selectedCompetition={selectedCompetition}
        events={events}
        onRegionChange={(r) => {
          setSelectedRegion(r);
          setSelectedCity('');
        }}
        onCityChange={setSelectedCity}
        onSportChange={(sport) => {
          setSelectedSport(sport);

          // 🔥 테니스 카드 안 나오던 진짜 원인 해결
          setSelectedCompetition('');
          setSelectedRegion('');
          setSelectedCity('');
        }}

        

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

      <FocusFromQuery
        events={events}
        onSelect={(event) => setSelectedEvent(event)}
      />

      {/* 🔹 지도 + 리스트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="lg:rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
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
