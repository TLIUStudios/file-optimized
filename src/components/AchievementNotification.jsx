import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const ACHIEVEMENTS = {
  'first_compress': { name: 'First Steps', description: 'Compressed your first file', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
  'compress_10': { name: 'Getting Started', description: 'Compressed 10 files', icon: '⚡', color: 'from-green-500 to-emerald-500' },
  'compress_50': { name: 'Compression Pro', description: 'Compressed 50 files', icon: '🚀', color: 'from-purple-500 to-pink-500' },
  'compress_100': { name: 'Compression Master', description: 'Compressed 100 files', icon: '🏆', color: 'from-amber-500 to-orange-500' },
  'compress_500': { name: 'Compression Legend', description: 'Compressed 500 files', icon: '👑', color: 'from-red-500 to-rose-500' },
  'save_100mb': { name: 'Space Saver', description: 'Saved 100 MB of space', icon: '💾', color: 'from-teal-500 to-cyan-500' },
  'save_1gb': { name: 'Gigabyte Guardian', description: 'Saved 1 GB of space', icon: '🌟', color: 'from-indigo-500 to-purple-500' },
  'save_10gb': { name: 'Storage Hero', description: 'Saved 10 GB of space', icon: '🎖️', color: 'from-pink-500 to-rose-500' },
  'all_formats': { name: 'Format Explorer', description: 'Used all available formats', icon: '🎨', color: 'from-violet-500 to-fuchsia-500' },
  'early_adopter': { name: 'Early Adopter', description: 'Joined during beta', icon: '🌱', color: 'from-lime-500 to-green-500' },
};

export default function AchievementNotification({ achievementId, onClose }) {
  const [show, setShow] = useState(true);
  const achievement = ACHIEVEMENTS[achievementId];

  useEffect(() => {
    if (show && achievement) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.1, y: 0.9 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, achievement, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-[9999] pointer-events-auto"
        >
          <div className={`relative bg-gradient-to-r ${achievement.color} p-1 rounded-2xl shadow-2xl`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 pr-12 min-w-[300px] max-w-[400px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Achievement Unlocked!
                    </p>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { ACHIEVEMENTS };