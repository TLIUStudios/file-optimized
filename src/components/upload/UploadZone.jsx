import { useCallback } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AnimatedMediaIcon from "../AnimatedMediaIcon";

// Security: Allowed file types (MIME types and extensions)
const ALLOWED_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  // GIF
  'image/gif': ['.gif'],
  // Video
  'video/mp4': ['.mp4'],
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/wave': ['.wav'],
  'audio/x-wav': ['.wav'],
  // 3D Models
  'model/gltf-binary': ['.glb'],
  'application/octet-stream': ['.glb'],
};

const MAX_FILES_PER_BATCH_FREE = 3;
const MAX_FILES_PER_BATCH_PRO = 30;
const MAX_FILE_SIZE_FREE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024; // 500MB in bytes

const validateFile = (file, maxFileSize) => {
  const errors = [];
  
  // Check file size
  if (file.size > maxFileSize) {
    const maxSizeMB = Math.floor(maxFileSize / 1024 / 1024);
    errors.push(`File "${file.name}" exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }
  
  // Check file type (MIME type)
  const mimeAllowed = Object.keys(ALLOWED_TYPES).includes(file.type);
  
  // Check file extension as secondary validation
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const extensionAllowed = Object.values(ALLOWED_TYPES).flat().includes(extension);
  
  if (!mimeAllowed && !extensionAllowed) {
    errors.push(`File type not allowed: "${file.name}" (${file.type || 'unknown type'})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default function UploadZone({ onFilesSelected, isDragActive, onDragStateChange, userPlan = 'free' }) {
  const isPro = userPlan === 'pro';
  const maxFileSize = isPro ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;
  const maxFilesPerBatch = isPro ? MAX_FILES_PER_BATCH_PRO : MAX_FILES_PER_BATCH_FREE;

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [onFilesSelected, onDragStateChange]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const processFiles = (files) => {
    // Check batch size limit
    if (files.length > maxFilesPerBatch) {
      toast.error(`Maximum ${maxFilesPerBatch} files allowed per batch${isPro ? '' : ' (Pro: 30 files)'}. You selected ${files.length} files.`, {
        duration: 5000
      });
      return;
    }

    const validFiles = [];
    const rejectedFiles = [];

    files.forEach(file => {
      const validation = validateFile(file, maxFileSize);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        rejectedFiles.push({ file, errors: validation.errors });
      }
    });

    // Show errors for rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          toast.error(error, { duration: 6000 });
        });
      });
    }

    // Add valid files
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added successfully`, {
        duration: 3000
      });
    } else if (files.length > 0) {
      toast.error('No valid files to upload. Please check file types and sizes.', {
        duration: 5000
      });
    }
  };

  const formatFileSize = (bytes) => {
    return `${Math.floor(bytes / 1024 / 1024)}MB`;
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
          : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
      )}
    >
      <input
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.mp4,.mp3,.wav,.glb,model/gltf-binary,application/octet-stream"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
        title="No file chosen"
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
            <AnimatedMediaIcon className="w-10 h-10 text-white" />
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
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>3D Models:</strong> GLB
            </p>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>
              <strong>Free Plan:</strong> • Max 3 files batch upload • 50MB per file • Standard processing speeds • No Watermark • Displays Ads
            </p>
            <p>
              <strong>Pro Plan:</strong> • Max 30 files batch upload • 500MB per file • Priority processing speeds • No Watermark • No Ads • Supports future TLIU Studios projects
            </p>
          </div>
          {isPro && (
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg">
              ⚡ PRO Benefits Active
            </div>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            🔒 Secure: Only approved file types accepted.
          </p>
        </div>
      </div>
    </div>
  );
}