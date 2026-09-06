"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov (iPhone)
  "video/webm",
  "video/x-m4v",
  "video/avi",
];

const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

async function getCurrentUserId(): Promise<number | null> {
  const session = await getSession();
  if (!session) return null;
  return typeof session.userId === "string"
    ? parseInt(session.userId)
    : session.userId;
}

export async function onYesAnswer(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("You must be logged in to vote");

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

export async function onNoAnswer(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("You must be logged in to vote");

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

export async function onAppendVideo(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const betId = Number(formData.get("betId"));
  const file = formData.get("file") as File;

  if (!betId || !file) throw new Error("Invalid input");

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      season: true,
      owners: {
        include: {
          agent_rel: {
            include: {
              user_relation: true,
            },
          },
        },
      },
    },
  });

  if (!bet) throw new Error("Bet not found");

  if (bet.season.locked) {
    throw new Error("Season is locked");
  }

  if (bet.videoUrl) {
    throw new Error("Video already exists");
  }

  const isOwner = bet.owners.some(
    (o) => o.agent_rel.user_relation.id === userId
  );

  if (!isOwner) {
    throw new Error("Not bet owner");
  }

  let videoUrl: string | null = null;

  if (file) {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        success: false,
        message: `Invalid video format. Allowed formats: MP4, MOV, WebM, M4V, AVI`,
      };
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        message: `Video size exceeds the maximum limit of ${
          MAX_VIDEO_SIZE / 1024 / 1024
        }MB`,
      };
    }

    try {
      const blob = await put(`bets/${Date.now()}-${file.name}`, file, {
        access: "public",
        contentType: file.type,
      });
      videoUrl = blob.url;
    } catch (uploadError) {
      console.error("Error uploading video:", uploadError);
      return {
        success: false,
        message: "Failed to upload video",
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Unknown error",
      };
    }
  }

  await prisma.bet.update({
    where: {
      id: bet.id,
    },
    data: {
      videoUrl: videoUrl,
    },
  });

  revalidatePath("/bets");

  return {
    success: true,
    message: "Video uploaded",
    error: undefined,
  };
}

export async function onUpdateComment(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("You must be logged in to comment");

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

export async function onDeleteBet(id: number) {
  await prisma.bet_Agent.deleteMany({ where: { bet: id } });
  await prisma.bet_Owner.deleteMany({ where: { bet: id } });
  await prisma.answer.deleteMany({ where: { bet: id } });
  await prisma.bet.delete({ where: { id } });

  revalidatePath("/bets");
}