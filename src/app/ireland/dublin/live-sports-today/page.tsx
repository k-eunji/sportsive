//src/app/ireland/dublin/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in Dublin Today | Sportsive",
  description:
    "See live sports matches happening in Dublin today. Football, rugby and more — mapped by location and time.",
};

export default function DublinLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening in Dublin today
      </h1>

      <p className="text-muted-foreground">
        Looking for live sports happening in Dublin today?
        This page shows matches taking place around Dublin,
        organised by location and time.
      </p>

      <a href="/app" className="underline underline-offset-4">
        See what’s happening on the map right now
      </a>
    </main>
  );
}
