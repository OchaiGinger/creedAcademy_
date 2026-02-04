"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function inviteInstructor(email: string) {
  // 1. Security: Check if requester is ADMIN
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    // 2. Create the invitation in the database
    await prisma.instructor.create({
      data: {
        email: email,
        // userId is left NULL intentionally
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Email already exists or invalid" };
  }
}
