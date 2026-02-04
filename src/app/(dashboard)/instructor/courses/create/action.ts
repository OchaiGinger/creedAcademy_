"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchema";
import { headers } from "next/headers";

export async function CreateCourse(
  values: CourseSchemaType,
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return { status: "error", message: "Unauthorized" };

    // 1. Find OR Create the Instructor record
    // This ensures that the very first time you submit, it registers you as an instructor
    const instructor = await prisma.instructor.upsert({
      where: { userId: session.user.id },
      update: {},
      create: {
        userId: session.user.id,
        email: session.user.email, // ✅ REQUIRED
        bio: "New Instructor",
      },
    });

    const validation = courseSchema.safeParse(values);
    if (!validation.success) {
      return { status: "error", message: "Invalid Form Data" };
    }

    // 2. Create the course using the INSTRUCTOR'S ID
    await prisma.course.create({
      data: {
        ...validation.data,
        instructorId: instructor.id, // This is now guaranteed to exist
      },
    });

    return {
      status: "success",
      message: "Course Created Successfully",
    };
  } catch (error) {
    console.error("DEBUG:", error);
    return {
      status: "error",
      message: "Failed to create course. Ensure enums are UPPERCASE.",
    };
  }
}
