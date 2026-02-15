"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, GraduationCap, ShieldCheck } from "lucide-react";
import { signInSchema, SignInSchemaType } from "@/lib/zodSchema";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Shadcn UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { checkStudentOnboardingAction } from "./action";

interface SignInFormProps {
  onToggle: () => void;
}

export const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const router = useRouter();

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      registrationNumber: "", // Keep as empty string
      password: "",
    },
  });

  // Inside SignInForm.tsx

  const onSubmit = async (values: SignInSchemaType) => {
    setIsLoading(true);

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      // registrationNumber is moved into fetchOptions.body
      fetchOptions: {
        body: {
          registrationNumber: isStudent ? values.registrationNumber : undefined,
        },
      },
    });

    if (error) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      return;
    }

    // After successful login, determine the route
    try {
      // We fetch the session again or use a dedicated action to check onboarding
      const { data: session } = await authClient.getSession();

      if (!session) {
        router.push("/signin");
        return;
      }

      const role = session.user.role;

      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "INSTRUCTOR") {
        router.push("/instructor");
      } else {
        // It's a Student (Role: USER)
        // We need to check the 'onboardedBy' field from the Student model
        // Since better-auth user object might not have it, we call a quick server action
        const onboardingStatus = await checkStudentOnboardingAction(
          session.user.id,
        );

        if (onboardingStatus.isOnboarded) {
          router.push("/student");
        } else {
          // Force a full check by clearing any previous stale state
          await router.prefetch("/onboarding");
          router.push("/onboarding");
        }
      }

      router.refresh();
    } catch (err) {
      toast.error("Error determining dashboard path");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Right Panel: Form Area */}
      <div className="w-full bg-white p-10 md:p-12">
        <div className="flex gap-3 mb-8">
          <Button
            type="button"
            variant={isStudent ? "default" : "outline"}
            onClick={() => setIsStudent(true)}
            className={`flex-1 h-12 gap-2 font-semibold transition-all ${isStudent ? "bg-blue-600 shadow-md" : "text-slate-500"}`}
          >
            <GraduationCap className="h-4 w-4" /> Student
          </Button>
          <Button
            type="button"
            variant={!isStudent ? "default" : "outline"}
            onClick={() => setIsStudent(false)}
            className={`flex-1 h-12 gap-2 font-semibold transition-all ${!isStudent ? "bg-blue-600 shadow-md" : "text-slate-500"}`}
          >
            <ShieldCheck className="h-4 w-4" /> Staff
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) =>
              console.log("Validation Errors:", errors),
            )}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@school.edu"
                      className="h-11 bg-slate-50 border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isStudent && (
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-slate-700 font-semibold">
                      Registration Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="REG-2024-XXXdX"
                        className="h-11 bg-slate-50 border-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      className="h-11 border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-100 mt-4"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-slate-500 pt-4">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};
