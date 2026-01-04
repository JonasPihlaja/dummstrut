"use client";

import { Answer } from "@prisma/client";
import { BetCardProps } from "@/types/bet";

function betCountRatio(answers: Answer[] = []) {
  let successCount = 0;
  let failCount = 0;

  answers.forEach((ans) =>
    ans.success ? successCount++ : failCount++
  );

  return { successCount, failCount };
}

export function BetCard({
  admin,
  bet,
  onYesAnswer,
  onNoAnswer,
  onDeleteBet,
  isAllowedToVote,
  userAnswer,
  userComment,
  onOpenComment,
}: BetCardProps & { onOpenComment: () => void }) {
  const { successCount, failCount } = betCountRatio(bet.answers);
  const total = successCount + failCount;

  const yesPercent = total ? (successCount / total) * 100 : 0;
  const noPercent = total ? (failCount / total) * 100 : 0;

  const answeredYes = userAnswer === true;
  const answeredNo = userAnswer === false;
  const hasAnswered = userAnswer !== null;

  const commentLocked = bet.season.locked;

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this bet?")) return;
    await onDeleteBet(bet.id);
  }

  return (
    <div
      className="
        p-4 bg-white rounded-2xl border border-gray-200
        shadow-md hover:shadow-xl
        transition-all duration-300 ease-out
        transform hover:-translate-y-1
        flex flex-col min-h-[200px]
      "
    >
      {/* Header */}
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold break-words">{bet.bet}</h2>
        {admin && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            ❌
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-1 break-words max-h-10">
        {bet.description}
      </p>

      {/* Owners + comment */}
      <div className="mt-auto pt-4 flex justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {bet.owners.map((owner: any) => (
            <span
              key={owner.id}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {owner.agent_rel?.user_relation?.username}
            </span>
          ))}
        </div>

        {hasAnswered && (
          <button
            onClick={onOpenComment}
            disabled={commentLocked}
            title={
              commentLocked
                ? "Comments are locked for this season"
                : userComment
                ? "Edit comment"
                : "Add comment"
            }
            className={`
              p-2 rounded transition-all duration-200
              ${
                commentLocked
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Voting */}
      <div className="flex items-center gap-3 mt-3">
        <form action={onYesAnswer}>
          <input type="hidden" name="betId" value={bet.id} />
          <button
            type="submit"
            disabled={!isAllowedToVote}
            className={`
              px-4 py-2 rounded-lg font-semibold text-white
              transition-all duration-200
              ${
                !isAllowedToVote
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : answeredYes
                  ? "bg-emerald-400 scale-105 shadow-lg shadow-green-500/40"
                  : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-md"
              }
            `}
          >
            {answeredYes && <span className="mr-1">✓</span>}
            Yes
          </button>
        </form>

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className={`
              absolute left-0 top-0 h-full bg-emerald-500
              transition-all duration-500
              ${
                answeredYes
                  ? "shadow-lg shadow-green-500/40"
                  : ""
              }
            `}
            style={{ width: `${yesPercent}%` }}
          />
          <div
            className={`
              absolute right-0 top-0 h-full bg-rose-500
              transition-all duration-500
              ${
                answeredNo
                  ? "shadow-lg shadow-red-500/40"
                  : ""
              }
            `}
            style={{ width: `${noPercent}%` }}
          />
        </div>

        <form action={onNoAnswer}>
          <input type="hidden" name="betId" value={bet.id} />
          <button
            type="submit"
            disabled={!isAllowedToVote}
            className={`
              px-4 py-2 rounded-lg font-semibold text-white
              transition-all duration-200
              ${
                !isAllowedToVote
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : answeredNo
                  ? "bg-red-600 scale-105 shadow-lg shadow-red-500/40"
                  : "bg-rose-400 hover:bg-rose-500 hover:shadow-md"
              }
            `}
          >
            {answeredNo && <span className="mr-1">✓</span>}
            No
          </button>
        </form>
      </div>

      {/* Comment preview */}
      {hasAnswered && userComment && (
        <div className="mt-3 text-sm bg-gray-50 p-2 rounded border border-gray-200 animate-in fade-in duration-200">
          {userComment}
        </div>
      )}
    </div>
  );
}
