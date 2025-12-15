"use client";

import { BetGridProps } from "@/types/bet";
import { BetCard } from "./BetCard";

export function BetGrid({ admin, bets, onYesAnswer, onNoAnswer, onUpdateComment, onDeleteBet, userId, userAnswers, userComments }: BetGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {bets.map((bet) => (
        <BetCard
          admin={admin}
          key={bet.id}
          bet={bet}
          onYesAnswer={onYesAnswer}
          onNoAnswer={onNoAnswer}
          onUpdateComment={onUpdateComment}
          onDeleteBet={onDeleteBet}
          userId={userId}
          userAnswer={userAnswers?.get(bet.id) ?? null}
          userComment={userComments?.get(bet.id) ?? null}
        />
      ))}
    </div>
  );
}
