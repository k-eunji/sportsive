//src/app/teams/[teamId]/mom-vote/[moduleId]/page.tsx

import Image from "next/image";

async function getModule(teamId: string, moduleId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/momvote/${moduleId}/detail`,
    { cache: "no-store" }
  );

  return (await res.json()).module;
}

export default async function MomVoteDetailPage({ params }: any) {
  const { teamId, moduleId } = params;
  const mod = await getModule(teamId, moduleId);

  if (!mod)
    return (
      <div className="p-10 text-center text-gray-500">
        MOM vote not found.
      </div>
    );

  const sorted = [...mod.data.candidates].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((s, c) => s + c.votes, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 pt-24">

      <h1 className="text-2xl font-bold mb-2">{mod.data.title}</h1>

      <p className="text-sm text-gray-600">
        vs {mod.data.opponent} —{" "}
        {new Date(mod.data.kickoff).toLocaleDateString("en-GB")}
      </p>

      <p className="text-gray-800 mt-2 font-semibold">
        Total votes: {totalVotes}
      </p>

      <div className="mt-6 space-y-4">
        {sorted.map((c: any, index: number) => {
          const pct = totalVotes ? Math.round((c.votes / totalVotes) * 100) : 0;

          return (
            <div
              key={c.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">

                {c.photoUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src={c.photoUrl} alt={c.name} fill />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
                    {c.name.charAt(0)}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {index < 3 && (
                      <span className="mr-1 text-xl animate-bounce">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                      </span>
                    )}
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">{c.position}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{c.votes}</p>
                  <p className="text-xs text-gray-500">{pct}%</p>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div
                  className="h-full rounded-full bg-red-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
