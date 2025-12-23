//src/app/teams/[teamId]/mom-vote/history/page.tsx

import HistoryRow from "./HistoryRow";

async function getList(teamId: string) {
  const res = await fetch(`/api/teams/${teamId}/momvote/list`, {
    cache: "no-store",
  });

  const data = await res.json();
  return data.list;
}

export default async function MomVoteHistoryPage({ params }: { params: Promise<any> }) {
  const { teamId } = await params;

  const list = await getList(teamId);

  if (!list || list.length === 0)
    return <div className="p-10 text-center text-gray-500">No MOM history.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-24 space-y-6">
      <h1 className="text-2xl font-bold mb-6">MOM Vote History</h1>

      {list.map((mod: any) => (
        <HistoryRow key={mod.id} mod={mod} teamId={teamId} />
      ))}
    </div>
  );
}
