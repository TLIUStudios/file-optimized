import { useState, lazy, Suspense, useEffect, useMemo, useCallback, memo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Sparkles, Shield, Zap, Image as ImageIcon, FolderPlus, TrendingDown, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import SEOHead from "../components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AchievementNotification from "../components/AchievementNotification";

// Lazy load heavy components for better performance
const UploadZone = lazy(() => import("../components/upload/UploadZone"));
const AnimatedMediaIcon = lazy(() => import("../components/AnimatedMediaIcon"));
const DragDropContext = lazy(() => import("@hello-pangea/dnd").then(m => ({ default: m.DragDropContext })));
const Droppable = lazy(() => import("@hello-pangea/dnd").then(m => ({ default: m.Droppable })));
const Draggable = lazy(() => import("@hello-pangea/dnd").then(m => ({ default: m.Draggable })));

const LoginPromptModal = lazy(() => import("../components/LoginPromptModal"));
const ProUpgradeModal = lazy(() => import("../components/ProUpgradeModal"));
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
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);

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

  // Check for achievements
  const checkAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Get user's existing achievements
      const existingAchievements = await base44.entities.Achievement.list();
      const unlockedIds = existingAchievements.map(a => a.achievement_id);

      // Get user's compression stats
      const stats = await base44.entities.CompressionStat.filter({ created_by: user.email });
      const totalFiles = stats.length;
      const totalSaved = stats.reduce((sum, s) => sum + (s.original_size - s.compressed_size), 0);

      // Check compression count achievements
      const countAchievements = [
        { id: 'first_compress', threshold: 1 },
        { id: 'compress_10', threshold: 10 },
        { id: 'compress_50', threshold: 50 },
        { id: 'compress_100', threshold: 100 },
        { id: 'compress_500', threshold: 500 },
      ];

      for (const { id, threshold } of countAchievements) {
        if (totalFiles >= threshold && !unlockedIds.includes(id)) {
          await base44.entities.Achievement.create({ achievement_id: id, unlocked_at: new Date().toISOString() });
          setUnlockedAchievement(id);
          return; // Show one at a time
        }
      }

      // Check space savings achievements
      const savingsAchievements = [
        { id: 'save_100mb', threshold: 100 * 1024 * 1024 },
        { id: 'save_1gb', threshold: 1024 * 1024 * 1024 },
        { id: 'save_10gb', threshold: 10 * 1024 * 1024 * 1024 },
      ];

      for (const { id, threshold } of savingsAchievements) {
        if (totalSaved >= threshold && !unlockedIds.includes(id)) {
          await base44.entities.Achievement.create({ achievement_id: id, unlocked_at: new Date().toISOString() });
          setUnlockedAchievement(id);
          return;
        }
      }

      // Check format explorer achievement
      const usedFormats = new Set(stats.map(s => s.output_format));
      if (usedFormats.size >= 5 && !unlockedIds.includes('all_formats')) {
        await base44.entities.Achievement.create({ achievement_id: 'all_formats', unlocked_at: new Date().toISOString() });
        setUnlockedAchievement('all_formats');
      }
    } catch (error) {
      console.log('Achievement check error:', error);
    }
  }, [user]);

  // Load global compression stats
  const { data: globalStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['globalCompressionStats'],
    queryFn: () => base44.entities.CompressionStat.list('-created_date', 100000),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const globalSavings = useMemo(() => {
    return globalStats.reduce((sum, stat) => 
      sum + (stat.original_size - stat.compressed_size), 0
    );
  }, [globalStats]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }, []);

  const handleFilesSelected = useCallback((files) => {
    startTransition(() => {
      const newFiles = Array.from(files).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file
      }));
      setImages((prev) => [...prev, ...newFiles]);
    });
  }, []);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);
    toast.success('Images reordered!');
  }, [images]);

  const removeImage = useCallback((id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setProcessedImages((prev) => {
      const newProcessed = { ...prev };
      delete newProcessed[id];
      return newProcessed;
    });
  }, []);

  const handleImageProcessed = useCallback((id, data) => {
    setProcessedImages((prev) => {
      const newProcessed = {
        ...prev,
        [id]: data
      };
      return newProcessed;
    });

    // Check for achievements after processing
    setTimeout(() => checkAchievements(), 1000);
  }, [checkAchievements]);

  const handleCompare = useCallback((data) => {
    setComparisonData(data);
  }, []);
  
  const handleFilenameUpdate = useCallback((imageId, newFilename) => {
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
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setProcessedImages({});
    setProcessingStartTime(null);
    setEstimatedTimeRemaining(null);
  }, []);

  const processAllImages = useCallback(async () => {
    const unprocessedImages = images.filter((img) => !processedImages[img.id]);

    if (unprocessedImages.length === 0) {
      toast.success('All images are already processed!');
      return;
    }

    setProcessingStartTime(Date.now());
    setEstimatedTimeRemaining(unprocessedImages.length * 3);
    toast.info(`Processing ${unprocessedImages.length} images...`);
    setAutoProcessTrigger((prev) => prev + 1);
  }, [images, processedImages]);

  const downloadAll = useCallback(async () => {
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
  }, [processedImages]);

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

  const totalOriginalSize = useMemo(() => 
    images.reduce((sum, img) => sum + img.file.size, 0), [images]);
  
  const totalCompressedSize = useMemo(() => 
    Object.values(processedImages).reduce((sum, img) => sum + img.compressedSize, 0), [processedImages]);
  
  const totalSavings = totalOriginalSize - totalCompressedSize;

  const savingsPercent = useMemo(() => 
    totalOriginalSize > 0 ? Math.abs(totalSavings / totalOriginalSize * 100).toFixed(1) : '0', 
    [totalOriginalSize, totalSavings]);

  const unprocessedCount = useMemo(() => 
    images.filter((img) => !processedImages[img.id]).length, [images, processedImages]);

  const sizeIncreased = totalCompressedSize > totalOriginalSize;

  const isPro = userPlan === 'pro';

  return (
    <>
      <SEOHead 
        title="File Optimized - Compress, Upscale & Convert Media Files"
        description="Professional file optimization tool. Compress images up to 90%, upscale photos with AI, convert between formats. Fast, secure, and privacy-focused. Free & Pro plans available."
      />
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

        {/* Global Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: statsLoading ? 0 : 1, scale: statsLoading ? 0.95 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8 max-w-md mx-auto px-4"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Global Impact</h3>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
                <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {globalStats.length > 0 ? formatFileSize(globalSavings) : '0 KB'}
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                saved across <span className="font-semibold text-slate-900 dark:text-white">{globalStats.length > 0 ? globalStats.length.toLocaleString() : '0'}</span> files optimized
              </p>
            </div>
          </div>
        </motion.div>

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
              <Suspense fallback={<ImageIcon className="w-6 h-6 text-white" />}>
                <AnimatedMediaIcon className="w-6 h-6 text-white" />
              </Suspense>
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
      <div>
          <Suspense fallback={<div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
            <UploadZone
            onFilesSelected={handleFilesSelected}
            isDragActive={isDragActive}
            onDragStateChange={setIsDragActive}
            userPlan={userPlan} />
          </Suspense>
        </div>
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
          <div className="relative group">
            <input
            type="file"
            multiple
            accept="image/*,video/mp4,audio/mp3,audio/wav,audio/mpeg"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="absolute inset-0 w-full h-16 opacity-0 cursor-pointer z-10"
            id="add-more"
            title="No file chosen" />

            <div className="w-full h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 rounded-lg transition-all duration-300 flex items-center justify-center pointer-events-none">
              <FolderPlus className="w-5 h-5 mr-2 text-slate-700 dark:text-slate-300" />
              <span className="text-slate-700 dark:text-slate-300">Add More Files</span>
            </div>
          </div>

          {/* Images Grid with Drag & Drop */}
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">{images.map((_, i) => <ImageCardSkeleton key={i} />)}</div>}>
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
          </Suspense>
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
          generatedAnimations={comparisonData.animations || null}
          cachedFormatData={comparisonData.cachedFormatData}
          cachedSeoMetadata={comparisonData.cachedSeoMetadata}
          onFormatDataCached={comparisonData.onFormatDataCached}
          onSeoMetadataCached={comparisonData.onSeoMetadataCached} />

        </Suspense>
      }

      {/* Pro Upgrade Modal */}
      {showProModal && (
        <Suspense fallback={null}>
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
            userPlan={userPlan}
          />
        </Suspense>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <Suspense fallback={null}>
          <LoginPromptModal
            isOpen={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            onLogin={handleLoginFromPrompt}
            context="upgrade"
            userPlan={userPlan}
          />
          </Suspense>
          )}

          {/* Achievement Notification */}
          {unlockedAchievement && (
          <AchievementNotification
          achievementId={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
          />
          )}

          </div>
          </>
          );

          }