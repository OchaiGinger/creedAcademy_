"use server";

import { requireInstructor } from "@/app/data/instructor/require-admin";
import { Chapter } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import {
  chapterSchema,
  ChapterSchemaType,
  courseSchema,
  CourseSchemaType,
  LessonSchema,
  LessonSchemaType,
} from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function editCourse(
  data: CourseSchemaType,
  courseId: string,
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return { status: "error", message: "Unauthorized" };

    // 1. Get the Instructor record ID tied to this User
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor) {
      return { status: "error", message: "Instructor record not found" };
    }

    const result = courseSchema.safeParse(data);
    if (!result.success) {
      return { status: "error", message: "Invalid data" };
    }

    // 2. Update using the correct instructor.id (not user.id)
    await prisma.course.update({
      where: {
        id: courseId,
        instructorId: instructor.id, // Use the UUID from the Instructor model
      },
      data: {
        ...result.data,
      },
    });

    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch (error) {
    console.error("EDIT_COURSE_ERROR:", error); // Log this to see actual DB errors
    return {
      status: "error",
      message: "Failed to update course [EDITCOURSEACTION]",
    };
  }
}

export async function reorderLesson(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string,
): Promise<ApiResponse> {
  await requireInstructor();
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "No lessons provided for reordering",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId,
        },
        data: {
          position: lesson.position,
        },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Reordering successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to reorder lesons [REORDERLESSON]",
    };
  }
}

export async function reorderChapter(
  courseId: string,
  chapters: { id: string; position: number }[],
): Promise<ApiResponse> {
  await requireInstructor();
  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "No chapters provided for reordering",
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId,
        },
        data: {
          position: chapter.position,
        },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Chapters reordered successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to reorder chapters [REORDERCHAPTER]",
    };
  }
}

export async function createChapter(
  values: ChapterSchemaType,
): Promise<ApiResponse> {
  await requireInstructor();
  try {
    const result = chapterSchema.safeParse(values);
    if (!result.success) {
      return { status: "error", message: "Invalid data" };
    }

    await prisma.$transaction(async (tx) => {
      const maxPositionChapter = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: { position: true },
        orderBy: {
          position: "desc",
        },
      });
      await prisma.chapter.create({
        data: {
          title: result.data.title,
          courseId: result.data.courseId,
          position: maxPositionChapter ? maxPositionChapter.position + 1 : 0,
        },
      });
    });
    revalidatePath(`/instructor/courses/${result.data.courseId}/edit`);
    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to create chapter [CREATECHAPTER]",
    };
  }
}

export async function createLesson(
  values: LessonSchemaType,
): Promise<ApiResponse> {
  await requireInstructor();
  try {
    const result = LessonSchema.safeParse(values);
    if (!result.success) {
      return { status: "error", message: "Invalid data" };
    }

    await prisma.$transaction(async (tx) => {
      const maxPositionChapter = await tx.lesson.findFirst({
        where: {
          chapterId: result.data.chapterId,
        },
        select: { position: true },
        orderBy: {
          position: "desc",
        },
      });
      await prisma.lesson.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          videoKey: result.data.videoFileKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          position: maxPositionChapter ? maxPositionChapter.position + 1 : 0,
        },
      });
    });
    revalidatePath(`/instructor/courses/${result.data.courseId}/edit`);
    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to create lesson [CREATELESSON]",
    };
  }
}

export async function deleteLesson(
  lessonId: string, // Keep this order to match standard "Target, Parent, Grandparent"
  courseId: string,
  chapterId: string,
) {
  await requireInstructor();
  try {
    const chapterWithLesson = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        lessons: {
          orderBy: { position: "asc" },
          select: { id: true },
        },
      },
    });

    if (!chapterWithLesson)
      return { status: "error", message: "Chapter not found" };

    // FIX: Check if index is -1 (not found) instead of !lessonToDelete
    const lessonIndex = chapterWithLesson.lessons.findIndex(
      (l) => l.id === lessonId,
    );
    if (lessonIndex === -1) {
      return { status: "error", message: "Lesson not found in chapter" };
    }

    const remainingLessons = chapterWithLesson.lessons.filter(
      (l) => l.id !== lessonId,
    );

    const updates = remainingLessons.map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { position: index + 1 },
      }),
    );

    await prisma.$transaction([
      prisma.lesson.delete({
        where: { id: lessonId, chapterId: chapterId },
      }),
      ...updates,
    ]);

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { status: "success", message: "Lesson deleted successfully" };
  } catch (error) {
    console.error(error); // Always log the error for debugging!
    return { status: "error", message: "Failed to delete lesson" };
  }
}

export async function deleteChapter(courseId: string, chapterId: string) {
  await requireInstructor();
  try {
    const courseWithChapter = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        chapters: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapter)
      return { status: "error", message: "Chapter not found in course" };

    const chapters = courseWithChapter.chapters[0]; // Assuming only one chapter is being deleted

    // FIX: Check if index is -1 (not found) instead of !lessonToDelete
    const chapterTodelete = courseWithChapter.chapters.findIndex(
      (c) => c.id === chapterId,
    );
    if (chapterTodelete === -1) {
      return { status: "error", message: "Chapter not found in course" };
    }

    const remainingChapters = courseWithChapter.chapters.filter(
      (c) => c.id !== chapterId,
    );

    const updates = remainingChapters.map((chapter, index) =>
      prisma.chapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 },
      }),
    );

    await prisma.$transaction([
      prisma.chapter.delete({
        where: { id: chapterId },
      }),
      ...updates,
    ]);

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { status: "success", message: "Chapter deleted successfully" };
  } catch (error) {
    console.error(error); // Always log the error for debugging!
    return { status: "error", message: "Failed to delete chapter" };
  }
}
