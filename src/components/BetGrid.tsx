"use client";

import React, { useState } from "react";

import { CommentModal } from "@/components/CommentModal";
import { VideoModal } from "@/components/VideoModal";
import { VideoAppendButton } from "./VideoAppendButton";
import { BetCard } from "./BetCard";
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
}: BetGridProps) {
  const [activeBet, setActiveBet] = useState<{
    id: number;
    comment: string | null;
    locked: boolean;
  } | null>(null);

  const [activeVideoAppend, setActiveVideoAppend] = useState<{
    id: number;
    locked: boolean;
  } | null>(null);

  const [activeVideo, setActiveVideo] = useState<{
    videoUrl: string;
    betTitle: string;
  } | null>(null);

  return (
    <>
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
                      })
                  : undefined
              }
            />
          );
        })}
      </div>

      {activeVideoAppend && (
        <VideoAppendButton
          betId={activeVideoAppend.id}
          onAppendVideo={onAppendVideo}
          triggerOnMount
          onFinished={() => setActiveVideoAppend(null)}
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