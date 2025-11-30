//src/app/teams/[teamId]/components/TeamTopCard.tsx

export default function TeamTopCard({ team }: { team: any }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-neutral-900 px-4 py-4 flex items-center gap-4 shadow-sm">
      <img
        src={team.logoUrl}
        alt={team.name}
        className="h-14 w-14 object-contain"
      />

      <div>
        <h1 className="font-bold text-lg">{team.name}</h1>
        <p className="text-sm text-gray-500">
          {team.city} · {team.league || team.region}
        </p>
      </div>
    </div>
  );
}
