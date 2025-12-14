"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret"
);
const COOKIE_NAME = "session";

// Get current session
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as { userId: number | string; username: string; admin?: boolean };
  } catch {
    return null;
  }
}

// Set session after login
async function setSession(userId: number, username: string, admin: boolean = false) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const token = await new SignJWT({ userId, username, admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

// Clear session on logout
export async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  redirect("/");
}

// Check if user is admin
export async function isAdmin() {
  const session = await getSession();
  return session?.admin === true;
}

// Login action
export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    throw new Error("Missing credentials");
  }

  const user = await prisma.user.findFirst({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  await setSession(user.id, user.username, user.admin || false);
  return { id: user.id, username: user.username, admin: user.admin || false };
}
