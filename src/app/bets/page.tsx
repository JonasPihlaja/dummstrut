import prisma from "@/lib/prisma";
import { BetGrid } from "@/components/BetGrid";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

export default async function BetsPage() {
  const session = await getSession();
  const admin = await isAdmin();
  let isAllowedToVote = false;
  const userId = session
    ? typeof session.userId === "string"
      ? parseInt(session.userId)
      : session.userId
    : null;

  async function onYesAnswer(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) {
      throw new Error("You must be logged in to vote");
    }

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;
    const betId = parseInt(formData.get("betId")?.toString() || "0");

    if (!betId) {
      throw new Error("Invalid bet ID");
    }

    // Find existing answer for this user and bet
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        user: userId,
        bet: betId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: { success: true },
      });
    } else {
      // Create new answer
      await prisma.answer.create({
        data: {
          user: userId,
          bet: betId,
          success: true,
        },
      });
    }

    revalidatePath("/bets");
  }

  async function onNoAnswer(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) {
      throw new Error("You must be logged in to vote");
    }

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;
    const betId = parseInt(formData.get("betId")?.toString() || "0");

    if (!betId) {
      throw new Error("Invalid bet ID");
    }

    // Find existing answer for this user and bet
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        user: userId,
        bet: betId,
      },
    });

    if (existingAnswer) {
      // Update existing answer
      await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: { success: false },
      });
    } else {
      // Create new answer
      await prisma.answer.create({
        data: {
          user: userId,
          bet: betId,
          success: false,
        },
      });
    }

    revalidatePath("/bets");
  }

  const bets = await prisma.bet.findMany({
    include: {
      owners: {
        include: {
          agent_rel: {
            include: {
              user_relation: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      },
      answers: {
        include: {
          user_relation: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  // Create a map of betId -> user's answer (true for yes, false for no, null if no answer)
  const userAnswers = new Map<number, boolean | null>();
  const userComments = new Map<number, string | null>();
  if (userId) {
    // Also check if the logged in user is allowed to vote, meaning if he has made a bet
    bets.forEach((bet) => {
      const userAnswer = bet.answers.find((answer) => answer.user === userId);
      userAnswers.set(bet.id, userAnswer ? userAnswer.success : null);
      userComments.set(bet.id, userAnswer?.comment || null);
      if(isAllowedToVote === false) {
        isAllowedToVote = bet.owners.some(owner => owner.id === userId);
      }
    });
  }

  async function onUpdateComment(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session) {
      throw new Error("You must be logged in to add a comment");
    }

    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;
    const betId = parseInt(formData.get("betId")?.toString() || "0");
    const comment = formData.get("comment")?.toString() || null;

    if (!betId) {
      throw new Error("Invalid bet ID");
    }

    // Find existing answer for this user and bet
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        user: userId,
        bet: betId,
      },
    });

    if (existingAnswer) {
      // Update existing answer's comment
      await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: { comment: comment || null },
      });
    } else {
      // User must have answered first before adding a comment
      throw new Error("You must answer the bet before adding a comment");
    }

    revalidatePath("/bets");
  }

  async function onDeleteBet(id: number) {
    "use server";
    await prisma.bet_Agent.deleteMany({
      where: {
        bet: id,
      },
    });
    await prisma.bet_Owner.deleteMany({
      where: {
        bet: id,
      },
    });
    await prisma.bet.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/bets");
  }

  return (
    <div className="w-full px-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Potentiella mottagare av en dummstrut
      </h1>
      <h4 className="text-lg font-medium text-gray-500">Man kan endast rösta på bets om man har ett eget dummstruts bet och är inloggad</h4>
      <div className="">
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
      />
      </div>
    </div>
  );
}
