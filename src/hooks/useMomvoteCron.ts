//src/hooks/useMomvoteCron.ts

import { useEffect } from "react";

export default function useMomvoteCron(teamId: string) {
  useEffect(() => {
    if (!teamId) return;

    fetch(`/api/teams/${teamId}/momvote/cron`, {
      method: "POST",
    }).catch(() => {});
  }, [teamId]);
}
