import { Season } from "@prisma/client";

export interface BetGridProps {
  admin: boolean;
  bets: any[];
  userId: number | null;
  userAnswers: Map<number, boolean | null>;
  userComments: Map<number, string | null>;
  onYesAnswer: (formData: FormData) => Promise<void>;
  onNoAnswer: (formData: FormData) => Promise<void>;
  onUpdateComment: (formData: FormData) => Promise<void>;
  onDeleteBet: (id: number) => Promise<void>;
}

export interface BetCardProps {
  admin: boolean;
  bet: any;
  key: number;
  userId: number | null;
  userAnswer: boolean | null;
  userComment: string | null;
  onYesAnswer: (formData: FormData) => Promise<void>;
  onNoAnswer: (formData: FormData) => Promise<void>;
  onUpdateComment: (formData: FormData) => Promise<void>;
  onDeleteBet: (id: number) => Promise<void>;
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
  }) => Promise<SubmitResult>;
};