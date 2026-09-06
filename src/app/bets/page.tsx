import prisma from "@/lib/prisma";
import { BetGrid } from "@/components/BetGrid";
import { BetSwipeView } from "@/components/BetSwipeView";
import { SeasonSwitcher } from "@/components/SeasonSwitcher";
import { BetViewToggle } from "@/components/BetViewToggle";
import { getSession, isAdmin } from "@/lib/auth";
import {
  onYesAnswer,
  onNoAnswer,
  onAppendVideo,
  onUpdateComment,
  onDeleteBet,
} from "./actions";

export default async function BetsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; view?: string }>;
}) {
  const session = await getSession();
  const admin = await isAdmin();

  const userId = session
    ? typeof session.userId === "string"
      ? parseInt(session.userId)
      : session.userId
    : null;

  const { season, view: rawView } = await searchParams;

  const year = season ? parseInt(season, 10) : new Date().getFullYear();
  const view = rawView === "cards" ? "cards" : "grid";

  /* -------------------- Voting permission -------------------- */
  const isAllowedToVote = !!(
    userId &&
    (await prisma.bet_Owner.findFirst({
      where: {
        agent_rel: {
          user: userId,
        },
        bet_rel: {
          season: {
            year,
            locked: false,
          },
        },
      },
    }))
  );

  /* -------------------- Data fetching -------------------- */

  const bets = await prisma.bet.findMany({
    where: {
      season: { year },
    },
    include: {
      owners: {
        include: {
          agent_rel: {
            include: {
              user_relation: {
                select: { id: true, username: true },
              },
            },
          },
        },
      },
      answers: {
        include: {
          user_relation: {
            select: { id: true, username: true },
          },
        },
      },
      season: {
        select: { locked: true },
      },
    },
  });

  const userAnswers = new Map<number, boolean | null>();
  const userComments = new Map<number, string | null>();

  if (userId) {
    bets.forEach((bet) => {
      const answer = bet.answers.find((a) => a.user === userId);
      userAnswers.set(bet.id, answer ? answer.success : null);
      userComments.set(bet.id, answer?.comment || null);
    });
  }

  // Cards view only shows bets the user has neither voted on nor commented on.
  const pendingBets = bets.filter((bet) => userAnswers.get(bet.id) === null);

  const seasons = await prisma.season.findMany({
    orderBy: { year: "desc" },
  });

  return (
    <div className="w-full px-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Potential recipients of the dummstruts
      </h1>
      <h4 className="text-lg font-medium text-gray-500">
        You can only vote if you have created a bet in the current season and
        are logged in
      </h4>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SeasonSwitcher
          seasonVals={seasons}
          selectedYear={year}
          className="w-44"
        />
        <BetViewToggle />
      </div>

      {view === "cards" ? (
        <BetSwipeView
          key={year}
          bets={pendingBets}
          admin={admin}
          userId={userId}
          isAllowedToVote={isAllowedToVote}
          selectedYear={year}
          onYesAnswer={onYesAnswer}
          onNoAnswer={onNoAnswer}
          onUpdateComment={onUpdateComment}
          onDeleteBet={onDeleteBet}
          onAppendVideo={onAppendVideo}
        />
      ) : (
        <BetGrid
          admin={admin}
          bets={bets}
          userId={userId}
          isAllowedToVote={isAllowedToVote}
          userAnswers={userAnswers}
          userComments={userComments}
          onYesAnswer={onYesAnswer}
          onNoAnswer={onNoAnswer}
          onUpdateComment={onUpdateComment}
          onDeleteBet={onDeleteBet}
          onAppendVideo={onAppendVideo}
        />
      )}
    </div>
  );
}