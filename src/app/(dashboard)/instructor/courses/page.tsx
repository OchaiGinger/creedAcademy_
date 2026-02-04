import { instructorGetCourses } from "@/app/data/instructor/instructor-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { get } from "http";
import Link from "next/link";
import { InstructorCourseCard } from "./_components/InstructorCourseCard";

const CoursesPage = async () => {
  const data = await instructorGetCourses();
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link href="/instructor/courses/create" className={buttonVariants()}>
          Create Course
        </Link>
      </div>

      <div className="mt-8 space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((course) => (
          <InstructorCourseCard key={course.id} data={course} />
        ))}
      </div>
    </>
  );
};

export default CoursesPage;
