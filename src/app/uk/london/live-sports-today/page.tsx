///src/app/uk/london/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in London Today | Sportsive",
  description:
    "See live sports matches happening in London today. Football, rugby, tennis and more — mapped by location and time.",
};

export default function LondonLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening in London today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in London today?
        This page shows football, rugby, tennis and other matches
        taking place around London, based on location and time.
      </p>

      <p className="text-muted-foreground">
        Most sports events in London are difficult to find unless
        you already follow the right teams or venues.
        Sportsive makes it easy to quickly check what’s happening nearby.
      </p>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        See what’s happening on the map right now
      </a>
    </main>
  );
}
