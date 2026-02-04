import "server-only";
import { requireInstructor } from "./require-admin";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function InstructorGetCourse(id: string) {
  await requireInstructor();

  const data = await prisma.course.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      smallDescription: true,
      duration: true,
      fileKey: true,
      price: true,
      instructorId: true,
      status: true,
      slug: true,
      level: true,
      chapters: {
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
              thumbnailKey: true,
              videoKey: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }
  return data;
}

export type InstructorCourseType = Awaited<
  ReturnType<typeof InstructorGetCourse>
>;
