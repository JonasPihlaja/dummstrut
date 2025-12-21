import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


export async function GET() {
  const users = await prisma.user.findMany({
    where: { admin: false },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      admin: false,
      agents: {
        create: {}, // 👈 automatically create Agent row
      },
    },
  });

  return NextResponse.json({ id: user.id, username: user.username });
}
