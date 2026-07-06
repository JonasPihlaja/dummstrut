import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session || !session.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const seasonIdParam = searchParams.get("seasonId");

  if (!seasonIdParam) {
    return NextResponse.json(
      { error: "seasonId is required" },
      { status: 400 }
    );
  }

  const seasonId = parseInt(seasonIdParam, 10);
  if (Number.isNaN(seasonId)) {
    return NextResponse.json(
      { error: "seasonId must be a valid number" },
      { status: 400 }
    );
  }

  const bets = await prisma.bet.findMany({
    where: { seasonId },
    include: {
      answers: {
        where: {
          bet_relation: {
            seasonId,
          },
        },
        include: {
          user_relation: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      owners: {
        include: {
          agent_rel: {
            include: {
              user_relation: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      },
      results: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json(bets);
}

