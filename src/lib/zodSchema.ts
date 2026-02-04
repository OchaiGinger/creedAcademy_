import { description } from "@/components/sidebar/chart-area-interactive";
import * as z from "zod";

export const courseLevelEnum = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export const genderEnum = ["MALE", "FEMALE", "OTHER"] as const;

export const CourseStatusEnum = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const trainingModeEnum = ["ONLINE", "OFFLINE", "HYBRID"] as const;
export const studentCategoryEnum = [
  "REGULAR",
  "AFFILIATE",
  "INTERNSHIP",
  "SCHOLARSHIP",
] as const;

export const courseCategories = [
  "Development",
  "Business",
  "Finance & Accounting",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Lifestyle",
  "Photography & Video",
  "Health & Fitness",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be at most 100 characters."),
  description: z.string().min(3, "Description must be at least 3 characters."),
  fileKey: z.string().min(1, "File key is required."),
  price: z.coerce.number().min(1, "Price must be at least 1."),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute.")
    .max(600, "Duration must be at most 600 minutes."),
  level: z.enum(courseLevelEnum),
  smallDescription: z
    .string()
    .min(3, "Small description must be at least 3 characters.")
    .max(255, "Small description must be at most 255 characters."),
  slug: z.string().min(3, "Title must be at least 3 characters."),
  category: z.enum(courseCategories, { message: "Category is required." }),
  status: z.enum(CourseStatusEnum, {
    message: "Course status is required.",
  }),
});

export const signupSchema = z.object({
  // Step 1: User Account
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be 8+ characters"),

  // Step 2: Personal Details (Student Model)
  firstName: z.string().min(2, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Required"),
  gender: z.enum(genderEnum, { message: "Gender is required" }),
  dateOfBirth: z.string().min(1, "Required"),
  phone: z.string().min(10, "Invalid phone number"),

  // Step 3: Residential (Student Model)
  nationality: z.string().min(2, "Required"),
  stateOfOrigin: z.string().min(2, "Required"),
  lga: z.string().min(2, "Required"),
  address: z.string().min(5, "Full address required"),

  // Step 4: Academic & Identity (Student Model)
  ninNumber: z.string().length(11, "NIN must be 11 digits"),
  category: z.enum(studentCategoryEnum, { message: "Category is required" }),
  trainingMode: z.enum(trainingModeEnum, {
    message: "Training mode is required",
  }),
  passportPhotoPath: z.any().optional(), // Handle file upload separately
});

export type SignupSchemaType = z.infer<typeof signupSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid school email address"),
  registrationNumber: z.string().min(5, "Registration number is required"),
  password: z.string().min(1, "Password is required"),
});

export const chapterSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().uuid({ message: "Invalid course ID." }),
});

export const LessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  chapterId: z.string().uuid({ message: "Invalid chapter ID." }),
  courseId: z.string().uuid({ message: "Invalid course ID." }),
  description: z.string().optional(),
  videoFileKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;
export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof LessonSchema>;
