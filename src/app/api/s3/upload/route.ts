import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "process";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/S3Client";
import z from "zod";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z
    .number()
    .max(10 * 1024 * 1024, { message: "File size exceeds the limit of 10MB" }),
  isImage: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid file upload data" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const { fileName, contentType, size } = validation.data;
    const uniqueKey = `${uuidv4()}-${fileName}`;
    // Here you would typically generate a pre-signed URL using AWS SDK

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const response = { key: uniqueKey, presignedUrl };

    return new Response(JSON.stringify({ key: uniqueKey, presignedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate presigned URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
