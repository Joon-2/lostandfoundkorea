"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

type FileUploadProps = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (files: FileList | null) => void;
  buttonText?: string;
  className?: string;
};

export default function FileUpload({
  label,
  accept = "image/*",
  multiple = false,
  disabled = false,
  onChange,
  buttonText = "Choose file",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(
        files.length === 1 ? files[0].name : `${files.length} files selected`
      );
    } else {
      setFileName("");
    }
    onChange(files);
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>
        <span className="truncate text-sm text-muted">
          {fileName || "No file chosen"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
