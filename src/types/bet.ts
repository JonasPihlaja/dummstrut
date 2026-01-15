import { Bet, Answer, Season, Bet_Owner, User } from "@prisma/client";


export type BetWithRelations = Bet & {
  season: Pick<Season, "locked">;
  answers: Answer[];
  owners: (Bet_Owner & {
    agent_rel: {
      user_relation: Pick<User, "id" | "username">;
    };
  })[];
};


export interface BetGridProps {
  admin: boolean;
  bets: BetWithRelations[];
  userId: number | null;
  isAllowedToVote: boolean;
  userAnswers: Map<number, boolean | null>;
  userComments: Map<number, string | null>;
  onYesAnswer: (formData: FormData) => Promise<void>;
  onNoAnswer: (formData: FormData) => Promise<void>;
  onUpdateComment: (formData: FormData) => Promise<void>;
  onDeleteBet: (id: number) => Promise<void>;
  onAppendVideo: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string; error?: string } | undefined>;
  seasonVals: Season[];
  selectedYear: number;
}

export interface BetCardProps {
  admin: boolean;
  bet: BetWithRelations;
  isAllowedToVote: boolean;
  userAnswer: boolean | null;
  userComment: string | null;
  onYesAnswer: (formData: FormData) => Promise<void>;
  onNoAnswer: (formData: FormData) => Promise<void>;
  onDeleteBet: (id: number) => Promise<void>;
  onOpenComment: () => void;
  onOpenVideo: () => void;
  onRequestAppendVideo?: () => void;
}


export type SubmitResult = {
  success: boolean;
  message: string;
};

export type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export type Agent = {
  id: number;
  user_relation: {
    username: string;
  };
};

export type BetCreatorProps = {
  seasonVals: Season[];
  agentVals: Agent[];
  userAgentId?: number;
  onSubmitBet: (data: {
    title: string;
    description: string;
    agentIds: number[];
    season: number;
    video?: File | null | undefined;
  }) => Promise<SubmitResult>;
};