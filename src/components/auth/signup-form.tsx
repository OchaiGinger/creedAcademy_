"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import {
  signupSchema,
  SignupSchemaType,
  studentCategoryEnum,
  trainingModeEnum,
} from "@/lib/zodSchema";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nigeriaData, states } from "@/lib/nigeria-data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      dateOfBirth: "",
      phone: "",
      nationality: "",
      stateOfOrigin: "",
      lga: "",
      address: "",
      ninNumber: "",
      category: "REGULAR",
      trainingMode: "ONLINE",
    },
  });
  const selectedState = form.watch("stateOfOrigin");

  // Dynamic Validation per Step
  const handleNext = async () => {
    let fields: any[] = [];
    if (step === 1) fields = ["name", "email", "password"];
    if (step === 2)
      fields = ["firstName", "lastName", "gender", "dateOfBirth", "phone"];
    if (step === 3) fields = ["nationality", "stateOfOrigin", "lga", "address"];

    const isValid = await form.trigger(fields);
    if (isValid) setStep((prev) => prev + 1);
  };

  const onSubmit = async (data: SignupSchemaType) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating account...");

    try {
      // STEP 1: ONLY SAVE 3 THINGS TO BETTER-AUTH
      const { data: authData, error: authError } =
        await authClient.signUp.email({
          email: data.email,
          password: data.password,
          name: data.name, // The 3 core fields
          callbackURL: "/onboarding-complete",
        });

      if (authError) {
        toast.error(authError.message || "Signup failed", { id: toastId });
        setIsLoading(false);
        return;
      }

      // STEP 2: SEED THE STUDENT TABLE SEPARATELY
      // We pass the userId from the auth response and the rest of the form data
      toast.loading("Setting up your student profile...", { id: toastId });

      const response = await fetch("/api/student/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          ...data, // This contains NIN, State, LGA, Phone, etc.
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create student profile",
        );
      }

      // SUCCESS
      toast.success("Registration complete!", { id: toastId });
      router.push("/onboarding-complete");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full bg-white px-6 py-4 md:px-12 space-y-4">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="text-xs text-center text-slate-400 font-mono uppercase tracking-widest">
          Step {step} of 4
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }} // Calculated for 4 pages
          ></div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                Create Account
              </h2>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      UserName
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-12 bg-slate-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          className="h-12 bg-slate-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          placeholder="••••••••"
                          className="h-12 bg-slate-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFO (2 PER LINE) */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input className="h-11 bg-slate-50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input className="h-11 bg-slate-50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+234..."
                          className="h-11 bg-slate-50"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-semibold">
                        Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-11 bg-slate-50"
                          {...field}
                          placeholder="MM/DD/YYYY"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 3: RESIDENCY (2 PER LINE) */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                Residency & Origin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Nationality
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-slate-50"
                          {...field}
                          placeholder="Nigerian"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* State of Origin Selection */}
                <FormField
                  control={form.control}
                  name="stateOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        State of Origin
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("lga", ""); // Reset LGA when state changes
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50 w-full">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* LGA Selection (Dependent on State) */}
                <FormField
                  control={form.control}
                  name="lga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">L.G.A</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedState} // Disable if no state is chosen
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50">
                            <SelectValue
                              placeholder={
                                selectedState
                                  ? "Select LGA"
                                  : "Select a state first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedState &&
                            nigeriaData[selectedState]?.map((lga) => (
                              <SelectItem key={lga} value={lga}>
                                {lga}
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
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-slate-700 font-semibold">
                        Home Address
                      </FormLabel>
                      <FormControl>
                        <Input className="h-11 bg-slate-50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 4: IDENTITY & PROGRAM */}
          {step === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                Identification & Preference
              </h2>
              <FormField
                control={form.control}
                name="ninNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">
                      NIN (11 Digits)
                    </FormLabel>
                    <FormControl>
                      <Input
                        maxLength={11}
                        placeholder="12345678901"
                        className="h-11 bg-slate-50"
                        {...field}
                      />
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
                      <FormLabel className="text-slate-700 font-semibold">
                        Student Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studentCategoryEnum.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trainingMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        Training Mode
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trainingModeEnum.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="h-12 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-600 h-12 font-bold gap-2"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 h-12 font-bold shadow-lg shadow-blue-100"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Complete Enrollment"
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 pt-4">
            Don't have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};
