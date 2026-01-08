import { useState, useEffect } from "react";
import { X, ExternalLink, ShoppingBag, Heart, Image, Box, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function DiscoverModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('discoverModalDismissed');
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('discoverModalDismissed', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
      <DialogContent 
        className="sm:max-w-[620px] p-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-amber-200 dark:border-amber-800/50 shadow-2xl [&>button]:hidden" 
        onPointerDownOutside={handleClose}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
          </div>
          <div className="relative flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">Built by TLIU Studios</h2>
                <p className="text-amber-50 text-sm">Explore our creative ecosystem</p>
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
        <div className="p-6 bg-gradient-to-b from-transparent to-amber-50/30 dark:to-amber-950/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Credits */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl p-5 border border-amber-200/50 dark:border-amber-700/30 shadow-lg"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                Credits
              </h3>
              <div className="space-y-1.5">
                <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/20 border border-transparent hover:border-amber-300 dark:hover:border-amber-700/50 transition-all group">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">Created by TLIU Studios</span>
                </a>
                <a href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x65e4dd3088ab3acb:0x47b7719db967d156!12e1?source=g.page.m.kd._&laa=lu-desktop-review-solicitation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/20 border border-transparent hover:border-amber-300 dark:hover:border-amber-700/50 transition-all group">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">Leave a Google Review</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577274854116&sk=reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/20 border border-transparent hover:border-amber-300 dark:hover:border-amber-700/50 transition-all group">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">Leave a Facebook Review</span>
                </a>
              </div>
            </motion.div>

            {/* More */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl p-5 border border-amber-200/50 dark:border-amber-700/30 shadow-lg"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}