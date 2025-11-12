
import { useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadZone({ onFilesSelected, isDragActive, onDragStateChange }) {
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      onDragStateChange(true);
    } else if (e.type === "dragleave") {
      onDragStateChange(false);
    }
  }, [onDragStateChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') || 
      file.type.startsWith('audio/')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, onDragStateChange]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') || 
      file.type.startsWith('audio/')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300",
        isDragActive
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.02]"
          : "border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600"
      )}
    >
      <input
        type="file"
        multiple
        accept="image/*,video/mp4,audio/mp3,audio/wav,audio/mpeg"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />
      
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
          isDragActive 
            ? "bg-emerald-500 scale-110" 
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        )}>
          {isDragActive ? (
            <Upload className="w-10 h-10 text-white animate-bounce" />
          ) : (
            <ImageIcon className="w-10 h-10 text-white" />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {isDragActive ? "Drop your files here" : "Drop files here or click to browse"}
          </p>
          <div className="space-y-1 mb-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Images:</strong> JPEG, PNG, WEBP, AVIF, GIF
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Video:</strong> MP4
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Audio:</strong> MP3, WAV
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Unlimited uploads • 50MB file size limit per file (500MB on Pro Plan)
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            All processing happens locally
          </p>
        </div>
      </div>
    </div>
  );
}
