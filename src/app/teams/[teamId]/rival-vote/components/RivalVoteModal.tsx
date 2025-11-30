//src/app/teams/[teamId]/rival-vote/components/RivalVoteModal.tsx

export default function RivalVoteModal({
  mod,
  voted,
  onVote,
  onClose,
}: {
  mod: { data: { options: any[] } };
  voted: boolean;
  onVote: (teamId: string) => void;
  onClose: () => void;
}) {
  const options = mod.data?.options ?? [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

        <h2 className="text-xl font-semibold mb-5 text-center">🔥 Choose Rival Team</h2>

        <div className="grid grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">

          {options.map((o) => (
            <button
              key={o.teamId}
              disabled={voted}
              onClick={async () => {
                await onVote(o.teamId);
                onClose();
              }}
              className="
                flex flex-col items-center py-3
                rounded-lg transition-all
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              <img
                src={o.logo}
                className="w-12 h-12 object-contain mb-2"
              />

              <span className="text-[13px] font-medium text-center leading-tight">
                {o.teamName}
              </span>

              <span className="text-[11px] text-gray-500">
                {o.votes} votes
              </span>
            </button>
          ))}

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
        >
          Close
        </button>

      </div>
    </div>
  );
}
