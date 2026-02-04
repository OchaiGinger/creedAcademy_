import { InstructorGetCoursesReturnType } from "@/app/data/instructor/instructor-get-courses";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConstructUrl } from "@/hooks/use-construct";

import {
  ArrowRight,
  Eye,
  MoreVertical,
  Pencil,
  School,
  TimerIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface iAppProps {
  data: InstructorGetCoursesReturnType;
}
export const InstructorCourseCard = ({ data }: iAppProps) => {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  return (
    <Card className="group relative py-0  gap-0">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size={"icon"}>
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/courses/${data.slug}/edit`}>
                <Pencil className="size-6 mr-2" />
                Edit Course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/instructor/courses/${data.id}`}>
                <Eye className="size-6 mr-2" />
                Preview
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`/instructor/courses/${data.id}/delete`}>
                <Trash2 className="size-6 mr-2 text-destructive" />
                Delete
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Image
        src={thumbnailUrl}
        alt="Thumbnail Url"
        width={600}
        height={400}
        className="w-full rounded-t-lg aspect-video h-full object-cover"
      />
      <CardContent className="p-4">
        <Link
          href={`/instructor/courses/${data.id}`}
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
        >
          {data.title}
        </Link>
        <p className="line-clamp-2 text-sm leading-tight mt-2 text-muted-foreground">
          {data.smallDescription}
        </p>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center space-x-2">
            <TimerIcon className="rounded-md text-primary bg-primary/10 p-1 size-6" />
            <p className="text-xs mt-1 text-muted-foreground">
              {data.duration}h
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <School className="rounded-md text-primary bg-primary/10 p-1 size-6" />
            <p className="text-xs mt-1 text-muted-foreground">{data.level}</p>
          </div>
        </div>

        <Link
          href={`/instructor/courses/${data.id}/edit`}
          className={buttonVariants({
            className: "w-full mt-4 justify-center items-center",
          })}
        >
          Edit Course <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
};
