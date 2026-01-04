"use client";

import React from "react";

type CommentModalProps = {
  betId: number;
  initialComment: string | null;
  locked: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
};

export function CommentModal({
  betId,
  initialComment,
  locked,
  onClose,
  onSubmit,
}: CommentModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-xl sm:rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Comment</h2>

        {locked ? (
          <p className="text-gray-600 italic">
            Comments have been locked.
          </p>
        ) : (
          <form action={onSubmit} className="flex flex-col gap-4 h-full">
            <input type="hidden" name="betId" value={betId} />

            <textarea
              name="comment"
              defaultValue={initialComment ?? ""}
              className="w-full h-48 border rounded-md p-2 resize-none"
              placeholder="Write your comment…"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
