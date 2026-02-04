import { InstructorGetCourse } from "@/app/data/instructor/instructor-get-course";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { EditCourseForm } from "./_components/edit-course-form";
import { EditCourseStructure } from "./_components/edit-course-structure";

type Params = Promise<{ courseId: string }>;

const EditCourseIdPage = async ({ params }: { params: Params }) => {
  const { courseId } = await params;
  const data = await InstructorGetCourse(courseId);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 space-x-2">
        Edit Course:{" "}
        <span className="text-primary underline">{data.title}</span>
      </h1>
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
              <CardDescription>
                Edit basic information about the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditCourseForm data={data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course-structure">
          <Card>
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>
                Edit the structure of the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditCourseStructure data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditCourseIdPage;
