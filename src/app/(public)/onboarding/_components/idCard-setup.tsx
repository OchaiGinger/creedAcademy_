"use client";

import React from "react";
import { Award, Download, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConstructUrl } from "@/hooks/use-construct";

export default function IDCardStep({ student, photoKey, onNext }: any) {
  const imageUrl = useConstructUrl(photoKey);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Digital Identity</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Congratulations! You are officially a Keek Institute student. Below
            is your secure digital ID card.
          </p>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100 text-green-700">
              <Award size={24} className="mr-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                Verified: {student?.registrationNumber || "PENDING"}
              </span>
            </div>
            <Button variant="outline" className="w-full">
              <Download size={18} className="mr-2" /> Download Admission Letter
            </Button>
          </div>
        </div>

        {/* Glassmorphism ID Card */}
        <div className="relative aspect-[1.6/1] rounded-2xl p-6 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={120} />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg tracking-wider">
                  Keek Institute
                </h3>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">
                  Student Identification
                </p>
              </div>
              <div className="h-8 w-8 bg-white/20 rounded backdrop-blur-md flex items-center justify-center font-bold">
                K
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white/10 rounded-xl border border-white/20 overflow-hidden shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs">
                    No Photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold uppercase truncate">
                  {student?.firstName || "New"} {student?.lastName || "Student"}
                </p>
                <p className="text-xs font-mono text-slate-300 truncate">
                  {student?.registrationNumber || "GENERATING..."}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[8px] opacity-60">
              <span>ISSUED BY ADMISSIONS</span>
              <span className="font-mono uppercase">
                {student?.id ? student.id.split("-")[0] : "TX-REF"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <Button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700">
          Proceed to Assessment <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
