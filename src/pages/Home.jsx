import { useState, lazy, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Sparkles, Shield, Zap, Image as ImageIcon } from "lucide-react";
import UploadZone from "../components/upload/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import LoginPromptModal from "../components/LoginPromptModal";
import ProUpgradeModal from "../components/ProUpgradeModal";
import AnimatedMediaIcon from "../components/AnimatedMediaIcon";

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
    </div>);

}

export default function Home() {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [autoProcessTrigger, setAutoProcessTrigger] = useState(0);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [showProModal, setShowProModal] = useState(false);
  const [user, setUser] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Load user and their plan
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setUserPlan(currentUser?.plan || 'free');
      } catch (error) {
        console.log('User not logged in or error loading user:', error);
        setUserPlan('free');
      }
    };
    loadUser();
  }, []);

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file
    }));
    setImages((prev) => [...prev, ...newFiles]);
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
    setImages((prev) => prev.filter((img) => img.id !== id));
    setProcessedImages((prev) => {
      const newProcessed = { ...prev };
      delete newProcessed[id];
      return newProcessed;
    });
  };

  const handleImageProcessed = (id, data) => {
    setProcessedImages((prev) => {
      const newProcessed = {
        ...prev,
        [id]: data
      };

      // Update time estimation
      if (processingStartTime && Object.keys(newProcessed).length < images.length) {
        const elapsed = Date.now() - processingStartTime;
        const processedCount = Object.keys(newProcessed).length;
        const avgTimePerImage = processedCount > 0 ? elapsed / processedCount : 0;
        const remainingImages = images.length - processedCount;
        const remaining = remainingImages * avgTimePerImage;
        setEstimatedTimeRemaining(Math.max(0, Math.ceil(remaining / 1000))); // Ensure non-negative
      } else {
        // All images processed or processing not active
        setEstimatedTimeRemaining(null);
        setProcessingStartTime(null);
      }

      return newProcessed;
    });
  };

  const handleCompare = (data) => {
    setComparisonData(data);
  };
  
  const handleFilenameUpdate = (imageId, newFilename) => {
    setProcessedImages((prev) => {
      const existingData = prev[imageId];
      if (!existingData) return prev;
      return {
        ...prev,
        [imageId]: {
          ...existingData,
          filename: newFilename
        }
      };
    });
  };

  const clearAll = () => {
    setImages([]);
    setProcessedImages({});
    setProcessingStartTime(null);
    setEstimatedTimeRemaining(null);
  };

  const processAllImages = async () => {
    const unprocessedImages = images.filter((img) => !processedImages[img.id]);

    if (unprocessedImages.length === 0) {
      toast.success('All images are already processed!');
      return;
    }

    setProcessingStartTime(Date.now());
    // Initial estimate: 3 seconds per image (can be adjusted)
    setEstimatedTimeRemaining(unprocessedImages.length * 3);
    toast.info(`Processing ${unprocessedImages.length} images...`);
    setAutoProcessTrigger((prev) => prev + 1);
  };

  const downloadAll = async () => {
    if (Object.keys(processedImages).length === 0) {
      toast.error('No processed images to download');
      return;
    }

    toast.info('Creating zip file...');

    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    const zip = new JSZip();

    Object.values(processedImages).forEach((img) => {
      zip.file(img.filename, img.compressedBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `compressed-images-${Date.now()}.zip`;
    link.click();

    toast.success('Zip file downloaded!');
  };

  const handleUpgradeToPro = async () => {
    console.log('🚀 Upgrade clicked from Home page');

    setUpgradeError(null);

    try {
      // Try to get the user - this is more reliable than isAuthenticated()
      let currentUser;
      try {
        currentUser = await base44.auth.me();
      } catch (error) {
        console.log('❌ User not logged in (auth.me() failed)');
        setShowProModal(false);
        setShowLoginPrompt(true);
        return;
      }

      if (!currentUser) {
        console.log('❌ No user found');
        setShowProModal(false);
        setShowLoginPrompt(true);
        return;
      }

      console.log('✅ User authenticated:', currentUser.email);

      // Only set processing state AFTER confirming user is authenticated
      setProcessingCheckout(true);
      const toastId = toast.loading('Creating checkout session...', { duration: Infinity });

      console.log('Calling createCheckoutSession...');
      const response = await base44.functions.invoke('createCheckoutSession');

      console.log('Response:', response);

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      const { data } = response;

      // Additional check from backend response (backup)
      if (data.requiresAuth) {
        toast.dismiss(toastId);
        setShowProModal(false);
        setProcessingCheckout(false);
        setShowLoginPrompt(true);
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to:', data.url);
      toast.dismiss(toastId);
      toast.success('Redirecting to Stripe checkout...');

      // Close modal
      setShowProModal(false);

      // Redirect at top level to break out of iframe
      setTimeout(() => {
        if (window.top) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      }, 300);

    } catch (error) {
      console.error('Upgrade failed:', error);
      console.error('Error response data:', error.response?.data);

      // If it's an authentication error, show login prompt instead of error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('❌ Authentication error - showing login prompt');
        setShowProModal(false);
        setShowLoginPrompt(true);
        setProcessingCheckout(false);
        return;
      }

      // Show detailed error from backend
      const errorData = error.response?.data;
      const errorMessage = errorData?.errorDetails || errorData?.error || error.message || 'Failed to start checkout';
      console.error('Detailed error:', errorMessage);
      console.error('Stripe error:', errorData?.stripeError);

      setUpgradeError(errorMessage);
      toast.error(errorMessage, { duration: 8000 });
      setProcessingCheckout(false);
    }
  };

  const handleLoginFromPrompt = () => {
    setShowLoginPrompt(false);
    base44.auth.redirectToLogin(window.location.href);
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const totalCompressedSize = Object.values(processedImages).reduce(
    (sum, img) => sum + img.compressedSize, 0
  );
  const totalSavings = totalOriginalSize - totalCompressedSize;

  // Calculate absolute percentage for display
  const savingsPercent = totalOriginalSize > 0 ?
  Math.abs(totalSavings / totalOriginalSize * 100).toFixed(1) :
  '0';

  const unprocessedCount = images.filter((img) => !processedImages[img.id]).length;

  // Check if compression actually increased total size
  const sizeIncreased = totalCompressedSize > totalOriginalSize;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isPro = userPlan === 'pro';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12">

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">100% Private & Secure</span>
          </div>
          {isPro &&
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              PRO
            </div>
          }
          {!isPro &&
          <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-lg opacity-75 blur animate-pulse" style={{ animationDuration: '2s' }}></div>
              <Button
              onClick={() => setShowProModal(true)}
              className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg overflow-hidden text-xs sm:text-sm"
              size="sm">

                <div className="absolute inset-0">
                  <div className="absolute top-1 left-[15%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute top-1.5 left-[35%] w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
                  <div className="absolute top-1 left-[55%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.6s' }} />
                  <div className="absolute top-1.5 left-[75%] w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.2s' }} />
                  <div className="absolute top-1 left-[85%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '1.9s', animationDelay: '0.8s' }} />
                  <div className="absolute bottom-1 left-[20%] w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.4s' }} />
                  <div className="absolute bottom-1.5 left-[45%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.5s' }} />
                  <div className="absolute bottom-1 left-[70%] w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.7s' }} />
                </div>
                <span className="relative z-10 flex items-center whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Upgrade to Pro
                </span>
              </Button>
            </div>
          }
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 px-4">
          Compress, Upscale, & Convert
          <span className="block text-xl sm:text-2xl md:text-3xl text-emerald-600 dark:text-emerald-400 mt-2 sm:mt-3">Images, Videos, and Audio</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
          Fast, secure, and powerful media compression. Reduce file size by up to 90% 
          while maintaining quality. All processing happens in your browser.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Client-side processing means instant results with little to no upload wait times.

            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">100% Private</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Your files never leave your device. Everything happens locally.

            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <AnimatedMediaIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Images:</strong> JPEG, PNG, WEBP, AVIF, GIF<br />
              <strong>Video:</strong> MP4<br />
              <strong>Audio:</strong> MP3, WAV<br />
              <span className="text-xs">Convert between any format instantly.</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Zone */}
      {images.length === 0 &&
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}>

          <UploadZone
          onFilesSelected={handleFilesSelected}
          isDragActive={isDragActive}
          onDragStateChange={setIsDragActive}
          userPlan={userPlan} />

        </motion.div>
      }

      {/* Images Grid */}
      {images.length > 0 &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6">

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
                {Object.keys(processedImages).length > 0 &&
              <>
                    <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {sizeIncreased ? 'Total Change' : 'Total Savings'}
                      </p>
                      <p className={cn(
                    "text-2xl font-bold",
                    sizeIncreased ?
                    "text-red-600 dark:text-red-400" :
                    "text-emerald-600 dark:text-emerald-400"
                  )}>
                        {sizeIncreased ? '+' : '-'} {savingsPercent}%
                      </p>
                    </div>
                  </>
              }
                {estimatedTimeRemaining !== null &&
              <>
                    <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Time Remaining</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ~{estimatedTimeRemaining}s
                      </p>
                    </div>
                  </>
              }
              </div>

              <div className="flex gap-2 flex-wrap">
                {unprocessedCount > 0 &&
              <Button
                onClick={processAllImages}
                className="bg-blue-600 hover:bg-blue-700 text-white">

                    <Zap className="w-4 h-4 mr-2" />
                    Process All Remaining
                  </Button>
              }
                {Object.keys(processedImages).length > 0 &&
              <Button
                onClick={downloadAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white">

                    <Download className="w-4 h-4 mr-2" />
                    Download All ({Object.keys(processedImages).length})
                  </Button>
              }
                <Button
                onClick={clearAll}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950">

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
            accept="image/*,video/mp4,audio/mp3,audio/wav,audio/mpeg"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="absolute inset-0 w-full h-16 opacity-0 cursor-pointer z-10"
            id="add-more" />

            <Button
            variant="outline"
            className="w-full h-16 border-2 border-dashed hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">

              <Sparkles className="w-5 h-5 mr-2" />
              Add More Files
            </Button>
          </div>

          {/* Images Grid with Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) =>
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

                  {images.map((image, index) =>
              <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) =>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    opacity: snapshot.isDragging ? 0.8 : 1,
                    transform: snapshot.isDragging ?
                    `${provided.draggableProps.style?.transform} scale(1.05)` :
                    provided.draggableProps.style?.transform
                  }}>

                          <Suspense fallback={<ImageCardSkeleton />}>
                            <MediaCard
                      image={image.file}
                      onRemove={() => removeImage(image.id)}
                      onProcessed={(data) => handleImageProcessed(image.id, data)}
                      onCompare={handleCompare}
                      autoProcess={!processedImages[image.id] && autoProcessTrigger}
                      isPro={isPro}
                      onFilenameUpdate={(newFilename) => handleFilenameUpdate(image.id, newFilename)} />

                          </Suspense>
                        </div>
                }
                    </Draggable>
              )}
                  {provided.placeholder}
                </div>
            }
            </Droppable>
          </DragDropContext>
        </motion.div>
      }

      {/* Comparison Modal */}
      {comparisonData &&
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
          originalFileFormat={comparisonData.originalFileFormat}
          generatedAnimations={comparisonData.animations || null} />

        </Suspense>
      }

      {/* Pro Upgrade Modal */}
      {showProModal &&
      <ProUpgradeModal
        key={`pro-modal-${Date.now()}`}
        isOpen={showProModal}
        onClose={() => {
          setShowProModal(false);
          setUpgradeError(null);
          setProcessingCheckout(false);
        }}
        onUpgrade={handleUpgradeToPro}
        processing={processingCheckout}
        error={upgradeError}
        userPlan={userPlan} />

      }

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLoginFromPrompt}
        context="upgrade"
        userPlan={userPlan} />

    </div>);

}