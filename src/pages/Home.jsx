
import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Sparkles, Shield, Zap, Image as ImageIcon } from "lucide-react";
import UploadZone from "../components/upload/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Lazy load heavy components for better performance
const MediaCard = lazy(() => import("../components/upload/MediaCard"));
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
  const [autoProcessTrigger, setAutoProcessTrigger] = useState(0);

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file
    }));
    setImages(prev => [...prev, ...newFiles]);
    
    // Show success toast
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} added!`);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);
    toast.success('Images reordered!');
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
    const unprocessedImages = images.filter(img => !processedImages[img.id]);
    
    if (unprocessedImages.length === 0) {
      toast.success('All images are already processed!');
      return;
    }
    
    toast.info(`Processing ${unprocessedImages.length} images...`);
    setAutoProcessTrigger(prev => prev + 1);
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
  
  const unprocessedCount = images.filter(img => !processedImages[img.id]).length;

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
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6"
        >
          <Shield className="w-4 h-4" />
          100% Private & Secure
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4"
        >
          Compress & Convert
          <span className="block text-emerald-600 dark:text-emerald-400">Images, Videos & Audio</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Fast, secure, and powerful media compression. Reduce file size by up to 90% 
          while maintaining quality. All processing happens in your browser.
        </motion.p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Client-side processing means instant results with no upload wait times",
              delay: 0.4
            },
            {
              icon: Shield,
              title: "100% Private",
              description: "Your files never leave your device. Everything happens locally",
              delay: 0.5
            },
            {
              icon: ImageIcon,
              title: "Multiple Formats",
              description: (
                <>
                  <strong>Images:</strong> JPEG, PNG, WEBP, AVIF, GIF<br/>
                  <strong>Video:</strong> MP4<br/>
                  <strong>Audio:</strong> MP3, WAV<br/>
                  <span className="text-xs">Convert between any format instantly.</span>
                </>
              ),
              delay: 0.6
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upload Zone */}
      {images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
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
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Files</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {images.length}
                  </p>
                </motion.div>
                <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">Processed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Object.keys(processedImages).length}/{images.length}
                  </p>
                </motion.div>
                {Object.keys(processedImages).length > 0 && (
                  <>
                    <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Savings</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {savingsPercent}%
                      </p>
                    </motion.div>
                  </>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {unprocessedCount > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={processAllImages}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Process All Remaining
                    </Button>
                  </motion.div>
                )}
                {Object.keys(processedImages).length > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={downloadAll}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All ({Object.keys(processedImages).length})
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Add More Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <input
              type="file"
              multiple
              accept="image/*,video/mp4,audio/mp3,audio/wav,audio/mpeg"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="add-more"
            />
            <Button
              variant="outline"
              className="w-full h-16 border-2 border-dashed hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Add More Files
            </Button>
          </motion.div>

          {/* Images Grid with Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
                >
                  {images.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging 
                              ? `${provided.draggableProps.style?.transform} scale(1.05)`
                              : provided.draggableProps.style?.transform
                          }}
                        >
                          <Suspense fallback={<ImageCardSkeleton />}>
                            <MediaCard
                              image={image.file}
                              onRemove={() => removeImage(image.id)}
                              onProcessed={(data) => handleImageProcessed(image.id, data)}
                              onCompare={handleCompare}
                              autoProcess={!processedImages[image.id] && autoProcessTrigger}
                            />
                          </Suspense>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
            mediaType={comparisonData.mediaType}
            fileFormat={comparisonData.fileFormat}
          />
        </Suspense>
      )}
    </div>
  );
}
