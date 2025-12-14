import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  
  if (!session || !session.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const bets = await prisma.bet.findMany({
    include: {
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

