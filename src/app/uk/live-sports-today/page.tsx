///src/app/uk/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in the UK Today | Sportsive",
  description:
    "Find live sports matches happening across the UK today. Football, rugby, tennis and more — shown by city, location and time.",
};

export default function UKLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening across the UK today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in the UK today?
        This page helps you discover football, rugby, tennis and other
        sports matches taking place across major UK cities.
      </p>

      <p className="text-muted-foreground">
        Sports events are often hard to find unless you already follow
        specific teams or leagues. Sportsive shows what’s happening
        based on location and time — without accounts or subscriptions.
      </p>

      <ul className="list-disc pl-6 text-muted-foreground">
        <li>
          <a href="/uk/london/live-sports-today" className="underline">
            Live sports in London today
          </a>
        </li>
      </ul>

      <a
        href="/app"
        className="inline-block mt-6 underline underline-offset-4"
      >
        Open the live sports map
      </a>
    </main>
  );
}
