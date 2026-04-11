"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, destroySession, hashPassword } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  const user = result[0];
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing.length > 0) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hashPassword(password);

  const result = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
    })
    .returning();

  const user = result[0];
  if (user) {
    await createSession(user.id);
    redirect("/");
  }

  return { error: "Something went wrong" };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}