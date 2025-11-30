// src/types/rivalVote.ts

export type RivalVoteOption = {
  teamId: string;
  teamName: string;
  logo?: string;
  votes: number;
};

export type RivalVoteModuleType = {
  id: string;
  type: "rivalvote";
  createdAt: string;
  reactions: {
    likes: number;
    comments: number;
    participants: number;
  };
  data: {
    options: RivalVoteOption[];
  };
  options?: RivalVoteOption[];
};
