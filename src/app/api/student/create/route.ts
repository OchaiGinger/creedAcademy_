import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...studentData } = body;

    // Seed the Student table
    const newStudent = await prisma.student.create({
      data: {
        userId: userId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        middleName: studentData.middleName || null,
        gender: studentData.gender,
        dateOfBirth: new Date(studentData.dateOfBirth),
        phone: studentData.phone,
        nationality: studentData.nationality,
        stateOfOrigin: studentData.stateOfOrigin,
        lga: studentData.lga,
        address: studentData.address,
        ninNumber: studentData.ninNumber,
        category: studentData.category,
        trainingMode: studentData.trainingMode,
        passportPhotoPath: "/default-avatar.png", // Initial placeholder
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, student: newStudent });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return NextResponse.json(
      { message: error.message || "Database error" },
      { status: 500 },
    );
  }
}
