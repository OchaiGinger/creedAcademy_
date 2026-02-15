import React from "react";
import Image from "next/image";
import { Clock, Loader2, LogOut, Mail, HelpCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Student } from "@/generated/prisma";

interface WaitingRoomProps {
  student: Partial<Student> & { email?: string; name?: string };
}

export const WaitingRoom = ({ student }: WaitingRoomProps) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4 overflow-hidden">
      <Card className="w-full max-w-4xl h-145 grid md:grid-cols-2 overflow-hidden border-none shadow-2xl rounded-3xl p-0">
        {/* Left Section: Brand */}
        <div className="bg-radial from-blue-500 to-blue-900 relative hidden md:flex flex-col items-center justify-center gap-y-6">
          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Image
              src="/logo.svg"
              alt="logo"
              width={100}
              height={100}
              className="h-24 w-24"
            />
          </div>
          <div className="text-center relative z-10 text-white">
            <p className="text-3xl font-bold tracking-tight">Keek Institute</p>
            <p className="text-blue-100/60 text-sm font-medium uppercase tracking-widest">
              Admissions
            </p>
          </div>
        </div>

        {/* Right Section: Content */}
        <CardContent className="flex flex-col justify-between p-10 md:p-12 bg-white">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Status
                </span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                Under <span className="text-blue-600">Review</span>
              </h2>
            </div>

            <div className="grid gap-4">
              <DataLine label="Applicant" value={student.name || "N/A"} />
              <DataLine label="Email" value={student.email || "N/A"} />
              <DataLine
                label="Status"
                value={
                  <span className="flex items-center text-blue-600 font-bold">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PENDING
                  </span>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <Mail className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm font-bold">Check Email</p>
                <p className="text-[11px] text-slate-500">
                  Registration ID incoming.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <HelpCircle className="w-5 h-5 text-slate-500 mb-2" />
                <p className="text-sm font-bold">Support</p>
                <p className="text-[11px] text-slate-500">
                  24/7 help available.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Creed Security
            </p>
            <Link
              href="/api/auth/signout"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "font-bold rounded-xl",
              )}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DataLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-base font-bold text-slate-900 truncate max-w-50">
      {value}
    </span>
  </div>
);
