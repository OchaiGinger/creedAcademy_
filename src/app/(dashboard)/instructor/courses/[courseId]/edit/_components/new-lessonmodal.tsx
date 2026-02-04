import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { LessonSchema, LessonSchemaType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createLesson } from "../action";

const NewLessonModal = ({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  function onOpenChange(open: boolean) {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  }

  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(LessonSchema),
    defaultValues: {
      title: "",
      courseId: courseId,
      chapterId: chapterId,
      description: "",
      videoFileKey: "",
      thumbnailKey: "",
    },
  });

  async function onSubmit(values: LessonSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createLesson(values));
      if (error) {
        toast.error("Failed to create lesson.");
        return;
      }
      if (result.status === "success") {
        toast.success("Lesson created successfully.");
        form.reset();
        setIsOpen(false);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full gap-1 flex items-center justify-center"
          variant="outline"
        >
          <Plus className="h-6 w-6" />
          New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
          <DialogDescription>
            What would you like to name this lesson?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(
              onSubmit, // Check your console for this!
            )}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Lesson Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <DialogFooter>
              <Button
                type="submit"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents dnd-kit from catching the click
                  console.log("Button actually clicked!");
                }}
              >
                {isPending ? "Saving..." : "Create Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLessonModal;
