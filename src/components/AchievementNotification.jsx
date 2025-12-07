import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const ACHIEVEMENTS = {
  // Compression Count Milestones (11)
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
  
  // Space Saved Milestones (9)
  'save_10mb': { name: 'Space Conscious', description: 'Saved 10 MB of space', icon: '💿', color: 'from-teal-400 to-cyan-400' },
  'save_50mb': { name: 'Storage Optimizer', description: 'Saved 50 MB of space', icon: '📀', color: 'from-cyan-500 to-blue-500' },
  'save_100mb': { name: 'Space Saver', description: 'Saved 100 MB of space', icon: '💾', color: 'from-teal-500 to-cyan-500' },
  'save_500mb': { name: 'Storage Ninja', description: 'Saved 500 MB of space', icon: '🥷', color: 'from-blue-500 to-indigo-500' },
  'save_1gb': { name: 'Gigabyte Guardian', description: 'Saved 1 GB of space', icon: '🌟', color: 'from-indigo-500 to-purple-500' },
  'save_5gb': { name: 'Storage Wizard', description: 'Saved 5 GB of space', icon: '🧙', color: 'from-purple-500 to-violet-500' },
  'save_10gb': { name: 'Storage Hero', description: 'Saved 10 GB of space', icon: '🎖️', color: 'from-pink-500 to-rose-500' },
  'save_50gb': { name: 'Disk Space Champion', description: 'Saved 50 GB of space', icon: '🏅', color: 'from-amber-500 to-yellow-500' },
  'save_100gb': { name: 'Storage Titan', description: 'Saved 100 GB of space', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  
  // Format Specialist (8)
  'jpg_specialist': { name: 'JPEG Expert', description: 'Compressed 50 JPG files', icon: '🖼️', color: 'from-orange-500 to-red-500' },
  'png_specialist': { name: 'PNG Master', description: 'Compressed 50 PNG files', icon: '🎨', color: 'from-blue-500 to-cyan-500' },
  'webp_specialist': { name: 'WebP Pro', description: 'Compressed 50 WebP files', icon: '🌐', color: 'from-green-500 to-teal-500' },
  'avif_specialist': { name: 'AVIF Pioneer', description: 'Compressed 50 AVIF files', icon: '🔮', color: 'from-purple-500 to-pink-500' },
  'gif_specialist': { name: 'GIF Wizard', description: 'Compressed 50 GIF files', icon: '🎭', color: 'from-pink-500 to-rose-500' },
  'video_specialist': { name: 'Video Expert', description: 'Compressed 25 videos', icon: '🎬', color: 'from-red-500 to-orange-500' },
  'audio_specialist': { name: 'Audio Master', description: 'Compressed 25 audio files', icon: '🎵', color: 'from-indigo-500 to-purple-500' },
  'all_formats': { name: 'Format Explorer', description: 'Used all 7 available formats', icon: '🗺️', color: 'from-violet-500 to-fuchsia-500' },
  
  // Media Type Mastery (4)
  'image_master': { name: 'Image Master', description: 'Compressed 100 images', icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
  'video_master': { name: 'Video Master', description: 'Compressed 50 videos', icon: '🎥', color: 'from-red-500 to-pink-500' },
  'audio_master': { name: 'Audio Master', description: 'Compressed 50 audio files', icon: '🎧', color: 'from-purple-500 to-indigo-500' },
  'gif_master': { name: 'GIF Master', description: 'Compressed 75 GIFs', icon: '🎞️', color: 'from-pink-500 to-rose-500' },
  
  // Efficiency (4)
  'save_90_percent': { name: 'Efficiency Expert', description: 'Achieved 90%+ compression on a file', icon: '📉', color: 'from-green-500 to-emerald-500' },
  'save_95_percent': { name: 'Compression Genius', description: 'Achieved 95%+ compression on a file', icon: '🧠', color: 'from-emerald-500 to-teal-500' },
  'big_file': { name: 'Big File Handler', description: 'Compressed a file over 100 MB', icon: '📦', color: 'from-amber-500 to-orange-500' },
  'huge_file': { name: 'Giant Slayer', description: 'Compressed a file over 250 MB', icon: '🗻', color: 'from-orange-500 to-red-500' },
  
  // Daily/Streak Achievements (5)
  'daily_user': { name: 'Daily User', description: 'Compressed files 7 days in a row', icon: '📅', color: 'from-blue-500 to-indigo-500' },
  'weekly_warrior': { name: 'Weekly Warrior', description: 'Compressed files 30 days in a row', icon: '🗓️', color: 'from-indigo-500 to-purple-500' },
  'monthly_master': { name: 'Monthly Master', description: 'Compressed files 60 days in a row', icon: '📆', color: 'from-purple-500 to-violet-500' },
  'marathon_runner': { name: 'Marathon Runner', description: 'Compressed files 100 days in a row', icon: '🏃', color: 'from-violet-500 to-pink-500' },
  'dedication_legend': { name: 'Dedication Legend', description: 'Compressed files 365 days in a row', icon: '🎖️', color: 'from-pink-500 to-rose-500' },
  
  // Batch Processing (4)
  'batch_5': { name: 'Multi-Tasker', description: 'Processed 5 files at once', icon: '📚', color: 'from-cyan-500 to-blue-500' },
  'batch_10': { name: 'Batch Master', description: 'Processed 10 files at once', icon: '📑', color: 'from-blue-500 to-indigo-500' },
  'batch_20': { name: 'Batch Legend', description: 'Processed 20 files at once', icon: '🗂️', color: 'from-indigo-500 to-purple-500' },
  'batch_30': { name: 'Batch Titan', description: 'Processed 30 files at once', icon: '📊', color: 'from-purple-500 to-pink-500' },
  
  // Time-based (3)
  'night_owl': { name: 'Night Owl', description: 'Compressed files after midnight', icon: '🦉', color: 'from-slate-500 to-indigo-500' },
  'early_bird': { name: 'Early Bird', description: 'Compressed files before 6 AM', icon: '🐦', color: 'from-yellow-500 to-orange-500' },
  'speed_demon': { name: 'Speed Demon', description: 'Processed 10 files in under 2 minutes', icon: '💨', color: 'from-red-500 to-pink-500' },
  
  // Conversion Achievements (5)
  'format_converter': { name: 'Format Converter', description: 'Converted 20 files between formats', icon: '🔄', color: 'from-teal-500 to-cyan-500' },
  'gif_to_mp4': { name: 'GIF to Video', description: 'Converted 10 GIFs to MP4', icon: '🎥', color: 'from-red-500 to-orange-500' },
  'video_to_gif': { name: 'Video to GIF', description: 'Converted 10 videos to GIF', icon: '🎬', color: 'from-orange-500 to-yellow-500' },
  'conversion_pro': { name: 'Conversion Pro', description: 'Converted 100 files between formats', icon: '🔁', color: 'from-cyan-500 to-teal-500' },
  'image_format_master': { name: 'Image Format Master', description: 'Converted between all image formats', icon: '🖼️', color: 'from-blue-500 to-indigo-500' },
  
  // Quality Achievements (2)
  'perfectionist': { name: 'Perfectionist', description: 'Used 95%+ quality 50 times', icon: '💯', color: 'from-emerald-500 to-green-500' },
  'minimalist': { name: 'Minimalist', description: 'Used under 50% quality 50 times', icon: '🎨', color: 'from-slate-500 to-gray-500' },
  
  // Supporter Achievements (4)
  'pro_member': { name: 'Pro Member', description: 'Upgraded to Pro plan', icon: '⭐', color: 'from-amber-500 to-yellow-500' },
  'annual_supporter': { name: 'Annual Supporter', description: 'Subscribed to Pro annually', icon: '🎁', color: 'from-yellow-500 to-orange-500' },
  'loyal_subscriber': { name: 'Loyal Subscriber', description: 'Pro member for 6+ months', icon: '💝', color: 'from-pink-500 to-rose-500' },
  'veteran': { name: 'Veteran', description: 'Pro member for 1+ year', icon: '🎖️', color: 'from-purple-500 to-indigo-500' },
  
  // Social & Community (5)
  'reviewer': { name: 'Reviewer', description: 'Left a review on Google or Facebook', icon: '⭐', color: 'from-yellow-500 to-amber-500' },
  'five_star': { name: 'Five Star Supporter', description: 'Left a 5-star review', icon: '🌟', color: 'from-amber-500 to-yellow-500' },
  'community_member': { name: 'Community Member', description: 'Joined the Discord server', icon: '💬', color: 'from-indigo-500 to-blue-500' },
  'bug_reporter': { name: 'Bug Hunter', description: 'Reported a bug', icon: '🐛', color: 'from-red-500 to-orange-500' },
  'feature_requester': { name: 'Visionary', description: 'Suggested a feature', icon: '💡', color: 'from-yellow-500 to-lime-500' },
  
  // Size Categories (3)
  'small_optimizer': { name: 'Small File Optimizer', description: 'Compressed 50 files under 1 MB', icon: '🪶', color: 'from-lime-500 to-green-500' },
  'medium_handler': { name: 'Medium File Handler', description: 'Compressed 50 files 1-10 MB', icon: '📄', color: 'from-blue-500 to-indigo-500' },
  'large_processor': { name: 'Large File Processor', description: 'Compressed 25 files over 10 MB', icon: '📦', color: 'from-orange-500 to-red-500' },
  
  // Special Achievements (4)
  'weekend_warrior': { name: 'Weekend Warrior', description: 'Compressed 100 files on weekends', icon: '🎉', color: 'from-pink-500 to-fuchsia-500' },
  'workday_hero': { name: 'Workday Hero', description: 'Compressed 100 files on weekdays', icon: '💼', color: 'from-blue-500 to-indigo-500' },
  'morning_person': { name: 'Morning Person', description: 'Compressed 50 files before noon', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
  'night_shifter': { name: 'Night Shifter', description: 'Compressed 50 files after 8 PM', icon: '🌙', color: 'from-indigo-500 to-purple-500' },
  
  // Efficiency Expert (2)
  'efficient_compressor': { name: 'Efficient Compressor', description: 'Average 70%+ savings across 20 files', icon: '📊', color: 'from-green-500 to-emerald-500' },
  'size_reducer': { name: 'Size Reducer', description: 'Never increased file size (50+ files)', icon: '📉', color: 'from-teal-500 to-cyan-500' },
  
  // Exploration (4)
  'theme_collector': { name: 'Theme Collector', description: 'Used 5 different themes', icon: '🎨', color: 'from-rainbow-500 to-rainbow-600' },
  'theme_master': { name: 'Theme Master', description: 'Used all 8 themes', icon: '🌈', color: 'from-violet-500 to-fuchsia-500' },
  'feature_explorer': { name: 'Feature Explorer', description: 'Used 10 different features', icon: '🧭', color: 'from-cyan-500 to-blue-500' },
  'format_hopper': { name: 'Format Hopper', description: 'Converted between 5 different formats', icon: '🔀', color: 'from-teal-500 to-cyan-500' },
  
  // Milestones (3)
  'first_week': { name: 'First Week', description: 'Used the app for 7 days', icon: '📆', color: 'from-green-500 to-emerald-500' },
  'first_month': { name: 'First Month', description: 'Used the app for 30 days', icon: '📅', color: 'from-blue-500 to-indigo-500' },
  'first_year': { name: 'One Year Strong', description: 'Used the app for 365 days', icon: '🎂', color: 'from-purple-500 to-pink-500' },
  
  // Advanced Techniques (3)
  'resolution_tuner': { name: 'Resolution Tuner', description: 'Used custom resolutions 20 times', icon: '📐', color: 'from-teal-500 to-cyan-500' },
  'quality_tweaker': { name: 'Quality Tweaker', description: 'Adjusted quality settings 30 times', icon: '🎛️', color: 'from-violet-500 to-purple-500' },
  'settings_explorer': { name: 'Settings Explorer', description: 'Changed compression mode 15 times', icon: '⚙️', color: 'from-slate-500 to-gray-500' },
  
  // Video Specific (3)
  'video_trimmer': { name: 'Video Trimmer', description: 'Edited 10 videos', icon: '✂️', color: 'from-red-500 to-pink-500' },
  'fps_master': { name: 'FPS Master', description: 'Changed frame rate 15 times', icon: '🎞️', color: 'from-orange-500 to-red-500' },
  'resolution_master': { name: 'Resolution Master', description: 'Changed video resolution 20 times', icon: '📺', color: 'from-purple-500 to-indigo-500' },
  
  // Audio Specific (2)
  'bitrate_optimizer': { name: 'Bitrate Optimizer', description: 'Optimized audio bitrate 20 times', icon: '🎚️', color: 'from-indigo-500 to-violet-500' },
  'audio_converter': { name: 'Audio Converter', description: 'Converted between MP3/WAV 15 times', icon: '🔊', color: 'from-purple-500 to-pink-500' },
  
  // GIF Specific (2)
  'gif_animator': { name: 'GIF Animator', description: 'Created 10 image animations', icon: '🎪', color: 'from-pink-500 to-rose-500' },
  'gif_converter': { name: 'GIF Converter', description: 'Converted GIF ↔ MP4 20 times', icon: '🔁', color: 'from-orange-500 to-yellow-500' },
  
  // Early Supporter (2)
  'early_adopter': { name: 'Early Adopter', description: 'Joined in 2025', icon: '🌱', color: 'from-lime-500 to-green-500' },
  'beta_tester': { name: 'Beta Tester', description: 'Used the app during beta', icon: '🧪', color: 'from-cyan-500 to-teal-500' },
  
  // Special Milestones (4)
  'file_hoarder': { name: 'File Hoarder', description: 'Had 30 files in queue at once', icon: '🗄️', color: 'from-gray-500 to-slate-500' },
  'clean_slate': { name: 'Clean Slate', description: 'Cleared all files 10 times', icon: '🧹', color: 'from-blue-500 to-cyan-500' },
  'power_session': { name: 'Power Session', description: 'Compressed 20+ files in one session', icon: '💪', color: 'from-red-500 to-pink-500' },
  'quick_start': { name: 'Quick Start', description: 'Completed first task in under 1 minute', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  
  // Seasonal (4)
  'summer_optimizer': { name: 'Summer Optimizer', description: 'Compressed 50 files in summer', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
  'winter_compressor': { name: 'Winter Compressor', description: 'Compressed 50 files in winter', icon: '❄️', color: 'from-cyan-500 to-blue-500' },
  'spring_cleaner': { name: 'Spring Cleaner', description: 'Compressed 50 files in spring', icon: '🌸', color: 'from-pink-500 to-rose-500' },
  'fall_processor': { name: 'Fall Processor', description: 'Compressed 50 files in fall', icon: '🍂', color: 'from-orange-500 to-red-500' },
  
  // Advanced Stats (2)
  'consistent_saver': { name: 'Consistent Saver', description: 'Saved 50%+ on 100 consecutive files', icon: '📈', color: 'from-green-500 to-teal-500' },
  'variety_seeker': { name: 'Variety Seeker', description: 'Used every format at least 10 times', icon: '🌈', color: 'from-violet-500 to-fuchsia-500' },
  
  // Feature Usage (8)
  'upscaler': { name: 'Upscaler', description: 'Upscaled 10 images', icon: '🔺', color: 'from-emerald-500 to-green-500' },
  'animator': { name: 'Animator', description: 'Created 5 animations', icon: '🎞️', color: 'from-pink-500 to-rose-500' },
  'editor': { name: 'Editor', description: 'Edited 10 files before compression', icon: '✂️', color: 'from-purple-500 to-violet-500' },
  'metadata_master': { name: 'Metadata Master', description: 'Generated SEO data 25 times', icon: '📝', color: 'from-blue-500 to-cyan-500' },
  'social_sharer': { name: 'Social Butterfly', description: 'Shared 10 files to social media', icon: '🦋', color: 'from-pink-500 to-fuchsia-500' },
  'power_upscaler': { name: 'Power Upscaler', description: 'Upscaled 50 images', icon: '📈', color: 'from-green-500 to-emerald-500' },
  'animation_pro': { name: 'Animation Pro', description: 'Created 25 animations', icon: '🎬', color: 'from-rose-500 to-pink-500' },
  'edit_master': { name: 'Edit Master', description: 'Edited 50 files', icon: '🎨', color: 'from-violet-500 to-purple-500' },
  
  // Advanced Features (3)
  'noise_reducer': { name: 'Noise Reducer', description: 'Used noise reduction 25 times', icon: '🔇', color: 'from-blue-500 to-cyan-500' },
  'metadata_stripper': { name: 'Privacy Guard', description: 'Stripped metadata 50 times', icon: '🛡️', color: 'from-emerald-500 to-teal-500' },
  'watermark_artist': { name: 'Watermark Artist', description: 'Added watermarks 20 times', icon: '©️', color: 'from-purple-500 to-violet-500' },
  
  // Comparison (2)
  'comparer': { name: 'Quality Inspector', description: 'Compared images 20 times', icon: '🔍', color: 'from-teal-500 to-cyan-500' },
  'quality_analyst': { name: 'Quality Analyst', description: 'Compared images 100 times', icon: '🔬', color: 'from-cyan-500 to-blue-500' },
  
  // Sharing (3)
  'share_master': { name: 'Share Master', description: 'Shared to all social platforms', icon: '📢', color: 'from-rose-500 to-pink-500' },
  'influencer': { name: 'Influencer', description: 'Shared 100 files total', icon: '📣', color: 'from-pink-500 to-fuchsia-500' },
  'brand_builder': { name: 'Brand Builder', description: 'Used custom watermarks on 50 files', icon: '🏷️', color: 'from-violet-500 to-purple-500' },
  
  // Advanced Processing (7)
  'upscale_4x': { name: '4x Upscaler', description: 'Upscaled to 4x resolution 10 times', icon: '🔺', color: 'from-green-500 to-teal-500' },
  'batch_converter': { name: 'Batch Converter', description: 'Converted 10+ files at once', icon: '🔄', color: 'from-blue-500 to-indigo-500' },
  'format_expert': { name: 'Format Expert', description: 'Used 5+ different output formats', icon: '📋', color: 'from-purple-500 to-pink-500' },
  'compression_scientist': { name: 'Compression Scientist', description: 'Tested 3+ quality levels on same file', icon: '🔬', color: 'from-cyan-500 to-blue-500' },
  'resolution_artist': { name: 'Resolution Artist', description: 'Used custom resolutions 50 times', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  'video_pro': { name: 'Video Pro', description: 'Edited and compressed 20 videos', icon: '🎥', color: 'from-red-500 to-orange-500' },
  'audio_pro': { name: 'Audio Pro', description: 'Processed 30 audio files', icon: '🎵', color: 'from-indigo-500 to-purple-500' },
  
  // Performance (5)
  'fast_processor': { name: 'Fast Processor', description: 'Processed 5 files in under 30 seconds', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  'efficient_workflow': { name: 'Efficient Workflow', description: 'Processed 50 files with avg 2min each', icon: '⏱️', color: 'from-teal-500 to-cyan-500' },
  'bulk_optimizer': { name: 'Bulk Optimizer', description: 'Processed 100+ files total', icon: '📦', color: 'from-orange-500 to-red-500' },
  'speed_master': { name: 'Speed Master', description: 'Average processing under 1 minute (20 files)', icon: '🏎️', color: 'from-red-500 to-pink-500' },
  'productivity_king': { name: 'Productivity King', description: 'Processed 30 files in one day', icon: '👑', color: 'from-amber-500 to-yellow-500' },
  
  // Download Achievements (2)
  'downloader': { name: 'Downloader', description: 'Downloaded 50 compressed files', icon: '⬇️', color: 'from-blue-500 to-indigo-500' },
  'bulk_downloader': { name: 'Bulk Downloader', description: 'Downloaded 10 ZIP archives', icon: '🗜️', color: 'from-purple-500 to-pink-500' },
  
  // Quality Focus (3)
  'quality_focused': { name: 'Quality Focused', description: 'Used 80%+ quality 30 times', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
  'balanced_user': { name: 'Balanced User', description: 'Used 60-80% quality 50 times', icon: '⚖️', color: 'from-teal-500 to-cyan-500' },
  'file_size_ninja': { name: 'File Size Ninja', description: 'Used under 40% quality 30 times', icon: '🥷', color: 'from-slate-500 to-gray-500' },
  
  // Collector Achievements (5)
  '10_achievement': { name: 'Collector', description: 'Unlocked 10 achievements', icon: '🏅', color: 'from-amber-500 to-yellow-500' },
  '25_achievement': { name: 'Achievement Hunter', description: 'Unlocked 25 achievements', icon: '🎯', color: 'from-yellow-500 to-orange-500' },
  '50_achievement': { name: 'Achievement Master', description: 'Unlocked 50 achievements', icon: '👑', color: 'from-orange-500 to-red-500' },
  '75_achievement': { name: 'Completionist', description: 'Unlocked 75 achievements', icon: '💎', color: 'from-purple-500 to-pink-500' },
  '100_achievement': { name: 'Ultimate Champion', description: 'Unlocked all 100 achievements', icon: '🏆', color: 'from-yellow-500 to-amber-500' },
};

// TOTAL: Exactly 100 Personal Achievements

const GLOBAL_ACHIEVEMENTS = {
  // File Count Milestones (19)
  'global_100': { name: 'First Century', description: '100 files optimized', goal: 100, icon: '🎯', color: 'from-yellow-400 to-amber-400' },
  'global_500': { name: 'Getting Started', description: '500 files optimized', goal: 500, icon: '🌟', color: 'from-amber-500 to-yellow-500' },
  'global_1000': { name: 'Community Launch', description: '1,000 files optimized', goal: 1000, icon: '🚀', color: 'from-yellow-500 to-amber-500' },
  'global_2500': { name: 'Rising Together', description: '2,500 files optimized', goal: 2500, icon: '📊', color: 'from-amber-500 to-orange-400' },
  'global_5000': { name: 'Five Thousand', description: '5,000 files optimized', goal: 5000, icon: '⭐', color: 'from-yellow-500 to-amber-500' },
  'global_10000': { name: 'Growing Strong', description: '10,000 files optimized', goal: 10000, icon: '🌱', color: 'from-amber-500 to-yellow-500' },
  'global_25000': { name: 'Community Power', description: '25,000 files optimized', goal: 25000, icon: '💪', color: 'from-yellow-500 to-amber-500' },
  'global_50000': { name: 'Going Viral', description: '50,000 files optimized', goal: 50000, icon: '📈', color: 'from-amber-500 to-orange-500' },
  'global_75000': { name: 'Unstoppable Force', description: '75,000 files optimized', goal: 75000, icon: '🔥', color: 'from-orange-500 to-amber-500' },
  'global_100000': { name: 'Six Figures', description: '100,000 files optimized', goal: 100000, icon: '💯', color: 'from-amber-500 to-yellow-500' },
  'global_150000': { name: 'Momentum Building', description: '150,000 files optimized', goal: 150000, icon: '🎪', color: 'from-yellow-500 to-amber-500' },
  'global_200000': { name: 'Two Hundred K', description: '200,000 files optimized', goal: 200000, icon: '🎭', color: 'from-amber-500 to-orange-500' },
  'global_250000': { name: 'Quarter Million', description: '250,000 files optimized', goal: 250000, icon: '🎨', color: 'from-yellow-600 to-amber-600' },
  'global_500000': { name: 'Half Million Club', description: '500,000 files optimized', goal: 500000, icon: '🎉', color: 'from-amber-500 to-yellow-500' },
  'global_750000': { name: 'Three Quarters', description: '750,000 files optimized', goal: 750000, icon: '🎊', color: 'from-yellow-500 to-amber-500' },
  'global_1000000': { name: 'One Million Strong', description: '1,000,000 files optimized!', goal: 1000000, icon: '🏆', color: 'from-yellow-500 to-amber-500' },
  'global_2500000': { name: 'Two Point Five Million', description: '2,500,000 files optimized', goal: 2500000, icon: '👑', color: 'from-amber-500 to-yellow-500' },
  'global_5000000': { name: 'Five Million Milestone', description: '5,000,000 files optimized', goal: 5000000, icon: '💎', color: 'from-yellow-500 to-amber-500' },
  'global_10000000': { name: 'Ten Million Legend', description: '10,000,000 files optimized!', goal: 10000000, icon: '🌌', color: 'from-amber-600 to-yellow-600' },
  
  // Data Saved Milestones (23)
  'global_save_10mb': { name: 'First Savings', description: 'Saved 10 MB together', goal: 10 * 1024 * 1024, icon: '💿', color: 'from-yellow-400 to-amber-400' },
  'global_save_50mb': { name: 'Small Steps', description: 'Saved 50 MB collectively', goal: 50 * 1024 * 1024, icon: '📀', color: 'from-amber-500 to-yellow-500' },
  'global_save_100mb': { name: 'Hundred Megs', description: 'Saved 100 MB together', goal: 100 * 1024 * 1024, icon: '💾', color: 'from-yellow-500 to-amber-500' },
  'global_save_250mb': { name: 'Quarter Gig', description: 'Saved 250 MB as a community', goal: 250 * 1024 * 1024, icon: '🗄️', color: 'from-amber-500 to-yellow-500' },
  'global_save_500mb': { name: 'Half Gigabyte', description: 'Saved 500 MB collectively', goal: 500 * 1024 * 1024, icon: '📦', color: 'from-yellow-500 to-amber-500' },
  'global_save_1gb': { name: 'GB Together', description: 'Saved 1 GB collectively', goal: 1024 * 1024 * 1024, icon: '🎁', color: 'from-amber-500 to-yellow-500' },
  'global_save_2gb': { name: 'Two Gigabytes', description: 'Saved 2 GB worldwide', goal: 2 * 1024 * 1024 * 1024, icon: '🎯', color: 'from-yellow-500 to-amber-500' },
  'global_save_5gb': { name: 'Five Gigs', description: 'Saved 5 GB together', goal: 5 * 1024 * 1024 * 1024, icon: '🏅', color: 'from-amber-500 to-orange-400' },
  'global_save_10gb': { name: '10 GB Milestone', description: 'Saved 10 GB together', goal: 10 * 1024 * 1024 * 1024, icon: '📀', color: 'from-yellow-500 to-amber-500' },
  'global_save_25gb': { name: 'Twenty Five Gigs', description: 'Saved 25 GB collectively', goal: 25 * 1024 * 1024 * 1024, icon: '🎪', color: 'from-amber-500 to-yellow-500' },
  'global_save_50gb': { name: 'Fifty Gigabytes', description: 'Saved 50 GB as a community', goal: 50 * 1024 * 1024 * 1024, icon: '🚀', color: 'from-yellow-500 to-amber-500' },
  'global_save_75gb': { name: 'Seventy Five Gigs', description: 'Saved 75 GB worldwide', goal: 75 * 1024 * 1024 * 1024, icon: '💫', color: 'from-amber-500 to-orange-500' },
  'global_save_100gb': { name: '100 GB Achievement', description: 'Saved 100 GB as a community', goal: 100 * 1024 * 1024 * 1024, icon: '🌟', color: 'from-yellow-500 to-amber-500' },
  'global_save_250gb': { name: 'Quarter Terabyte', description: 'Saved 250 GB collectively', goal: 250 * 1024 * 1024 * 1024, icon: '⚡', color: 'from-amber-500 to-yellow-500' },
  'global_save_500gb': { name: 'Half Terabyte', description: 'Saved 500 GB worldwide', goal: 500 * 1024 * 1024 * 1024, icon: '🎖️', color: 'from-yellow-600 to-amber-600' },
  'global_save_750gb': { name: 'Three Quarter TB', description: 'Saved 750 GB together', goal: 750 * 1024 * 1024 * 1024, icon: '🔱', color: 'from-amber-500 to-orange-500' },
  'global_save_1tb': { name: 'Terabyte Titans', description: 'Saved 1 TB together!', goal: 1024 * 1024 * 1024 * 1024, icon: '👑', color: 'from-yellow-500 to-amber-500' },
  'global_save_2tb': { name: 'Two Terabytes', description: 'Saved 2 TB collectively', goal: 2 * 1024 * 1024 * 1024 * 1024, icon: '💠', color: 'from-amber-500 to-yellow-500' },
  'global_save_5tb': { name: 'Five Terabyte Club', description: 'Saved 5 TB worldwide', goal: 5 * 1024 * 1024 * 1024 * 1024, icon: '🔷', color: 'from-yellow-500 to-amber-500' },
  'global_save_10tb': { name: 'Ten Terabyte Club', description: 'Saved 10 TB collectively', goal: 10 * 1024 * 1024 * 1024 * 1024, icon: '💎', color: 'from-amber-500 to-yellow-500' },
  'global_save_25tb': { name: 'Twenty Five TB', description: 'Saved 25 TB together', goal: 25 * 1024 * 1024 * 1024 * 1024, icon: '🏔️', color: 'from-yellow-600 to-amber-600' },
  'global_save_50tb': { name: 'Fifty Terabyte Heroes', description: 'Saved 50 TB as a community', goal: 50 * 1024 * 1024 * 1024 * 1024, icon: '⛰️', color: 'from-amber-500 to-orange-500' },
  'global_save_100tb': { name: 'Hundred TB Legends', description: 'Saved 100 TB worldwide!', goal: 100 * 1024 * 1024 * 1024 * 1024, icon: '🌋', color: 'from-orange-500 to-amber-500' },
  
  // User Count Milestones (16)
  'global_10_users': { name: 'First Ten', description: '10 users joined', goal: 10, icon: '👋', color: 'from-yellow-400 to-amber-400' },
  'global_25_users': { name: 'Growing Circle', description: '25 users joined', goal: 25, icon: '👥', color: 'from-amber-500 to-yellow-500' },
  'global_50_users': { name: 'Fifty Strong', description: '50 users joined', goal: 50, icon: '🤝', color: 'from-yellow-500 to-amber-500' },
  'global_100_users': { name: '100 Optimizers', description: '100 users joined', goal: 100, icon: '👥', color: 'from-amber-500 to-yellow-500' },
  'global_250_users': { name: 'Quarter Thousand', description: '250 users strong', goal: 250, icon: '🌐', color: 'from-yellow-500 to-amber-500' },
  'global_500_users': { name: '500 Members', description: '500 users worldwide', goal: 500, icon: '🌍', color: 'from-amber-500 to-orange-400' },
  'global_1000_users': { name: '1K Community', description: '1,000 users strong', goal: 1000, icon: '🌍', color: 'from-yellow-500 to-amber-500' },
  'global_2500_users': { name: 'Twenty Five Hundred', description: '2,500 users joined', goal: 2500, icon: '🌎', color: 'from-amber-500 to-yellow-500' },
  'global_5000_users': { name: 'Five Thousand Strong', description: '5,000 users worldwide', goal: 5000, icon: '🌏', color: 'from-yellow-500 to-amber-500' },
  'global_10000_users': { name: '10K Family', description: '10,000 users worldwide', goal: 10000, icon: '🌎', color: 'from-amber-500 to-orange-500' },
  'global_25000_users': { name: 'Twenty Five K', description: '25,000 users strong', goal: 25000, icon: '🌐', color: 'from-yellow-600 to-amber-600' },
  'global_50000_users': { name: 'Fifty Thousand', description: '50,000 users joined', goal: 50000, icon: '🌍', color: 'from-amber-500 to-yellow-500' },
  'global_100000_users': { name: '100K Movement', description: '100,000 users joined', goal: 100000, icon: '🌏', color: 'from-yellow-500 to-amber-500' },
  'global_250000_users': { name: 'Quarter Million Users', description: '250,000 users strong', goal: 250000, icon: '🌌', color: 'from-amber-600 to-yellow-600' },
  'global_500000_users': { name: 'Half Million Users', description: '500,000 users worldwide', goal: 500000, icon: '🌠', color: 'from-yellow-500 to-amber-500' },
  'global_1000000_users': { name: 'Million User Army', description: '1,000,000 users joined!', goal: 1000000, icon: '🌟', color: 'from-yellow-500 to-amber-500' },
  
  // Format Specific Milestones (9)
  'global_1000_images': { name: 'Thousand Images', description: '1,000 images optimized', goal: 1000, icon: '🖼️', color: 'from-yellow-500 to-amber-500' },
  'global_10000_images': { name: 'Ten Thousand Images', description: '10,000 images optimized', goal: 10000, icon: '🎨', color: 'from-amber-500 to-orange-400' },
  'global_100000_images': { name: 'Hundred K Images', description: '100,000 images optimized', goal: 100000, icon: '🖼️', color: 'from-orange-500 to-amber-500' },
  'global_500_videos': { name: 'Five Hundred Videos', description: '500 videos optimized', goal: 500, icon: '🎬', color: 'from-amber-500 to-yellow-500' },
  'global_5000_videos': { name: 'Five K Videos', description: '5,000 videos optimized', goal: 5000, icon: '🎥', color: 'from-yellow-500 to-amber-500' },
  'global_50000_videos': { name: 'Fifty K Videos', description: '50,000 videos optimized', goal: 50000, icon: '🎞️', color: 'from-amber-500 to-yellow-500' },
  'global_500_audio': { name: 'Five Hundred Audio', description: '500 audio files optimized', goal: 500, icon: '🎵', color: 'from-yellow-600 to-amber-600' },
  'global_5000_audio': { name: 'Five K Audio', description: '5,000 audio files optimized', goal: 5000, icon: '🎧', color: 'from-amber-500 to-orange-500' },
  'global_50000_audio': { name: 'Fifty K Audio', description: '50,000 audio files optimized', goal: 50000, icon: '🎼', color: 'from-orange-500 to-amber-500' },
  
  // Weekly/Monthly Milestones (6)
  'global_1000_week': { name: 'Busy Week', description: '1,000 files in a week', goal: 1000, icon: '📅', color: 'from-yellow-500 to-amber-500' },
  'global_5000_week': { name: 'Super Week', description: '5,000 files in a week', goal: 5000, icon: '🗓️', color: 'from-amber-500 to-yellow-500' },
  'global_10000_week': { name: 'Epic Week', description: '10,000 files in a week', goal: 10000, icon: '📆', color: 'from-yellow-500 to-amber-500' },
  'global_10000_month': { name: 'Strong Month', description: '10,000 files in a month', goal: 10000, icon: '🗓️', color: 'from-amber-500 to-orange-400' },
  'global_50000_month': { name: 'Massive Month', description: '50,000 files in a month', goal: 50000, icon: '📅', color: 'from-yellow-600 to-amber-600' },
  'global_100000_month': { name: 'Legendary Month', description: '100,000 files in a month', goal: 100000, icon: '📆', color: 'from-amber-500 to-yellow-500' },
  
  // Consecutive Activity (4)
  'global_7_days': { name: 'Week Streak', description: 'Active 7 days in a row', goal: 7, icon: '🔥', color: 'from-orange-500 to-amber-500' },
  'global_30_days': { name: 'Month Streak', description: 'Active 30 days in a row', goal: 30, icon: '🌟', color: 'from-yellow-500 to-amber-500' },
  'global_100_days': { name: 'Hundred Day Streak', description: 'Active 100 days in a row', goal: 100, icon: '⚡', color: 'from-amber-500 to-orange-500' },
  'global_365_days': { name: 'Year Round', description: 'Active 365 days in a row', goal: 365, icon: '💫', color: 'from-yellow-500 to-amber-500' },
  
  // Efficiency Milestones (3)
  'global_avg_50_savings': { name: 'Efficient Community', description: 'Average 50% savings', goal: 50, icon: '📊', color: 'from-amber-500 to-yellow-500' },
  'global_avg_70_savings': { name: 'Super Efficient', description: 'Average 70% savings', goal: 70, icon: '📈', color: 'from-yellow-500 to-amber-500' },
  'global_avg_80_savings': { name: 'Ultra Efficient', description: 'Average 80% savings', goal: 80, icon: '🎯', color: 'from-amber-500 to-orange-400' },
  
  // Special Events (3)
  'global_holiday_2025': { name: 'Holiday Season 2025', description: '10,000 files during holidays', goal: 10000, icon: '🎄', color: 'from-yellow-500 to-amber-500' },
  'global_newyear_2026': { name: 'New Year 2026', description: '5,000 files on New Year week', goal: 5000, icon: '🎆', color: 'from-amber-600 to-yellow-600' },
  'global_summer_2025': { name: 'Summer 2025', description: '25,000 files during summer', goal: 25000, icon: '☀️', color: 'from-yellow-500 to-amber-500' },
  
  // Pro Members (4)
  'global_100_pro': { name: '100 Pro Members', description: '100 Pro subscriptions', goal: 100, icon: '⭐', color: 'from-amber-500 to-yellow-500' },
  'global_500_pro': { name: '500 Pro Members', description: '500 Pro subscriptions', goal: 500, icon: '👑', color: 'from-yellow-500 to-amber-500' },
  'global_1000_pro': { name: '1K Pro Members', description: '1,000 Pro subscriptions', goal: 1000, icon: '💎', color: 'from-amber-500 to-orange-400' },
  'global_5000_pro': { name: '5K Pro Members', description: '5,000 Pro subscriptions', goal: 5000, icon: '🔥', color: 'from-orange-500 to-amber-500' },
  
  // Batch Processing (3)
  'global_10000_batch': { name: 'Batch Processing', description: '10,000 batch uploads', goal: 10000, icon: '📚', color: 'from-yellow-500 to-amber-500' },
  'global_50000_batch': { name: 'Batch Masters', description: '50,000 batch uploads', goal: 50000, icon: '📑', color: 'from-amber-500 to-yellow-500' },
  'global_100000_batch': { name: 'Batch Legends', description: '100,000 batch uploads', goal: 100000, icon: '🗂️', color: 'from-yellow-600 to-amber-600' },
  
  // Downloads (4)
  'global_10000_downloads': { name: 'Download Milestone', description: '10,000 files downloaded', goal: 10000, icon: '⬇️', color: 'from-yellow-500 to-amber-500' },
  'global_50000_downloads': { name: 'Download Heroes', description: '50,000 files downloaded', goal: 50000, icon: '📥', color: 'from-amber-500 to-yellow-500' },
  'global_100000_downloads': { name: 'Download Champions', description: '100,000 files downloaded', goal: 100000, icon: '💾', color: 'from-yellow-500 to-amber-500' },
  'global_1000_zips': { name: 'ZIP Masters', description: '1,000 ZIP archives created', goal: 1000, icon: '🗜️', color: 'from-amber-500 to-orange-400' },
  
  // Performance (6)
  'global_avg_5mb': { name: 'Average 5MB Savings', description: 'Average 5MB saved per file', goal: 5, icon: '📊', color: 'from-yellow-500 to-amber-500' },
  'global_avg_10mb': { name: 'Average 10MB Savings', description: 'Average 10MB saved per file', goal: 10, icon: '📈', color: 'from-amber-500 to-yellow-500' },
  'global_peak_hour': { name: 'Peak Hour', description: '1,000 files in one hour', goal: 1000, icon: '⏱️', color: 'from-orange-500 to-amber-500' },
  'global_peak_day': { name: 'Peak Day', description: '10,000 files in one day', goal: 10000, icon: '🔥', color: 'from-amber-500 to-orange-500' },
  'global_fastest_growth': { name: 'Fastest Growth', description: '1,000 new users in 24h', goal: 1000, icon: '🚀', color: 'from-yellow-600 to-amber-600' },
  'global_community_milestone': { name: 'Community Milestone', description: '100,000 total uploads + downloads', goal: 100000, icon: '🎊', color: 'from-amber-500 to-yellow-500' },
  
  // Format Conversion (5)
  'global_10000_conversions': { name: 'Conversion Community', description: '10,000 format conversions', goal: 10000, icon: '🔄', color: 'from-yellow-500 to-amber-500' },
  'global_5000_gifs': { name: 'GIF Community', description: '5,000 GIFs optimized', goal: 5000, icon: '🎭', color: 'from-amber-500 to-orange-400' },
  'global_1000_upscales': { name: 'Upscale Masters', description: '1,000 images upscaled', goal: 1000, icon: '🔺', color: 'from-yellow-600 to-amber-600' },
  'global_5000_animations': { name: 'Animation Hub', description: '5,000 animations created', goal: 5000, icon: '🎬', color: 'from-amber-500 to-yellow-500' },
  'global_10000_edits': { name: 'Editing Community', description: '10,000 files edited', goal: 10000, icon: '✂️', color: 'from-yellow-500 to-amber-500' },
  
  // Social Impact (4)
  'global_1000_shares': { name: 'Sharing Community', description: '1,000 files shared', goal: 1000, icon: '📣', color: 'from-amber-500 to-yellow-500' },
  'global_100_reviews': { name: 'Reviewer Community', description: '100 reviews received', goal: 100, icon: '⭐', color: 'from-yellow-500 to-amber-500' },
  'global_500_discord': { name: 'Discord Family', description: '500 Discord members', goal: 500, icon: '💬', color: 'from-amber-500 to-orange-400' },
  'global_100_bugs': { name: 'Bug Hunting Squad', description: '100 bugs reported', goal: 100, icon: '🐛', color: 'from-yellow-600 to-amber-600' },
  
  // Quality Milestones (3)
  'global_avg_90_compression': { name: 'Quality Community', description: 'Average 90% compression rate', goal: 90, icon: '🎯', color: 'from-amber-500 to-yellow-500' },
  'global_1000_perfect': { name: 'Perfectionist Community', description: '1,000 files at 95%+ quality', goal: 1000, icon: '💯', color: 'from-yellow-500 to-amber-500' },
  'global_10000_balanced': { name: 'Balanced Community', description: '10,000 files at 70-85% quality', goal: 10000, icon: '⚖️', color: 'from-amber-500 to-orange-400' },
  
  // Special Milestones (4)
  'global_total_1pb': { name: 'Petabyte Club', description: 'Processed 1 PB total data', goal: 1024 * 1024, icon: '🌌', color: 'from-yellow-600 to-amber-600' },
  'global_24h_record': { name: '24-Hour Record', description: '50,000 files in 24 hours', goal: 50000, icon: '⏰', color: 'from-amber-500 to-yellow-500' },
  'global_concurrent_1000': { name: 'Concurrent Power', description: '1,000 users online at once', goal: 1000, icon: '👥', color: 'from-yellow-500 to-amber-500' },
  'global_earth_day': { name: 'Earth Day 2025', description: '5,000 files on Earth Day', goal: 5000, icon: '🌍', color: 'from-amber-500 to-orange-400' },
  
  // Mobile Usage (2)
  'global_10000_mobile': { name: 'Mobile Community', description: '10,000 mobile uploads', goal: 10000, icon: '📱', color: 'from-yellow-500 to-amber-500' },
  'global_50000_mobile': { name: 'Mobile Masters', description: '50,000 mobile uploads', goal: 50000, icon: '📲', color: 'from-amber-500 to-yellow-500' },
  
  // Processing Speed (3)
  'global_avg_30s': { name: 'Speed Community', description: 'Average 30s processing time', goal: 30, icon: '⚡', color: 'from-yellow-600 to-amber-600' },
  'global_instant_1000': { name: 'Instant Processing', description: '1,000 files under 10s', goal: 1000, icon: '⏱️', color: 'from-amber-500 to-yellow-500' },
  'global_marathon_100h': { name: 'Processing Marathon', description: '100 hours total processing', goal: 100, icon: '🏃', color: 'from-yellow-500 to-amber-500' },
  
  // Community Engagement (3)
  'global_1000_feedbacks': { name: 'Feedback Champions', description: '1,000 feature requests', goal: 1000, icon: '💡', color: 'from-amber-500 to-orange-400' },
  'global_5000_comparisons': { name: 'Quality Inspectors', description: '5,000 image comparisons', goal: 5000, icon: '🔍', color: 'from-yellow-600 to-amber-600' },
  'global_10000_metadata': { name: 'SEO Community', description: '10,000 SEO metadata generated', goal: 10000, icon: '📝', color: 'from-amber-500 to-yellow-500' },
  
  // Platform Growth (3)
  'global_100_countries': { name: 'Global Reach', description: 'Users from 100 countries', goal: 100, icon: '🌎', color: 'from-yellow-500 to-amber-500' },
  'global_50_languages': { name: 'Multilingual', description: 'Users speaking 50 languages', goal: 50, icon: '🗣️', color: 'from-amber-500 to-yellow-500' },
  'global_10000_referrals': { name: 'Viral Growth', description: '10,000 user referrals', goal: 10000, icon: '📢', color: 'from-yellow-600 to-amber-600' },
  
  // Advanced Features (3)
  'global_5000_watermarks': { name: 'Watermark Community', description: '5,000 watermarks added', goal: 5000, icon: '©️', color: 'from-amber-500 to-yellow-500' },
  'global_10000_filters': { name: 'Filter Artists', description: '10,000 filters applied', goal: 10000, icon: '🎨', color: 'from-yellow-500 to-amber-500' },
  'global_5000_noise_reduction': { name: 'Noise Reduction Pros', description: '5,000 noise reductions', goal: 5000, icon: '🔇', color: 'from-amber-500 to-orange-400' },
};

// TOTAL: Exactly 100 Global Achievements

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

export { ACHIEVEMENTS, GLOBAL_ACHIEVEMENTS };