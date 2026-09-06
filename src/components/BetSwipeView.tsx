"use client";

import { useEffect, useRef, useState } from "react";
import { BetWithRelations } from "@/types/bet";
import {
  SwipeableCard,
  SwipeableCardHandle,
  SwipeDirection,
} from "./SwipeableCard";
import { BetSwipeCard } from "./BetSwipeCard";
import { CommentModal } from "./CommentModal";
import { VideoModal } from "./VideoModal";

interface BetSwipeViewProps {
  bets: BetWithRelations[];
  admin: boolean;
  userId: number | null;
  isAllowedToVote: boolean;
  selectedYear: number;
  onYesAnswer: (formData: FormData) => Promise<void>;
  onNoAnswer: (formData: FormData) => Promise<void>;
  onUpdateComment: (formData: FormData) => Promise<void>;
  onDeleteBet: (betId: number) => Promise<void>;
  onAppendVideo: (
    formData: FormData
  ) => Promise<
    { success: boolean; message: string; error?: string } | undefined
  >;
}

interface CommentPrompt {
  id: number;
  locked: boolean;
  title: string;
}

const PROMPT_MS = 6000;

export function BetSwipeView({
  bets,
  admin,
  userId,
  isAllowedToVote,
  selectedYear,
  onYesAnswer,
  onNoAnswer,
  onUpdateComment,
  onDeleteBet,
  onAppendVideo,
}: BetSwipeViewProps) {
  const [deck, setDeck] = useState<BetWithRelations[]>(bets);
  const [swipedCount, setSwipedCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [prompt, setPrompt] = useState<CommentPrompt | null>(null);
  const [commentBet, setCommentBet] = useState<{
    id: number;
    locked: boolean;
  } | null>(null);
  const [video, setVideo] = useState<{ url: string; title: string } | null>(
    null
  );

  const topCardRef = useRef<SwipeableCardHandle>(null);

  const totalCount = bets.length;
  const remaining = deck.length;

  // Auto-dismiss the "add a comment" pill
  useEffect(() => {
    if (!prompt) return;
    const timer = window.setTimeout(() => setPrompt(null), PROMPT_MS);
    return () => window.clearTimeout(timer);
  }, [prompt]);

  // Keyboard shortcuts: left/right arrows vote No/Yes
  useEffect(() => {
    if (commentBet || video || processing || remaining === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        topCardRef.current?.swipe("right");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        topCardRef.current?.swipe("left");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commentBet, video, processing, remaining]);

  async function handleSwipe(bet: BetWithRelations, dir: SwipeDirection) {
    if (processing || !isAllowedToVote) return;
    setProcessing(true);
    setDragOffset(0);

    const formData = new FormData();
    formData.append("betId", String(bet.id));

    try {
      if (dir === "right") {
        await onYesAnswer(formData);
      } else {
        await onNoAnswer(formData);
      }
    } catch (error) {
      alert(
        `Could not save your vote: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // Put the card back at the end of the deck so it is not lost.
      setDeck((d) => [...d.slice(1), bet]);
      setProcessing(false);
      return;
    }

    setDeck((d) => d.slice(1));
    setSwipedCount((c) => c + 1);
    setPrompt({ id: bet.id, locked: bet.season.locked, title: bet.bet });
    setProcessing(false);
  }

  async function handleDelete(bet: BetWithRelations) {
    if (!confirm(`Delete the bet "${bet.bet}"? This cannot be undone.`))
      return;
    await onDeleteBet(bet.id);
    setDeck((d) => d.filter((b) => b.id !== bet.id));
  }

  const isEmpty = remaining === 0;

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center">
      {/* Progress */}
      <div className="mb-4 flex w-full items-center justify-between text-sm text-gray-500">
        <span>
          {remaining} {remaining === 1 ? "bet" : "bets"} left
        </span>
        <span>
          {totalCount > 0
            ? `You've rated ${swipedCount} of ${totalCount}`
            : "Nothing to rate"}
        </span>
      </div>

      {!isAllowedToVote && remaining > 0 && (
        <div className="mb-4 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
          Voting is limited to people who created a bet this season. You can
          still browse the cards, watch videos, and see how others voted.
        </div>
      )}

      {/* Deck */}
      <div
        className="relative w-full max-w-md"
        style={{ height: "min(62vh, 540px)" }}
      >
        {!isEmpty &&
          deck.slice(0, 3).map((bet, idx) => {
            const isTop = idx === 0;
            const layer = isTop ? 2 : idx === 1 ? 1 : 0;
            const layerStyle =
              layer === 0
                ? { transform: "scale(0.88) translateY(28px) rotate(-3deg)" }
                : layer === 1
                ? { transform: "scale(0.94) translateY(14px) rotate(2deg)" }
                : undefined;

            const card = (
              <BetSwipeCard
                bet={bet}
                admin={admin}
                isOwner={
                  bet.owners.some(
                    (o) => o.agent_rel.user_relation.id === userId
                  )
                }
                dragOffset={isTop ? dragOffset : 0}
                onOpenVideo={() =>
                  bet.videoUrl &&
                  setVideo({ url: bet.videoUrl, title: bet.bet })
                }
                onRequestDelete={() => handleDelete(bet)}
                onAppendVideo={onAppendVideo}
              />
            );

            return (
              <div
                key={bet.id}
                className={`absolute inset-0 ${
                  isTop ? "deck-pop" : "pointer-events-none"
                }`}
                style={{
                  zIndex: 30 - layer,
                  ...(layerStyle ?? {}),
                  opacity: layer === 0 ? 0.7 : layer === 1 ? 0.9 : 1,
                }}
              >
                {isTop ? (
                  <SwipeableCard
                    ref={topCardRef}
                    disabled={!isAllowedToVote || processing}
                    onSwiping={(x) => setDragOffset(x)}
                    onSwipeCancel={() => setDragOffset(0)}
                    onSwiped={(dir) => handleSwipe(bet, dir)}
                    className="h-full w-full"
                  >
                    {card}
                  </SwipeableCard>
                ) : (
                  card
                )}
              </div>
            );
          })}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-gray-300 bg-white/60 p-8 text-center">
            <div className="text-7xl">🃏</div>
            <h3 className="text-2xl font-bold text-gray-800">
              {swipedCount > 0
                ? "You're all caught up! 🎉"
                : "Nothing to swipe"}
            </h3>
            <p className="max-w-sm text-gray-500">
              {swipedCount > 0
                ? `Nice work — you rated ${swipedCount} bet${
                    swipedCount === 1 ? "" : "s"
                  } this session.`
                : "There are no bets left that you haven't voted on. Try another season or create a new bet."}
            </p>
            <a
              href={`/bets?season=${selectedYear}&view=grid`}
              className="rounded-full bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Back to the grid
            </a>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isEmpty && (
        <div className="mt-8 flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={() => topCardRef.current?.swipe("left")}
            disabled={!isAllowedToVote || processing}
            aria-label="Vote No (swipe left)"
            title="Vote No (swipe left)"
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-rose-300 bg-white text-2xl text-rose-500 shadow-lg transition-all duration-150 hover:scale-110 hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-rose-500"
          >
            ✗
          </button>

          <button
            type="button"
            onClick={() => topCardRef.current?.swipe("right")}
            disabled={!isAllowedToVote || processing}
            aria-label="Vote Yes (swipe right)"
            title="Vote Yes (swipe right)"
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-emerald-300 bg-white text-2xl text-emerald-500 shadow-lg transition-all duration-150 hover:scale-110 hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-emerald-500"
          >
            ✓
          </button>
        </div>
      )}

      {remaining > 0 && isAllowedToVote && (
        <p className="mt-3 text-xs text-gray-400">
          Swipe the card, tap the buttons, or use ← / → keys
        </p>
      )}

      {/* "Add a comment" pill - appears briefly after each vote */}
      {prompt && !commentBet && (
        <div className="pill-slide-up fixed bottom-24 left-1/2 z-40 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-2xl ring-1 ring-gray-200">
          <span className="max-w-56 truncate text-gray-700">
            Voted on “{prompt.title}” — add a comment?
          </span>
          <button
            type="button"
            onClick={() => {
              setCommentBet({ id: prompt.id, locked: prompt.locked });
              setPrompt(null);
            }}
            className="cursor-pointer whitespace-nowrap rounded-full bg-gray-800 px-3 py-1.5 font-medium text-white transition-colors hover:bg-gray-600"
          >
            ✏️ Comment
          </button>
          <button
            type="button"
            onClick={() => setPrompt(null)}
            aria-label="Dismiss"
            className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {commentBet && (
        <CommentModal
          betId={commentBet.id}
          initialComment={null}
          locked={commentBet.locked}
          onClose={() => setCommentBet(null)}
          onSubmit={async (formData) => {
            await onUpdateComment(formData);
            setCommentBet(null);
          }}
        />
      )}

      {video && (
        <VideoModal
          videoUrl={video.url}
          betTitle={video.title}
          onClose={() => setVideo(null)}
        />
      )}
    </div>
  );
}