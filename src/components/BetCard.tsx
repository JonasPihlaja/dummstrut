"use client";

import { Answer } from "@prisma/client";
import { BetCardProps } from "@/types/bet";
import { useState } from "react";

function betCountRatio(answers = []) {
  let successCount = 0;
  let failCount = 0;

  answers.forEach((ans: Answer) => (ans.success ? successCount++ : failCount++));

  return { successCount, failCount };
}

export function BetCard({
  admin,
  bet,
  onYesAnswer,
  onNoAnswer,
  onUpdateComment,
  onDeleteBet,
  userId,
  userAnswer,
  userComment,
}: BetCardProps) {
  const { successCount, failCount } = betCountRatio(bet.answers);
  const total = successCount + failCount;

  const yesPercent = total > 0 ? (successCount / total) * 100 : 0;
  const noPercent = total > 0 ? (failCount / total) * 100 : 0;

  const isLoggedIn = userId !== null;
  const answeredYes = userAnswer === true;
  const answeredNo = userAnswer === false;
  const hasAnswered = userAnswer !== null;
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState(userComment || "");

  async function handleCommentSubmit(formData: FormData) {
    await onUpdateComment(formData);
    setShowCommentPopup(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this bet?")) {
      return;
    }
    await onDeleteBet(id);
  }

  return (
    <div
      className="
        p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 w-full 
        shadow-md hover:shadow-xl 
        transition-all duration-400 ease-out 
        transform hover:-translate-y-1
        flex flex-col
      "
    >
      <div className="flex justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 wrap-break-word">
          {bet.bet}
        </h2>
        {admin && (
          <span className="cursor-pointer" onClick={() => handleDelete(bet.id)}>
            ❌
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-gray-500 mt-1 wrap-break-word">
        {bet.description}
      </p>

      <div className="mt-auto pt-3 sm:pt-4 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="text-xs text-gray-700 px-2 py-1 rounded-full">
            By:
          </span>
          
          { 
            bet.owners.map((owner: any) => (
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
            onClick={() => {
              setCommentText(userComment || "");
              setShowCommentPopup(true);
            }}
            className="p-2 sm:p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title={userComment ? "Edit comment" : "Add comment"}
          >
            <svg
              className="w-5 h-5 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="w-full flex items-center gap-2 sm:gap-3 mt-3">
        <form action={onYesAnswer} className="shrink-0">
          <input type="hidden" name="betId" value={bet.id} />
          <button
            type="submit"
            disabled={!isLoggedIn}
            className={`
              font-semibold text-white py-2.5 px-3 sm:py-2 sm:px-4 rounded-lg transition-all duration-200
              touch-manipulation min-w-[60px] sm:min-w-0
              ${
                !isLoggedIn
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : answeredYes
                  ? "bg-green-600 active:bg-green-700 sm:hover:bg-green-700 shadow-lg shadow-green-500/50 border-2 border-green-400 scale-105"
                  : "bg-emerald-500 active:bg-green-500 sm:hover:bg-green-500 cursor-pointer sm:hover:shadow-md"
              }
            `}
          >
            {answeredYes && <span className="mr-1 sm:mr-1.5">✓</span>}
            Yes
          </button>
        </form>

        <div className="grow h-3 sm:h-3 bg-gray-200 rounded-full overflow-hidden relative min-w-0">
          {total === 0 ? (
            <div className="h-full w-full bg-gray-300" />
          ) : (
            <>
              <div
                className={`h-full bg-emerald-500 absolute left-0 top-0 transition-all ${
                  answeredYes
                    ? "shadow-lg shadow-green-500/50 border-2 border-green-400 border-y-0"
                    : ""
                }`}
                style={{ width: `${yesPercent}%` }}
              />
              <div
                className={`h-full bg-rose-500 absolute right-0 top-0 transition-all ${
                  answeredNo
                    ? "shadow-lg shadow-red-500/50 border-2 border-red-400 border-y-0"
                    : ""
                }`}
                style={{ width: `${noPercent}%` }}
              />
            </>
          )}
        </div>

        <form action={onNoAnswer} className="shrink-0">
          <input type="hidden" name="betId" value={bet.id} />
          <button
            type="submit"
            disabled={!isLoggedIn}
            className={`
              font-semibold text-white py-2.5 px-3 sm:py-2 sm:px-4 rounded-lg transition-all duration-200
              touch-manipulation min-w-[60px] sm:min-w-0
              ${
                !isLoggedIn
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : answeredNo
                  ? "bg-red-600 active:bg-red-700 sm:hover:bg-red-700 shadow-lg shadow-red-500/50 border-2 border-red-400 scale-105"
                  : "bg-rose-400 active:bg-red-500 sm:hover:bg-red-500 cursor-pointer sm:hover:shadow-md"
              }
            `}
          >
            {answeredNo && <span className="mr-1 sm:mr-1.5">✓</span>}
            No
          </button>
        </form>
      </div>

      {/* Display existing comment below buttons */}
      {hasAnswered && userComment && (
        <div className="mt-3 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-2.5 rounded border border-gray-200 wrap-break-word">
          <span className="font-medium text-gray-700"></span>
          {userComment}
        </div>
      )}

      {/* Comment modal popup */}
      {showCommentPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => {
            setShowCommentPopup(false);
            setCommentText(userComment || "");
          }}
        >
          <div
            className="bg-white rounded-xl sm:rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {userComment ? "Edit Comment" : "Add Comment"}
              </h3>
              <button
                onClick={() => {
                  setShowCommentPopup(false);
                  setCommentText(userComment || "");
                }}
                className="text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors touch-manipulation p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              action={handleCommentSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <input type="hidden" name="betId" value={bet.id} />
              <textarea
                name="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 text-sm sm:text-base"
                rows={4}
                autoFocus
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentPopup(false);
                    setCommentText(userComment || "");
                  }}
                  className="px-4 sm:px-5 py-2.5 text-gray-700 bg-gray-100 active:bg-gray-200 sm:hover:bg-gray-200 rounded-lg transition-colors font-medium touch-manipulation min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 bg-blue-600 active:bg-blue-700 sm:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md sm:hover:shadow-lg touch-manipulation min-h-[44px]"
                >
                  {userComment ? "Update" : "Add"} Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
