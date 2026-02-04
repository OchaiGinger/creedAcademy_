"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { InstructorCourseType } from "@/app/data/instructor/instructor-get-course";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  File,
  FileText,
  GripVerticalIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ta } from "date-fns/locale";
import { toast } from "sonner";
import { reorderChapter, reorderLesson } from "../action";
import { useEditorState } from "@tiptap/react";
import NewChapterModal from "./new-chaptermodal";
import NewLessonModal from "./new-lessonmodal";
import { DeleteLesson } from "./delete-lesson";
import { DeleteChapter } from "./delete-chapter";

interface iAppProps {
  data: InstructorCourseType;
}

interface SortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => React.ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string;
  };
}

export const EditCourseStructure = ({ data }: iAppProps) => {
  const initialItems =
    data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
      })),
    })) || [];

  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems((previousItems) => {
      const updatedChapters =
        data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen:
            previousItems.find((item) => item.id === chapter.id)?.isOpen ??
            true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
          })),
        })) || [];
      return updatedChapters;
    });
  }, [data]);

  function SortableItem({ children, id, className, data }: SortableItemProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn("touch-none", className, isDragging ? "z-10" : "")}
      >
        {children(listeners)}
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // If we don't have the data we need, exit
    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData || !overData) return;

    const activeType = activeData.type as "chapter" | "lesson";
    const overType = overData.type as "chapter" | "lesson";

    const activeChapterId = activeData.chapterId;
    const overChapterId = overData.chapterId;

    const courseId = data.id;
    if (activeType === "chapter") {
      let targetChapterId = null;

      if (overType === "chapter") {
        targetChapterId = overId;
      } else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error("Cannot move chapter here.");
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("Cannot move chapter here.");
        return;
      }
      const reorderedLocalChapter = arrayMove(items, oldIndex, newIndex);
      const updatedChapterForState = reorderedLocalChapter.map(
        (chapter, index) => ({
          ...chapter,
          order: index + 1,
        }),
      );
      const previousItems = [...items];
      setItems(updatedChapterForState);

      if (courseId) {
        const chaptersToUpdate = updatedChapterForState.map(
          (chapter, index) => ({
            id: chapter.id,
            position: chapter.order, // Ensure the position matches the new array index
          }),
        );

        const reorderChapterPromise = () =>
          reorderChapter(courseId, chaptersToUpdate);
        toast.promise(reorderChapterPromise(), {
          loading: "Saving new chapter order...",
          success: (result) => {
            if (result.status === "success") {
              return result.message;
            }
          },
          error: () => {
            // Revert to previous state on error
            setItems(previousItems);
            return "Failed to persist changes";
          },
        });
      }
      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) {
        toast.error("Cannot move lesson to another chapter.");
        return;
      }
      const chapterIndex = items.findIndex(
        (chapter) => chapter.id === chapterId,
      );

      if (chapterIndex === -1) {
        toast.error("Could not find chapter for lesson ");
        return;
      }

      const chapterToUpdate = items[chapterIndex];
      const oldLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === activeId,
      );
      const newLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === overId,
      );

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error("Could not find lesson for reordering");
        return;
      }
      const reorderedLessons = arrayMove(
        chapterToUpdate.lessons,
        oldLessonIndex,
        newLessonIndex,
      );
      const updatedChapter = {
        ...chapterToUpdate,
        lessons: reorderedLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        })),
      };
      const updatedLessonForState = [...items];
      updatedLessonForState[chapterIndex] = updatedChapter;
      setItems(updatedLessonForState);
      if (courseId) {
        // CORRECTED: Map the lessons from the specific chapter you just reordered
        const lessonsToUpdate = updatedChapter.lessons.map((lesson, index) => ({
          id: lesson.id,
          position: index + 1, // Ensure the position matches the new array index
        }));

        const reorderLessonPromise = () =>
          reorderLesson(chapterId, lessonsToUpdate, courseId);

        toast.promise(reorderLessonPromise(), {
          loading: "Saving new order...",
          success: "Order saved to database!",
          error: "Failed to persist changes",
        });
      }
      return;
    }
  }
  const toggleChapterOpen = (chapterId: string) => {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter,
      ),
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    // Implement Drag and Drop functionality here Using DND Kit or React Beautiful DND
    <DndContext
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
          <NewChapterModal courseId={data.id} />
        </CardHeader>
        <CardContent className="space-y-8">
          <SortableContext strategy={verticalListSortingStrategy} items={items}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                data={{ type: "chapter" }}
                id={item.id}
              >
                {(listeners) => (
                  <Card className="mb-4">
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapterOpen(item.id)}
                    >
                      <div className="flex flex-row items-center justify-between border-b border-border ">
                        <div className=" flex items-center gap-2">
                          <Button
                            className="cursor-grab opacity-60 hover:opacity-100"
                            {...listeners}
                            variant="ghost"
                          >
                            <GripVerticalIcon className="size-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                              className="flex jitems-center"
                              size="icon"
                              variant="ghost"
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight size="icon" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <p className="cursor-pointer hover:text-primary">
                            {item.title}
                          </p>
                        </div>
                        <DeleteChapter chapterId={item.id} courseId={data.id} />
                      </div>
                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            items={item.lessons.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {item.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                data={{ type: "lesson", chapterId: item.id }}
                                id={lesson.id}
                              >
                                {(lessonlisteners) => (
                                  <Card className="mb-2">
                                    <div className="flex items-center justify-between border-b border-border p-2 hover:bg-accent">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          className="cursor-grab opacity-60 hover:opacity-100"
                                          {...lessonlisteners}
                                          variant="ghost"
                                        >
                                          <GripVerticalIcon className="size-4" />
                                        </Button>
                                        <FileText className="size-4 opacity-60" />
                                        <Link
                                          href={`/instructor/courses/${data.id}/${item.id}/${lesson.id}`}
                                        >
                                          {lesson.title}
                                        </Link>
                                      </div>
                                      <DeleteLesson
                                        chapterId={item.id}
                                        courseId={data.id}
                                        lessonId={lesson.id}
                                      />
                                    </div>
                                  </Card>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                          <div className="p-2">
                            <NewLessonModal
                              chapterId={item.id}
                              courseId={data.id}
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
};
