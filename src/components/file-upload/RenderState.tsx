import { cn } from "@/lib/utils";
import { CloudUpload, ImageIcon, Loader2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUpload
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary",
          )}
        />
      </div>
      <p className="text-muted-foreground text-base font-bold">
        Drop you files here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          click to select files
        </span>
      </p>
      <Button type="button" className="mb-4">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className=" text-center">
      <div className="text-center">
        <div className="flex items-center mx-auto justify-center size-12 rounded-full mbg-destructive/30 mb-4">
          <ImageIcon className={cn("size-6 text-destructive")} />
        </div>
      </div>
      <p className="text-base font-semibold ">Upload failed </p>
      <p className="text-xl mt-1 mb-4 text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      <Button type="button" className="text-xl mt-3 ">
        Retry Upload
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  isDeleting,
  handleRemoveFinal,
}: {
  previewUrl: string;
  isDeleting: boolean;
  handleRemoveFinal: () => void;
}) {
  return (
    <div>
      <Image
        src={previewUrl}
        alt="Uploaded File"
        fill
        className="object-contain p-2"
      />
      <Button
        onClick={handleRemoveFinal}
        disabled={isDeleting}
        variant="destructive"
        className={cn("absolute top-4 right-4")}
        type="button"
      >
        {isDeleting ? (
          <Loader2 className="size-2 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({
  file,
  progress,
}: {
  progress: number;
  file: File;
}) {
  return (
    <div className="text-center justify-center items-center flex flex-col">
      <p>{progress}</p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      <p className="truncate text-muted-foreground mt-1 text-xs mx-w-xs">
        {file.name}
      </p>
    </div>
  );
}
