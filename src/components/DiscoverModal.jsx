import { useState, useEffect } from "react";
import { X, ExternalLink, ShoppingBag, Heart, Image, Box, Sparkles, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function DiscoverModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleOptimization = () => {
      if (!hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    window.addEventListener('firstOptimizationComplete', handleOptimization);
    
    return () => {
      window.removeEventListener('firstOptimizationComplete', handleOptimization);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm" />
      <DialogContent 
        className="sm:max-w-[620px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-amber-200 dark:border-amber-800/50 shadow-2xl [&>button]:hidden" 
        onPointerDownOutside={handleClose}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
          </div>
          <div className="relative flex items-center justify-between pr-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-sm">Built by TLIU Studios</h2>
                <p className="text-amber-50 text-xs sm:text-sm">Explore our creative ecosystem</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-transparent to-amber-50/30 dark:to-amber-950/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Credits */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl p-4 sm:p-5 border border-amber-200/50 dark:border-amber-700/30 shadow-lg"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                Credits
              </h3>
              <div className="space-y-1.5">
                <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Created by TLIU Studios</span>
                </a>
                <a href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x65e4dd3088ab3acb:0x47b7719db967d156!12e1?source=g.page.m.kd._&laa=lu-desktop-review-solicitation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Leave a Google Review</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577274854116&sk=reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Leave a Facebook Review</span>
                </a>
              </div>
            </motion.div>

            {/* More */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl p-4 sm:p-5 border border-amber-200/50 dark:border-amber-700/30 shadow-lg"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                More Apps
              </h3>
              <div className="space-y-1.5">
                <a href="https://www.tliu.co/royalty-free-assets/photos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <Image className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Royalty Free Assets</span>
                </a>
                <a href="https://filegenerated.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <Box className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">File Generated</span>
                </a>
                <a href="https://linkorbs.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <Box className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Link Orbs</span>
                </a>
                <a href="https://shop.tliu.co/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">TLIU Store</span>
                </a>
                <a href="https://www.tliu.co/donate" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-orange-100 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700/50 transition-all group">
                  <Heart className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">Support Us</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 pt-4 border-t border-amber-200 dark:border-amber-700/30"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
              <a href="mailto:Office@TLIU.co" className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                Office@TLIU.co
              </a>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
              <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </a>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
              <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                Support Portal
              </a>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}