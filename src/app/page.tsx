import prisma from "@/lib/prisma";
import BetCreator from "@/components/BetCreator";
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

export default async function Home() {
  const agents = await prisma.agent.findMany({
    where: {
      user_relation: {
        admin: false,
      },
    },
    include: {
      user_relation: {
        select: {
          username: true,
          id: true,
        },
      },
    },
  });
  const seasons = await prisma.season.findMany({
    where: {
      locked: false,
    },
  });
  let loggedInAgent;
  const session = await getSession();
  if (session?.userId) {
    loggedInAgent = agents.find((agent) => agent.user === session.userId)?.id;
  }
  return (
    <div className="min-h-9/12 w-full flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
      <div
        className="
        w-full
        max-w-md
        sm:max-w-xl
        lg:max-w-3xl
        border border-gray-200
        rounded-2xl
        shadow-lg
        transition-shadow duration-300
        bg-white
        p-4
        sm:p-6
        lg:p-8
      "
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Skapa dummstruts bet
        </h1>
        <BetCreator
          seasonVals={seasons}
          agentVals={agents}
          onSubmitBet={onSubmitBet}
          userAgentId={loggedInAgent}
        />
      </div>
    </div>
  );
}

interface payload {
  title: string;
  description: string;
  agentIds: number[];
  season: number;
  video?: File | null | undefined;
}

interface ActionResult {
  success: boolean;
  message: string;
  error?: string;
}

async function onSubmitBet(data: payload): Promise<ActionResult> {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "You must be logged in to submit a bet",
      };
    }
    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : session.userId;
    if (!userId) {
      return { success: false, message: "Invalid user ID" };
    }
    const userAgent = await prisma.agent.findFirstOrThrow({
      where: {
        user: userId,
      },
    });

    const { title, description, agentIds, season, video } = data;

    let videoUrl: string | null = null;

    // Validate and upload video if provided
    if (video) {
      // Check file type
      if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
        return {
          success: false,
          message: `Invalid video format. Allowed formats: MP4, MOV, WebM, M4V, AVI`,
        };
      }

      // Check file size
      if (video.size > MAX_VIDEO_SIZE) {
        return {
          success: false,
          message: `Video size exceeds the maximum limit of ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
        };
      }

      // Upload to Vercel Blob
      try {
        const blob = await put(
          `bets/${Date.now()}-${video.name}`,
          video,
          {
            access: "public",
            contentType: video.type,
          }
        );
        videoUrl = blob.url;
      } catch (uploadError) {
        console.error("Error uploading video:", uploadError);
        return {
          success: false,
          message: "Failed to upload video",
          error: uploadError instanceof Error ? uploadError.message : "Unknown error",
        };
      }
    }

    await prisma.bet.create({
      data: {
        season: {
          connect: {
            id: season,
          },
        },
        bet: title,
        description,
        videoUrl: videoUrl,
        owners: {
          create: [
            {
              agent: userAgent.id,
            },
          ],
        },
        agents: {
          create: agentIds.map((agentId) => ({
            agent: agentId,
          })),
        },
      },
    });
    revalidatePath("/bets");
    return { success: true, message: "Bet created successfully!" };
  } catch (error) {
    console.error("Error creating bet:", error);
    return {
      success: false,
      message: "Failed to create bet",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}