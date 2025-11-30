// src/app/teams/[teamId]/components/TeamHubCTA.tsx

import Link from "next/link";

interface Props {
  teamId: string;
}

export default function TeamHubCTA({ teamId }: Props) {
  return (
    <div className="flex flex-col gap-3 my-6">
      <Link
        href={`/live?teamId=${teamId}`}
        className="p-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 text-center"
      >
        Join Live Chat for this Team
      </Link>
      <Link
        href={`/meetups?teamId=${teamId}`}
        className="p-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 text-center"
      >
        See Meetups for this Team
      </Link>
    </div>
  );
}
