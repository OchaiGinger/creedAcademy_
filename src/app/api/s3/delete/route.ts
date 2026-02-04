import { requireInstructor } from "@/app/data/instructor/require-admin";
import { env } from "@/lib/env";
import { s3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const session = await requireInstructor();

  try {
    const body = await request.json();
    const key = body.key;

    if (!key) {
      return NextResponse.json(
        { error: "Missing or invalid object key" },
        { status: 400 },
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("S3 Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete object" },
      { status: 500 },
    );
  }
}
