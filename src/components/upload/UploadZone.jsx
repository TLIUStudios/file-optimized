import { useCallback } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn, validateFiles, getErrorMessage } from "@/utils";
import { toast } from "sonner";

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

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    // Client-side validation
    const validationResult = await validateFiles(droppedFiles, { isPro: false });

    if (!validationResult.isValid) {
      // Show errors
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">Upload Failed</p>
          <p className="text-xs">{getErrorMessage(validationResult.errors.slice(0, 3))}</p>
          {validationResult.errors.length > 3 && (
            <p className="text-xs text-slate-400">+ {validationResult.errors.length - 3} more issues</p>
          )}
        </div>,
        { duration: 5000 }
      );

      // If some files are valid, still allow them
      if (validationResult.validFiles.length > 0) {
        toast.info(`${validationResult.validFiles.length} valid files will be uploaded`);
        onFilesSelected(validationResult.validFiles.map(v => v.file));
      }
      return;
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      toast.warning(
        <div className="space-y-1">
          <p className="font-semibold">Files Uploaded with Warnings</p>
          <p className="text-xs">{validationResult.warnings[0]}</p>
        </div>,
        { duration: 3000 }
      );
    }

    // All files valid
    onFilesSelected(validationResult.validFiles.map(v => v.file));
  }, [onFilesSelected, onDragStateChange]);

  const handleFileInput = async (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Client-side validation
    const validationResult = await validateFiles(selectedFiles, { isPro: false });

    if (!validationResult.isValid) {
      // Show errors
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">Upload Failed</p>
          <p className="text-xs">{getErrorMessage(validationResult.errors.slice(0, 3))}</p>
          {validationResult.errors.length > 3 && (
            <p className="text-xs text-slate-400">+ {validationResult.errors.length - 3} more issues</p>
          )}
        </div>,
        { duration: 5000 }
      );

      // If some files are valid, still allow them
      if (validationResult.validFiles.length > 0) {
        toast.info(`${validationResult.validFiles.length} valid files will be uploaded`);
        onFilesSelected(validationResult.validFiles.map(v => v.file));
      }
      
      // Clear the input
      e.target.value = '';
      return;
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      toast.warning(
        <div className="space-y-1">
          <p className="font-semibold">Files Uploaded with Warnings</p>
          <p className="text-xs">{validationResult.warnings[0]}</p>
        </div>,
        { duration: 3000 }
      );
    }

    // All files valid
    onFilesSelected(validationResult.validFiles.map(v => v.file));
    
    // Clear the input for re-selection
    e.target.value = '';
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
            Max 50 files • 50MB per file • 1GB total per batch
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            🔒 All processing happens locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}