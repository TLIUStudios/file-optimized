import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const ACHIEVEMENTS = {
  // Compression Count Milestones
  'first_compress': { name: 'First Steps', description: 'Compressed your first file', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
  'compress_5': { name: 'Quick Learner', description: 'Compressed 5 files', icon: '📚', color: 'from-cyan-500 to-blue-500' },
  'compress_10': { name: 'Getting Started', description: 'Compressed 10 files', icon: '⚡', color: 'from-green-500 to-emerald-500' },
  'compress_25': { name: 'Regular User', description: 'Compressed 25 files', icon: '✨', color: 'from-emerald-500 to-teal-500' },
  'compress_50': { name: 'Compression Pro', description: 'Compressed 50 files', icon: '🚀', color: 'from-purple-500 to-pink-500' },
  'compress_100': { name: 'Compression Master', description: 'Compressed 100 files', icon: '🏆', color: 'from-amber-500 to-orange-500' },
  'compress_250': { name: 'Power User', description: 'Compressed 250 files', icon: '⚙️', color: 'from-orange-500 to-red-500' },
  'compress_500': { name: 'Compression Legend', description: 'Compressed 500 files', icon: '👑', color: 'from-red-500 to-rose-500' },
  'compress_1000': { name: 'Unstoppable', description: 'Compressed 1000 files', icon: '🔥', color: 'from-rose-500 to-pink-500' },
  'compress_5000': { name: 'Elite Optimizer', description: 'Compressed 5000 files', icon: '💎', color: 'from-indigo-500 to-purple-500' },
  'compress_10000': { name: 'Legendary Status', description: 'Compressed 10000 files', icon: '🌟', color: 'from-violet-500 to-fuchsia-500' },
  
  // Space Saved Milestones
  'save_10mb': { name: 'Space Conscious', description: 'Saved 10 MB of space', icon: '💿', color: 'from-teal-400 to-cyan-400' },
  'save_50mb': { name: 'Storage Optimizer', description: 'Saved 50 MB of space', icon: '📀', color: 'from-cyan-500 to-blue-500' },
  'save_100mb': { name: 'Space Saver', description: 'Saved 100 MB of space', icon: '💾', color: 'from-teal-500 to-cyan-500' },
  'save_500mb': { name: 'Storage Ninja', description: 'Saved 500 MB of space', icon: '🥷', color: 'from-blue-500 to-indigo-500' },
  'save_1gb': { name: 'Gigabyte Guardian', description: 'Saved 1 GB of space', icon: '🌟', color: 'from-indigo-500 to-purple-500' },
  'save_5gb': { name: 'Storage Wizard', description: 'Saved 5 GB of space', icon: '🧙', color: 'from-purple-500 to-violet-500' },
  'save_10gb': { name: 'Storage Hero', description: 'Saved 10 GB of space', icon: '🎖️', color: 'from-pink-500 to-rose-500' },
  'save_50gb': { name: 'Disk Space Champion', description: 'Saved 50 GB of space', icon: '🏅', color: 'from-amber-500 to-yellow-500' },
  'save_100gb': { name: 'Storage Titan', description: 'Saved 100 GB of space', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  
  // Format Specialist
  'jpg_specialist': { name: 'JPEG Expert', description: 'Compressed 50 JPG files', icon: '🖼️', color: 'from-orange-500 to-red-500' },
  'png_specialist': { name: 'PNG Master', description: 'Compressed 50 PNG files', icon: '🎨', color: 'from-blue-500 to-cyan-500' },
  'webp_specialist': { name: 'WebP Pro', description: 'Compressed 50 WebP files', icon: '🌐', color: 'from-green-500 to-teal-500' },
  'avif_specialist': { name: 'AVIF Pioneer', description: 'Compressed 50 AVIF files', icon: '🔮', color: 'from-purple-500 to-pink-500' },
  'gif_specialist': { name: 'GIF Wizard', description: 'Compressed 50 GIF files', icon: '🎭', color: 'from-pink-500 to-rose-500' },
  'video_specialist': { name: 'Video Expert', description: 'Compressed 25 videos', icon: '🎬', color: 'from-red-500 to-orange-500' },
  'audio_specialist': { name: 'Audio Master', description: 'Compressed 25 audio files', icon: '🎵', color: 'from-indigo-500 to-purple-500' },
  'all_formats': { name: 'Format Explorer', description: 'Used all 7 available formats', icon: '🗺️', color: 'from-violet-500 to-fuchsia-500' },
  
  // Efficiency Achievements
  'save_90_percent': { name: 'Efficiency Expert', description: 'Achieved 90%+ compression on a file', icon: '📉', color: 'from-green-500 to-emerald-500' },
  'save_95_percent': { name: 'Compression Genius', description: 'Achieved 95%+ compression on a file', icon: '🧠', color: 'from-emerald-500 to-teal-500' },
  'big_file': { name: 'Big File Handler', description: 'Compressed a file over 100 MB', icon: '📦', color: 'from-amber-500 to-orange-500' },
  'huge_file': { name: 'Giant Slayer', description: 'Compressed a file over 250 MB', icon: '🗻', color: 'from-orange-500 to-red-500' },
  
  // Daily/Streak Achievements
  'daily_user': { name: 'Daily User', description: 'Compressed files 7 days in a row', icon: '📅', color: 'from-blue-500 to-indigo-500' },
  'weekly_warrior': { name: 'Weekly Warrior', description: 'Compressed files 30 days in a row', icon: '🗓️', color: 'from-indigo-500 to-purple-500' },
  'marathon_runner': { name: 'Marathon Runner', description: 'Compressed files 100 days in a row', icon: '🏃', color: 'from-purple-500 to-pink-500' },
  
  // Batch Processing
  'batch_5': { name: 'Multi-Tasker', description: 'Processed 5 files at once', icon: '📚', color: 'from-cyan-500 to-blue-500' },
  'batch_10': { name: 'Batch Master', description: 'Processed 10 files at once', icon: '📑', color: 'from-blue-500 to-indigo-500' },
  'batch_20': { name: 'Batch Legend', description: 'Processed 20 files at once', icon: '🗂️', color: 'from-indigo-500 to-purple-500' },
  'batch_30': { name: 'Batch Titan', description: 'Processed 30 files at once', icon: '📊', color: 'from-purple-500 to-pink-500' },
  
  // Time-based
  'night_owl': { name: 'Night Owl', description: 'Compressed files after midnight', icon: '🦉', color: 'from-slate-500 to-indigo-500' },
  'early_bird': { name: 'Early Bird', description: 'Compressed files before 6 AM', icon: '🐦', color: 'from-yellow-500 to-orange-500' },
  'speed_demon': { name: 'Speed Demon', description: 'Processed 10 files in under 2 minutes', icon: '💨', color: 'from-red-500 to-pink-500' },
  
  // Feature Usage
  'upscaler': { name: 'Upscaler', description: 'Upscaled 10 images', icon: '🔺', color: 'from-emerald-500 to-green-500' },
  'animator': { name: 'Animator', description: 'Created 5 animations', icon: '🎞️', color: 'from-pink-500 to-rose-500' },
  'editor': { name: 'Editor', description: 'Edited 10 files before compression', icon: '✂️', color: 'from-purple-500 to-violet-500' },
  'metadata_master': { name: 'Metadata Master', description: 'Generated SEO data 25 times', icon: '📝', color: 'from-blue-500 to-cyan-500' },
  'social_sharer': { name: 'Social Butterfly', description: 'Shared 10 files to social media', icon: '🦋', color: 'from-pink-500 to-fuchsia-500' },
  
  // Conversion Achievements
  'format_converter': { name: 'Format Converter', description: 'Converted 20 files between formats', icon: '🔄', color: 'from-teal-500 to-cyan-500' },
  'gif_to_mp4': { name: 'GIF to Video', description: 'Converted 10 GIFs to MP4', icon: '🎥', color: 'from-red-500 to-orange-500' },
  'video_to_gif': { name: 'Video to GIF', description: 'Converted 10 videos to GIF', icon: '🎬', color: 'from-orange-500 to-yellow-500' },
  
  // Quality Achievements
  'perfectionist': { name: 'Perfectionist', description: 'Used 95%+ quality 50 times', icon: '💯', color: 'from-emerald-500 to-green-500' },
  'minimalist': { name: 'Minimalist', description: 'Used under 50% quality 50 times', icon: '🎨', color: 'from-slate-500 to-gray-500' },
  
  // Supporter Achievements
  'pro_member': { name: 'Pro Member', description: 'Upgraded to Pro plan', icon: '⭐', color: 'from-amber-500 to-yellow-500' },
  'annual_supporter': { name: 'Annual Supporter', description: 'Subscribed to Pro annually', icon: '🎁', color: 'from-yellow-500 to-orange-500' },
  'loyal_subscriber': { name: 'Loyal Subscriber', description: 'Pro member for 6+ months', icon: '💝', color: 'from-pink-500 to-rose-500' },
  'veteran': { name: 'Veteran', description: 'Pro member for 1+ year', icon: '🎖️', color: 'from-purple-500 to-indigo-500' },
  
  // Social & Community
  'reviewer': { name: 'Reviewer', description: 'Left a review on Google or Facebook', icon: '⭐', color: 'from-yellow-500 to-amber-500' },
  'community_member': { name: 'Community Member', description: 'Joined the Discord server', icon: '💬', color: 'from-indigo-500 to-blue-500' },
  'bug_reporter': { name: 'Bug Hunter', description: 'Reported a bug', icon: '🐛', color: 'from-red-500 to-orange-500' },
  'feature_requester': { name: 'Visionary', description: 'Suggested a feature', icon: '💡', color: 'from-yellow-500 to-lime-500' },
  
  // Media Type Mastery
  'image_master': { name: 'Image Master', description: 'Compressed 100 images', icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
  'video_master': { name: 'Video Master', description: 'Compressed 50 videos', icon: '🎥', color: 'from-red-500 to-pink-500' },
  'audio_master': { name: 'Audio Master', description: 'Compressed 50 audio files', icon: '🎧', color: 'from-purple-500 to-indigo-500' },
  'gif_master': { name: 'GIF Master', description: 'Compressed 75 GIFs', icon: '🎞️', color: 'from-pink-500 to-rose-500' },
  
  // Advanced Techniques
  'resolution_tuner': { name: 'Resolution Tuner', description: 'Used custom resolutions 20 times', icon: '📐', color: 'from-teal-500 to-cyan-500' },
  'quality_tweaker': { name: 'Quality Tweaker', description: 'Adjusted quality settings 30 times', icon: '🎛️', color: 'from-violet-500 to-purple-500' },
  'settings_explorer': { name: 'Settings Explorer', description: 'Changed compression mode 15 times', icon: '⚙️', color: 'from-slate-500 to-gray-500' },
  
  // Size Categories
  'small_optimizer': { name: 'Small File Optimizer', description: 'Compressed 50 files under 1 MB', icon: '🪶', color: 'from-lime-500 to-green-500' },
  'medium_handler': { name: 'Medium File Handler', description: 'Compressed 50 files 1-10 MB', icon: '📄', color: 'from-blue-500 to-indigo-500' },
  'large_processor': { name: 'Large File Processor', description: 'Compressed 25 files over 10 MB', icon: '📦', color: 'from-orange-500 to-red-500' },
  
  // Special Achievements
  'weekend_warrior': { name: 'Weekend Warrior', description: 'Compressed 100 files on weekends', icon: '🎉', color: 'from-pink-500 to-fuchsia-500' },
  'workday_hero': { name: 'Workday Hero', description: 'Compressed 100 files on weekdays', icon: '💼', color: 'from-blue-500 to-indigo-500' },
  'morning_person': { name: 'Morning Person', description: 'Compressed 50 files before noon', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
  'night_shifter': { name: 'Night Shifter', description: 'Compressed 50 files after 8 PM', icon: '🌙', color: 'from-indigo-500 to-purple-500' },
  
  // Efficiency Expert
  'efficient_compressor': { name: 'Efficient Compressor', description: 'Average 70%+ savings across 20 files', icon: '📊', color: 'from-green-500 to-emerald-500' },
  'size_reducer': { name: 'Size Reducer', description: 'Never increased file size (50+ files)', icon: '📉', color: 'from-teal-500 to-cyan-500' },
  
  // Download Achievements
  'downloader': { name: 'Downloader', description: 'Downloaded 50 compressed files', icon: '⬇️', color: 'from-blue-500 to-indigo-500' },
  'bulk_downloader': { name: 'Bulk Downloader', description: 'Downloaded 10 ZIP archives', icon: '🗜️', color: 'from-purple-500 to-pink-500' },
  
  // Exploration
  'theme_collector': { name: 'Theme Collector', description: 'Used 5 different themes', icon: '🎨', color: 'from-rainbow-500 to-rainbow-600' },
  'feature_explorer': { name: 'Feature Explorer', description: 'Used 10 different features', icon: '🧭', color: 'from-cyan-500 to-blue-500' },
  
  // Milestones
  'first_week': { name: 'First Week', description: 'Used the app for 7 days', icon: '📆', color: 'from-green-500 to-emerald-500' },
  'first_month': { name: 'First Month', description: 'Used the app for 30 days', icon: '📅', color: 'from-blue-500 to-indigo-500' },
  'first_year': { name: 'One Year Strong', description: 'Used the app for 365 days', icon: '🎂', color: 'from-purple-500 to-pink-500' },
  
  // Comparison
  'comparer': { name: 'Quality Inspector', description: 'Compared images 20 times', icon: '🔍', color: 'from-teal-500 to-cyan-500' },
  
  // Advanced Features
  'noise_reducer': { name: 'Noise Reducer', description: 'Used noise reduction 25 times', icon: '🔇', color: 'from-blue-500 to-cyan-500' },
  'metadata_stripper': { name: 'Privacy Guard', description: 'Stripped metadata 50 times', icon: '🛡️', color: 'from-emerald-500 to-teal-500' },
  
  // Video Specific
  'video_trimmer': { name: 'Video Trimmer', description: 'Edited 10 videos', icon: '✂️', color: 'from-red-500 to-pink-500' },
  'fps_master': { name: 'FPS Master', description: 'Changed frame rate 15 times', icon: '🎞️', color: 'from-orange-500 to-red-500' },
  'resolution_master': { name: 'Resolution Master', description: 'Changed video resolution 20 times', icon: '📺', color: 'from-purple-500 to-indigo-500' },
  
  // Audio Specific
  'bitrate_optimizer': { name: 'Bitrate Optimizer', description: 'Optimized audio bitrate 20 times', icon: '🎚️', color: 'from-indigo-500 to-violet-500' },
  'audio_converter': { name: 'Audio Converter', description: 'Converted between MP3/WAV 15 times', icon: '🔊', color: 'from-purple-500 to-pink-500' },
  
  // GIF Specific
  'gif_animator': { name: 'GIF Animator', description: 'Created 10 image animations', icon: '🎪', color: 'from-pink-500 to-rose-500' },
  'gif_converter': { name: 'GIF Converter', description: 'Converted GIF ↔ MP4 20 times', icon: '🔁', color: 'from-orange-500 to-yellow-500' },
  
  // Early Supporter
  'early_adopter': { name: 'Early Adopter', description: 'Joined in 2025', icon: '🌱', color: 'from-lime-500 to-green-500' },
  'beta_tester': { name: 'Beta Tester', description: 'Used the app during beta', icon: '🧪', color: 'from-cyan-500 to-teal-500' },
  
  // Special Milestones
  'file_hoarder': { name: 'File Hoarder', description: 'Had 30 files in queue at once', icon: '🗄️', color: 'from-gray-500 to-slate-500' },
  'clean_slate': { name: 'Clean Slate', description: 'Cleared all files 10 times', icon: '🧹', color: 'from-blue-500 to-cyan-500' },
  'reprocessor': { name: 'Perfectionist', description: 'Reprocessed same file 5 times', icon: '🔄', color: 'from-purple-500 to-pink-500' },
  
  // Sharing
  'share_master': { name: 'Share Master', description: 'Shared to all social platforms', icon: '📢', color: 'from-rose-500 to-pink-500' },
  
  // Seasonal
  'summer_optimizer': { name: 'Summer Optimizer', description: 'Compressed 50 files in summer', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
  'winter_compressor': { name: 'Winter Compressor', description: 'Compressed 50 files in winter', icon: '❄️', color: 'from-cyan-500 to-blue-500' },
  'spring_cleaner': { name: 'Spring Cleaner', description: 'Compressed 50 files in spring', icon: '🌸', color: 'from-pink-500 to-rose-500' },
  'fall_processor': { name: 'Fall Processor', description: 'Compressed 50 files in fall', icon: '🍂', color: 'from-orange-500 to-red-500' },
  
  // Advanced Stats
  'consistent_saver': { name: 'Consistent Saver', description: 'Saved 50%+ on 100 consecutive files', icon: '📈', color: 'from-green-500 to-teal-500' },
  'variety_seeker': { name: 'Variety Seeker', description: 'Used every format at least 10 times', icon: '🌈', color: 'from-violet-500 to-fuchsia-500' },
  
  // Collector Achievements
  '10_achievement': { name: 'Collector', description: 'Unlocked 10 achievements', icon: '🏅', color: 'from-amber-500 to-yellow-500' },
  '25_achievement': { name: 'Achievement Hunter', description: 'Unlocked 25 achievements', icon: '🎯', color: 'from-yellow-500 to-orange-500' },
  '50_achievement': { name: 'Achievement Master', description: 'Unlocked 50 achievements', icon: '👑', color: 'from-orange-500 to-red-500' },
  '75_achievement': { name: 'Completionist', description: 'Unlocked 75 achievements', icon: '💎', color: 'from-purple-500 to-pink-500' },
  '100_achievement': { name: 'Ultimate Champion', description: 'Unlocked all achievements', icon: '🏆', color: 'from-yellow-500 to-amber-500' },
};

const GLOBAL_ACHIEVEMENTS = {
  'global_1000': { name: 'Community Launch', description: '1,000 files optimized by the community', goal: 1000, icon: '🚀', color: 'from-blue-500 to-cyan-500' },
  'global_10000': { name: 'Growing Strong', description: '10,000 files optimized worldwide', goal: 10000, icon: '🌱', color: 'from-green-500 to-emerald-500' },
  'global_50000': { name: 'Going Viral', description: '50,000 files optimized globally', goal: 50000, icon: '📈', color: 'from-purple-500 to-pink-500' },
  'global_100000': { name: 'Six Figures', description: '100,000 files optimized together', goal: 100000, icon: '💯', color: 'from-amber-500 to-orange-500' },
  'global_500000': { name: 'Half Million Club', description: '500,000 files optimized', goal: 500000, icon: '🎉', color: 'from-rose-500 to-pink-500' },
  'global_1000000': { name: 'One Million Strong', description: '1,000,000 files optimized!', goal: 1000000, icon: '🏆', color: 'from-yellow-500 to-amber-500' },
  
  'global_save_1gb': { name: 'GB Together', description: 'Saved 1 GB collectively', goal: 1024 * 1024 * 1024, icon: '💾', color: 'from-teal-500 to-cyan-500' },
  'global_save_10gb': { name: '10 GB Milestone', description: 'Saved 10 GB together', goal: 10 * 1024 * 1024 * 1024, icon: '📀', color: 'from-blue-500 to-indigo-500' },
  'global_save_100gb': { name: '100 GB Achievement', description: 'Saved 100 GB as a community', goal: 100 * 1024 * 1024 * 1024, icon: '🌟', color: 'from-indigo-500 to-purple-500' },
  'global_save_500gb': { name: 'Half Terabyte', description: 'Saved 500 GB worldwide', goal: 500 * 1024 * 1024 * 1024, icon: '🎖️', color: 'from-purple-500 to-pink-500' },
  'global_save_1tb': { name: 'Terabyte Titans', description: 'Saved 1 TB together!', goal: 1024 * 1024 * 1024 * 1024, icon: '👑', color: 'from-pink-500 to-rose-500' },
  'global_save_10tb': { name: 'Ten Terabyte Club', description: 'Saved 10 TB collectively', goal: 10 * 1024 * 1024 * 1024 * 1024, icon: '💎', color: 'from-amber-500 to-yellow-500' },
  
  'global_100_users': { name: '100 Optimizers', description: '100 users joined', goal: 100, icon: '👥', color: 'from-cyan-500 to-blue-500' },
  'global_1000_users': { name: '1K Community', description: '1,000 users strong', goal: 1000, icon: '🌍', color: 'from-green-500 to-teal-500' },
  'global_10000_users': { name: '10K Family', description: '10,000 users worldwide', goal: 10000, icon: '🌎', color: 'from-purple-500 to-pink-500' },
  'global_100000_users': { name: '100K Movement', description: '100,000 users joined the movement', goal: 100000, icon: '🌏', color: 'from-rose-500 to-red-500' },
};

export default function AchievementNotification({ achievementId, onClose, isGlobal = false }) {
  const [show, setShow] = useState(true);
  const achievement = isGlobal ? GLOBAL_ACHIEVEMENTS[achievementId] : ACHIEVEMENTS[achievementId];

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
                      {isGlobal ? 'Global Achievement!' : 'Achievement Unlocked!'}
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

// Helper function for formatting bytes
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
}

export { ACHIEVEMENTS, GLOBAL_ACHIEVEMENTS };