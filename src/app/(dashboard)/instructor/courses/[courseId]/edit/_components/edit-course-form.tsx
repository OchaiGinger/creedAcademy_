"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  courseCategories,
  courseLevelEnum,
  courseSchema,
  CourseSchemaType,
  CourseStatusEnum,
} from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";

import { Uploader } from "@/components/file-upload/uploader";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { tryCatch } from "@/hooks/try-catch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateCourse } from "../../../create/action";
import { editCourse } from "../action";
import { InstructorCourseType } from "@/app/data/instructor/instructor-get-course";

interface iAppProps {
  data: InstructorCourseType;
}
export const EditCourseForm = ({ data }: iAppProps) => {
  const [ispending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
      fileKey: data.fileKey,
      price: data.price,
      duration: data.duration,
      level: data.level,
      smallDescription: data.smallDescription,
      slug: data.slug,
      category: data.category as CourseSchemaType["category"],
      status: data.status,
    },
  });

  const onSubmit: SubmitHandler<CourseSchemaType> = (values) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        editCourse(values, data.id),
      );
      if (error) {
        toast.error("Error editing course:");
        return;
      }

      if (result.status == "success") {
        toast.success(result.message);
        form.reset();
        router.push("/instructor/courses");
      } else if (result.status == "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-end ">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            className="w-fit"
            onClick={() => {
              const titleValue = form.getValues("title");
              const slug = slugify(titleValue);
              form.setValue("slug", slug, { shouldValidate: true });
            }}
          >
            Generate Slug
            <SparkleIcon size={16} className="ml-1" />
          </Button>
        </div>

        <FormField
          control={form.control}
          name="smallDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Small Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Small Description"
                  {...field}
                  className="min-h-30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail Image</FormLabel>
              <FormControl>
                <Uploader onChange={field.onChange} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>

                  <SelectContent>
                    {courseLevelEnum.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Duration in hours"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₦)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Price in Naira"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>

              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>

                <SelectContent>
                  {CourseStatusEnum.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={ispending}>
          {ispending ? (
            <>
              Updating...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Update Course{" "}
              <PlusIcon
                className="ml-2 h-4 w-4"
                onClick={form.handleSubmit(onSubmit)}
              />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
