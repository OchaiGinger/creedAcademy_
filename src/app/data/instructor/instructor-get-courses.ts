import prisma from "@/lib/prisma";
import { requireInstructor } from "./require-admin";

export async function instructorGetCourses() {
  await requireInstructor();

  const data = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },

    select: {
      id: true,
      title: true,
      description: true,
      smallDescription: true,
      duration: true,
      fileKey: true,
      level: true,
      price: true,
      status: true,
      slug: true,
      instructorId: true,
    },
  });
  return data;
}

export type InstructorGetCoursesReturnType = Awaited<
  ReturnType<typeof instructorGetCourses>
>[0];
