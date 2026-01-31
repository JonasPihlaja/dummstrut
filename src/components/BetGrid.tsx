"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CommentModal } from "@/components/CommentModal";
import { VideoModal } from "@/components/VideoModal";
import { BetCard } from "./BetCard";
import SingleSelectDropdown, { SingleSelectOption } from "./Dropdown";
import { BetGridProps } from "@/types/bet";
import { compressVideo } from "@/lib/videoCompression";

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

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);

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

    let fileToUpload = file;

    // Compress video before uploading
    try {
      setIsCompressing(true);
      setCompressionProgress(0);
      fileToUpload = await compressVideo(file, (progress) => {
        setCompressionProgress(progress);
      });
      setIsCompressing(false);
      setCompressionProgress(0);
    } catch (error) {
      setIsCompressing(false);
      setCompressionProgress(0);
      alert(`Failed to compress video: ${error instanceof Error ? error.message : "Unknown error"}`);
      e.target.value = "";
      setActiveVideoAppend(null);
      return;
    }

    const formData = new FormData();
    formData.append("betId", String(activeVideoAppend.id));
    formData.append("file", fileToUpload);

    const result = await onAppendVideo(formData);
    if (!result?.success) {
      alert(result?.error || result?.message || "Upload failed");
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
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
            disabled={isCompressing}
          />
          {isCompressing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Compressing video...</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {compressionProgress}% complete
                </p>
              </div>
            </div>
          )}
        </>
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
