"use client";

import { BetWithRelations } from "@/types/bet";
import { VideoAppendButton } from "./VideoAppendButton";

interface BetSwipeCardProps {
  bet: BetWithRelations;
  admin: boolean;
  isOwner: boolean;
  /** Horizontal drag offset of the top card, used to fade the YES/NO hints. */
  dragOffset: number;
  onOpenVideo: () => void;
  onRequestDelete: () => void;
  onAppendVideo: (
    formData: FormData
  ) => Promise<
    { success: boolean; message: string; error?: string } | undefined
  >;
}

const EMOJIS = [
  "🎯",
  "😂",
  "🔥",
  "🙈",
  "🏆",
  "💪",
  "🤡",
  "🚀",
  "😱",
  "👑",
  "🍜",
  "⚽",
  "🎮",
  "🧊",
  "☕",
  "🎲",
];

const GRADIENTS = [
  "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
  "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
  "bg-gradient-to-br from-orange-400 via-red-500 to-rose-500",
  "bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
  "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500",
  "bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-500",
  "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function BetSwipeCard({
  bet,
  admin,
  isOwner,
  dragOffset,
  onOpenVideo,
  onRequestDelete,
  onAppendVideo,
}: BetSwipeCardProps) {
  const hasVideo = !!bet.videoUrl && bet.videoUrl.trim() !== "";
  const canAddVideo = isOwner && !hasVideo && !bet.season.locked;

  const seed = hashString(`${bet.id}-${bet.bet}`);
  const emoji = EMOJIS[seed % EMOJIS.length];
  const gradient = GRADIENTS[seed % GRADIENTS.length];

  let successCount = 0;
  let failCount = 0;
  bet.answers.forEach((ans) => (ans.success ? successCount++ : failCount++));
  const total = successCount + failCount;
  const yesPercent = total ? (successCount / total) * 100 : 0;
  const hasVotes = total > 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl">
      {/* Media / art area */}
      <div
        data-no-swipe
        onClick={hasVideo ? onOpenVideo : undefined}
        className={`relative h-[46%] min-h-[190px] flex-shrink-0 ${
          hasVideo ? "cursor-pointer" : ""
        } ${gradient}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl drop-shadow-lg">{emoji}</span>
        </div>

        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 pl-1 text-2xl text-gray-900 shadow-xl">
              ▶
            </span>
          </div>
        )}

        {!hasVideo && !canAddVideo && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
            No video yet
          </span>
        )}

        {admin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete();
            }}
            title="Delete bet"
            aria-label="Delete bet"
            className="absolute left-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 text-sm text-white transition-colors hover:bg-red-600"
          >
            ✕
          </button>
        )}

        {canAddVideo && (
          <VideoAppendButton
            betId={bet.id}
            onAppendVideo={onAppendVideo}
            className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/70"
          >
            🎥 Add video
          </VideoAppendButton>
        )}

        {/* Vote hints */}
        <div
          className={`absolute left-5 top-5 -rotate-12 border-4 border-rose-500 px-3 py-1 text-3xl font-extrabold uppercase tracking-widest text-rose-500 transition-opacity duration-100 ${
            dragOffset < -18 ? "opacity-100" : "opacity-0"
          }`}
        >
          No
        </div>
        <div
          className={`absolute right-5 top-5 rotate-12 border-4 border-emerald-500 px-3 py-1 text-3xl font-extrabold uppercase tracking-widest text-emerald-500 transition-opacity duration-100 ${
            dragOffset > 18 ? "opacity-100" : "opacity-0"
          }`}
        >
          Yes
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-2xl font-bold leading-tight text-gray-900">
            {bet.bet}
          </h2>
          {bet.owners.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {bet.owners.map((owner) => (
                <span
                  key={owner.id}
                  className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {owner.agent_rel?.user_relation?.username}
                </span>
              ))}
            </div>
          )}
        </div>

        {bet.description && (
          <p className="text-sm leading-relaxed text-gray-600">
            {bet.description}
          </p>
        )}

        {/* Vote ratio */}
        <div className="mt-auto space-y-1.5">
          {hasVotes ? (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${yesPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{successCount} Yes</span>
                <span>{failCount} No</span>
              </div>
            </>
          ) : (
            <p className="text-xs italic text-gray-400">
              No votes yet — be the first to make a guess.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}