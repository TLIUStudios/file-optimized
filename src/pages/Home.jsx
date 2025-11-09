import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Sparkles, Shield, Zap, Image as ImageIcon } from "lucide-react";
import UploadZone from "../components/upload/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Lazy load heavy components for better performance
const ImageCard = lazy(() => import("../components/upload/ImageCard"));
const ImageComparisonModal = lazy(() => import("../components/comparison/ImageComparisonModal"));

// Loading fallback for image cards
function ImageCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="aspect-square rounded-lg" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function Home() {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleFilesSelected = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setProcessedImages(prev => {
      const newProcessed = { ...prev };
      delete newProcessed[id];
      return newProcessed;
    });
  };

  const handleImageProcessed = (id, data) => {
    setProcessedImages(prev => ({
      ...prev,
      [id]: data
    }));
  };

  const handleCompare = (data) => {
    setComparisonData(data);
  };

  const clearAll = () => {
    setImages([]);
    setProcessedImages({});
  };

  const processAllImages = async () => {
    setIsProcessingAll(true);
    toast.info(`Processing ${images.length} images...`);
    
    const unprocessedImages = images.filter(img => !processedImages[img.id]);
    
    if (unprocessedImages.length === 0) {
      toast.success('All images are already processed!');
      setIsProcessingAll(false);
      return;
    }
    
    toast.success(`Started processing ${unprocessedImages.length} images`);
    setIsProcessingAll(false);
  };

  const downloadAll = async () => {
    if (Object.keys(processedImages).length === 0) {
      toast.error('No processed images to download');
      return;
    }

    toast.info('Creating zip file...');
    
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    const zip = new JSZip();

    Object.values(processedImages).forEach(img => {
      zip.file(img.filename, img.compressedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `compressed-images-${Date.now()}.zip`;
    link.click();
    
    toast.success('Zip file downloaded!');
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const totalCompressedSize = Object.values(processedImages).reduce(
    (sum, img) => sum + img.compressedSize, 0
  );
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const savingsPercent = totalOriginalSize > 0 
    ? ((totalSavings / totalOriginalSize) * 100).toFixed(1)
    : 0;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          100% Private & Secure
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
          Compress & Convert
          <span className="block text-emerald-600 dark:text-emerald-400">Your Images</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Fast, secure, and powerful image compression. Reduce file size by up to 90% 
          while maintaining quality. All processing happens in your browser.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Client-side processing means instant results with no upload wait times
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">100% Private</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your images never leave your device. Everything happens locally
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Convert between PNG, JPG, WebP, AVIF, and GIF formats
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Zone */}
      {images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <UploadZone
            onFilesSelected={handleFilesSelected}
            isDragActive={isDragActive}
            onDragStateChange={setIsDragActive}
          />
        </motion.div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Images</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {images.length}
                  </p>
                </div>
                <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Processed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Object.keys(processedImages).length}/{images.length}
                  </p>
                </div>
                {Object.keys(processedImages).length > 0 && (
                  <>
                    <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Savings</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {savingsPercent}%
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {Object.keys(processedImages).length < images.length && (
                  <Button
                    onClick={processAllImages}
                    disabled={isProcessingAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Process All Remaining
                  </Button>
                )}
                {Object.keys(processedImages).length > 0 && (
                  <Button
                    onClick={downloadAll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All ({Object.keys(processedImages).length})
                  </Button>
                )}
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Add More Button */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="add-more"
            />
            <Button
              variant="outline"
              className="w-full h-16 border-2 border-dashed hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Add More Images
            </Button>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<ImageCardSkeleton />}>
                    <ImageCard
                      image={image.file}
                      onRemove={() => removeImage(image.id)}
                      onProcessed={(data) => handleImageProcessed(image.id, data)}
                      onCompare={handleCompare}
                    />
                  </Suspense>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Comparison Modal */}
      {comparisonData && (
        <Suspense fallback={null}>
          <ImageComparisonModal
            isOpen={!!comparisonData}
            onClose={() => setComparisonData(null)}
            originalImage={comparisonData.original}
            compressedImage={comparisonData.compressed}
            originalSize={comparisonData.originalSize}
            compressedSize={comparisonData.compressedSize}
            fileName={comparisonData.fileName}
          />
        </Suspense>
      )}
    </div>
  );
}