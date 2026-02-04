// import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/signin-form";
import { Card, CardContent } from "@/components/ui/card";
import { SignInSchemaType, signInSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <SignInForm />
          <div className="bg-radial from-blue-500 to-blue-900 relative hidden md:flex flex-col items-center justify-center gap-y-4 ">
            <Image
              src="/logo.svg"
              alt="keek institute logo"
              width={92}
              height={92}
              className="h-23 w-23"
            />

            <p className="text-2xl font-bold text-white">Keek Institute</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
