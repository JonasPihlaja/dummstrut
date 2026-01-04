import prisma from "@/lib/prisma";
import { BetGrid } from "@/components/BetGrid";
import { getSession, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function BetsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const session = await getSession();
  const admin = await isAdmin();

  const userId = session
    ? typeof session.userId === "string"
      ? parseInt(session.userId)
      : session.userId
    : null;

  const { season } = await searchParams;

  const year = season ? parseInt(season, 10) : new Date().getFullYear();

  /* -------------------- Voting permission (CORRECT) -------------------- */
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

  /* -------------------- Server actions -------------------- */

  async function onYesAnswer(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session) throw new Error("You must be logged in to vote");

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;

    const betId = Number(formData.get("betId"));
    if (!betId) throw new Error("Invalid bet ID");

    const existing = await prisma.answer.findFirst({
      where: { user: userId, bet: betId },
    });

    if (existing) {
      await prisma.answer.update({
        where: { id: existing.id },
        data: { success: true },
      });
    } else {
      await prisma.answer.create({
        data: { user: userId, bet: betId, success: true },
      });
    }

    revalidatePath("/bets");
  }

  async function onNoAnswer(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session) throw new Error("You must be logged in to vote");

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;

    const betId = Number(formData.get("betId"));
    if (!betId) throw new Error("Invalid bet ID");

    const existing = await prisma.answer.findFirst({
      where: { user: userId, bet: betId },
    });

    if (existing) {
      await prisma.answer.update({
        where: { id: existing.id },
        data: { success: false },
      });
    } else {
      await prisma.answer.create({
        data: { user: userId, bet: betId, success: false },
      });
    }

    revalidatePath("/bets");
  }

  async function onUpdateComment(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session) throw new Error("You must be logged in to comment");

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;

    const betId = Number(formData.get("betId"));
    const comment = formData.get("comment")?.toString() || null;

    if (!betId) throw new Error("Invalid bet ID");

    const answer = await prisma.answer.findFirst({
      where: { user: userId, bet: betId },
      include: { bet_relation: { include: { season: true } } },
    });

    if (!answer) {
      throw new Error("You must answer the bet before commenting");
    }

    if (answer.bet_relation.season.locked) {
      throw new Error("Comments are locked for this season");
    }

    await prisma.answer.update({
      where: { id: answer.id },
      data: { comment },
    });

    revalidatePath("/bets");
  }

  async function onDeleteBet(id: number) {
    "use server";

    await prisma.bet_Agent.deleteMany({ where: { bet: id } });
    await prisma.bet_Owner.deleteMany({ where: { bet: id } });
    await prisma.answer.deleteMany({ where: { bet: id } });
    await prisma.bet.delete({ where: { id } });

    revalidatePath("/bets");
  }

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

      <BetGrid
        admin={admin}
        bets={bets}
        onYesAnswer={onYesAnswer}
        onNoAnswer={onNoAnswer}
        onUpdateComment={onUpdateComment}
        onDeleteBet={onDeleteBet}
        isAllowedToVote={isAllowedToVote}
        userAnswers={userAnswers}
        userComments={userComments}
        seasonVals={seasons}
        selectedYear={year}
      />
    </div>
  );
}
