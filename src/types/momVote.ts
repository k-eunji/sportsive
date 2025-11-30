//src/types/momVote.ts

export type MOMCandidate = {
  id: string;
  name: string;   // ← playerName → name 으로 수정
  votes: number;
  photoUrl?: string | null;
  position?: "GK" | "DF" | "MF" | "FW" | null;
};

export type MomVoteModuleType = {
  id: string;
  type: "momvote";
  createdAt: string;
  createdBy: string;

  reactions: {
    likes: number;
    participants: number;
  };

  data: {
    matchId: string;
    title: string;
    expiresAt: string;
    locked: boolean;
    kickoff: string | null;
    opponent: string | null;
    candidates: MOMCandidate[];
  };
};
