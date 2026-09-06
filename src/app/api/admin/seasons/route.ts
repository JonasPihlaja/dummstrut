import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session || !session.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const seasons = await prisma.season.findMany({
    orderBy: { year: "desc" },
  });

  return NextResponse.json(seasons);
}
