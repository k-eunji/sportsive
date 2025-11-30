// src/components/layout/UpcomingMatches.tsx
import { getUpcomingEvents } from '@/lib/events';
import EventCard from '@/app/events/components/EventCard';
import type { Event, MatchEvent } from '@/types';

export default async function UpcomingMatches() {
  const matches: MatchEvent[] = await getUpcomingEvents();

  if (!matches.length) return null;

  const events: Event[] = matches.map((m) => ({
    id: m.id,
    date: m.date,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeTeamLogo: m.homeTeamLogo,
    awayTeamLogo: m.awayTeamLogo,
    venue: m.venue,
    city: m.city,
    region: m.region,
    competition: m.competition ?? '',
    location: {
      lat: m.location?.lat ?? 0,
      lng: m.location?.lng ?? 0,
      address: '',
    },
    free: true,
    organizerId: '',
    attendees: [],
    timeZone: 'UTC',
  }));

  return (
    <section className="mt-20 max-w-5xl mx-auto px-4">
      {/* ✅ 제목을 현재 테마 그라데이션으로 */}
      <h3
        className="text-3xl font-extrabold mb-10 
                   bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] 
                   bg-clip-text text-transparent text-center"
      >
        🏆 Upcoming Matches
      </h3>

      <div className="flex flex-wrap justify-center gap-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border 
                       border-[color-mix(in oklch,var(--primary-from) 25%,white)] 
                       dark:border-[color-mix(in oklch,var(--primary-to) 40%,black)] 
                       bg-[color-mix(in oklch,var(--primary-from) 4%,white)]
                       dark:bg-[color-mix(in oklch,var(--primary-to) 8%,black)]
                       shadow-md hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
