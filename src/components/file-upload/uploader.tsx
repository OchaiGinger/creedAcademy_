"use client";

import React, { useCallback, useEffect } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useConstructUrl } from "@/hooks/use-construct";

interface uploaderProps {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType?: "image" | "video";
}

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function Uploader({ onChange, value }: iAppProps) {
  const fileUrl = useConstructUrl(value || "");

  const [files, setFiles] = React.useState<uploaderProps>({
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    error: false,
    objectUrl: fileUrl,
    fileType: "image",
    key: value,
  });

  async function uploadFile(file: File) {
    setFiles((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      const presignedUrlResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });
      if (!presignedUrlResponse.ok) {
        toast.error("Failed to get presigned URL");
        setFiles((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
        return;
      }
      const { presignedUrl, key } = await presignedUrlResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", presignedUrl);
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFiles((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              error: false,
              key: key,
            }));

            onChange?.(key);

            toast.success("File uploaded successfully");
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setFiles((prev) => ({
              ...prev,
              progress,
            }));
          }
        };
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong during the upload.");
      setFiles((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: true,
      }));
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (files.objectUrl && files.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(files.objectUrl);
      }
      setFiles({
        file: file,
        objectUrl: URL.createObjectURL(file),
        fileType: "image",
        error: false,
        id: uuidv4(),
        uploading: true,
        progress: 0,
        isDeleting: false,
      });

      uploadFile(file);
    }
  }, []);

  async function handleRemoveFile() {
    if (files.isDeleting || !files.objectUrl) {
      try {
        setFiles((prev) => ({
          ...prev,
          isDeleting: true,
        }));

        const response = await fetch("/api/s3/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: files.key,
          }),
        });

        if (!response.ok) {
          toast.error("Failed to remove file from storage");
          setFiles((prev) => ({
            ...prev,
            isDeleting: true,
            error: true,
          }));
          return;
        }
        if (files.objectUrl && files.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(files.objectUrl);
        }

        onChange?.("");

        setFiles((prev) => ({
          ...prev,
          file: null,
          uploading: false,
          objectUrl: undefined,
          id: null,
          fileType: "image",
          isDeleting: false,
          error: false,
        }));

        toast.success("File removed successfully!");
      } catch (error) {
        toast.error("Erro removing file pleae try !");
        setFiles((prev) => ({
          ...prev,
          isDeleting: false,
          error: true,
        }));
      }
    }
  }

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (!fileRejections.length) return;

    const tooManyFiles = fileRejections.find(
      (rejection) => rejection.errors[0]?.code === "too-many-files",
    );

    if (tooManyFiles) {
      toast.error("You can only upload one file at a time.");
      return;
    }

    const fileTooLarge = fileRejections.find(
      (rejection) => rejection.errors[0]?.code === "file-too-large",
    );

    if (fileTooLarge) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
  }, []);

  function renderContent() {
    if (files.uploading) {
      return (
        <RenderUploadingState
          file={files.file as File}
          progress={files.progress}
        />
      );
    }
    if (files.error) {
      return <RenderErrorState />;
    }
    if (files.objectUrl) {
      return (
        <RenderUploadedState
          handleRemoveFinal={handleRemoveFile}
          isDeleting={files.isDeleting}
          previewUrl={files.objectUrl}
        />
      );
    }
    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (files.objectUrl && files.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(files.objectUrl);
      }
    };
  }, [files.objectUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: files.isDeleting || !!files.objectUrl,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-300 w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
