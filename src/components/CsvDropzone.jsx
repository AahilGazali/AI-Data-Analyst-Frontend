import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function CsvDropzone({ onFile, disabled, busy }) {
  const onDrop = useCallback(
    (accepted) => {
      const f = accepted[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
    disabled: disabled || busy,
  });

  return (
    <div
      {...getRootProps()}
      className={`group relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
        isDragActive
          ? "border-accent bg-accent/10"
          : "border-surface-border bg-surface-raised/50 hover:border-zinc-600 hover:bg-surface-raised"
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <div className="rounded-full bg-white/5 p-4 text-2xl transition-transform group-hover:scale-105">
          📄
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {isDragActive ? "Drop your CSV here" : "Drag & drop a CSV file"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">or click to browse · up to 15 MB</p>
        </div>
      </div>
    </div>
  );
}
