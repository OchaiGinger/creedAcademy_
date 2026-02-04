// import { AuthLayout } from "@/components/auth/AuthLayout";
// import SignUpForm from "@/components/auth/signup-form";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { SignInSchemaType, signInSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up - Digital",
  description: "Create your Digital account",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid grid-cols-1 md:grid-cols-[2fr_3fr] p-0 w-full">
          <div className="bg-radial from-blue-500 to-blue-900 relative hidden md:flex flex-col items-center justify-center gap-y-4">
            <Image
              src="/logo.svg"
              alt="keek institute logo"
              width={92}
              height={92}
              className="h-23 w-23"
            />
            <p className="text-2xl font-semibold text-white">Keek Institute</p>
          </div>

          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
