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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { chapterSchema, ChapterSchemaType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { createChapter } from "../action";
import { toast } from "sonner";

const NewChapterModal = ({ courseId }: { courseId: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  function onOpenChange(open: boolean) {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  }

  const form = useForm<ChapterSchemaType>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      courseId: courseId,
    },
  });

  async function onSubmit(values: ChapterSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createChapter(values));
      if (error) {
        toast.error("Failed to create chapter.");
        return;
      }
      if (result.status === "success") {
        toast.success("Chapter created successfully.");
        form.reset();
        setIsOpen(false);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 flex items-center justify-center"
          variant="outline"
        >
          <Plus className="h-6 w-6" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
          <DialogDescription>
            What would you like to name this chapter?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Chapter Title" {...field} />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <DialogFooter>
              <Button disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Create Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChapterModal;
