import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = parseInt(id, 10);

  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid user id" },
      { status: 400 }
    );
  }

  await prisma.agent.deleteMany({
    where: { user: userId },
  });

  await prisma.answer.deleteMany({
    where: { user: userId },
  });

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ success: true });
}
