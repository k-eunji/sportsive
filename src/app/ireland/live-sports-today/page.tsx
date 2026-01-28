///src/app/ireland/live-sports-today/page.tsx

export const metadata = {
  title: "Live Sports in Ireland Today | Sportsive",
  description:
    "Find live sports matches happening across Ireland today. Football, rugby and more — shown by location and time.",
};

export default function IrelandLiveSportsTodayPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">
        Live sports happening across Ireland today
      </h1>

      <p className="text-muted-foreground">
        Discover sports matches happening today across Ireland,
        including football, rugby and other live events.
      </p>

      <ul className="list-disc pl-6 text-muted-foreground">
        <li>
          <a href="/ireland/dublin/live-sports-today" className="underline">
            Live sports in Dublin today
          </a>
        </li>
      </ul>

      <a href="/app" className="underline underline-offset-4">
        Open the live sports map
      </a>
    </main>
  );
}
