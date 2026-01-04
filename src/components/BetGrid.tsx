"use client";

import React, { useState } from "react";
import { CommentModal } from "@/components/CommentModal";
import { useRouter } from "next/navigation";
import { BetGridProps } from "@/types/bet";
import { BetCard } from "./BetCard";
import SingleSelectDropdown, { SingleSelectOption } from "./Dropdown";

export function BetGrid({
  admin,
  bets,
  onYesAnswer,
  onNoAnswer,
  onUpdateComment,
  onDeleteBet,
  isAllowedToVote,
  userAnswers,
  userComments,
  seasonVals,
  selectedYear,
}: BetGridProps) {
  const router = useRouter();

  const [activeBet, setActiveBet] = useState<{
    id: number;
    comment: string | null;
    locked: boolean;
  } | null>(null);

  const dropdownSeasons: SingleSelectOption<number>[] = seasonVals.map(
    (season) => ({
      label: season.title
        ? `${season.title} ${season.year}`
        : season.year.toString(),
      value: season.year,
    })
  );

  function handleSeasonChange(year: number) {
    router.push(`/bets?season=${year}`);
  }

  return (
    <>
      <SingleSelectDropdown
        className="py-2"
        options={dropdownSeasons}
        value={selectedYear}
        onChange={handleSeasonChange}
        placeholder="Choose a season..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {bets.map((bet) => (
          <BetCard
            key={bet.id}
            admin={admin}
            bet={bet}
            onYesAnswer={onYesAnswer}
            onNoAnswer={onNoAnswer}
            onDeleteBet={onDeleteBet}
            isAllowedToVote={isAllowedToVote}
            userAnswer={userAnswers?.get(bet.id) ?? null}
            userComment={userComments?.get(bet.id) ?? null}
            onOpenComment={() =>
              setActiveBet({
                id: bet.id,
                comment: userComments?.get(bet.id) ?? null,
                locked: bet.season.locked,
              })
            }
          />
        ))}
      </div>
      {activeBet && (
        <CommentModal
          betId={activeBet.id}
          initialComment={activeBet.comment}
          locked={activeBet.locked}
          onClose={() => setActiveBet(null)}
          onSubmit={async (formData) => {
            await onUpdateComment(formData);
            setActiveBet(null);
          }}
        />
      )}
    </>
  );
}
