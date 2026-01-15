"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CommentModal } from "@/components/CommentModal";
import { VideoModal } from "@/components/VideoModal";
import { BetCard } from "./BetCard";
import SingleSelectDropdown, { SingleSelectOption } from "./Dropdown";
import { BetGridProps } from "@/types/bet";

export function BetGrid({
  admin,
  bets,
  userId,
  onYesAnswer,
  onNoAnswer,
  onUpdateComment,
  onDeleteBet,
  onAppendVideo,
  isAllowedToVote,
  userAnswers,
  userComments,
  seasonVals,
  selectedYear,
}: BetGridProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeBet, setActiveBet] = useState<{
    id: number;
    comment: string | null;
    locked: boolean;
  } | null>(null);

  const [activeVideoAppend, setActiveVideoAppend] = useState<{
    id: number;
    videoUrl: string | null;
    locked: boolean;
  } | null>(null);

  const [activeVideo, setActiveVideo] = useState<{
    videoUrl: string;
    betTitle: string;
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

  useEffect(() => {
    if (activeVideoAppend) {
      inputRef.current?.click();
    }
  }, [activeVideoAppend]);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeVideoAppend) return;

    const formData = new FormData();
    formData.append("betId", String(activeVideoAppend.id));
    formData.append("file", file);

    const result = await onAppendVideo(formData);
    if (!result?.success) {
      alert(result?.error || "Upload failed");
    }

    e.target.value = "";
    setActiveVideoAppend(null);
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
        {bets.map((bet) => {
          const isOwner = bet.owners.some(
            (owner) => owner.agent_rel.user_relation.id === userId
          );

          const canAppendVideo = isOwner && !bet.videoUrl && !bet.season.locked;

          return (
            <BetCard
              key={bet.id}
              admin={admin}
              bet={bet}
              isAllowedToVote={isAllowedToVote}
              userAnswer={userAnswers?.get(bet.id) ?? null}
              userComment={userComments?.get(bet.id) ?? null}
              onYesAnswer={onYesAnswer}
              onNoAnswer={onNoAnswer}
              onDeleteBet={onDeleteBet}
              onOpenComment={() =>
                setActiveBet({
                  id: bet.id,
                  comment: userComments?.get(bet.id) ?? null,
                  locked: bet.season.locked,
                })
              }
              onOpenVideo={() => {
                if (bet.videoUrl) {
                  setActiveVideo({
                    videoUrl: bet.videoUrl,
                    betTitle: bet.bet,
                  });
                }
              }}
              onRequestAppendVideo={
                canAppendVideo
                  ? () =>
                      setActiveVideoAppend({
                        id: bet.id,
                        locked: bet.season.locked,
                        videoUrl: bet.videoUrl,
                      })
                  : undefined
              }
            />
          );
        })}
      </div>

      {activeVideoAppend && (
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
        />
      )}

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

      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.videoUrl}
          betTitle={activeVideo.betTitle}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
