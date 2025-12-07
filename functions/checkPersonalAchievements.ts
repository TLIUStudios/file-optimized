import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing achievements
    const existingAchievements = await base44.entities.Achievement.list();
    const unlockedIds = new Set(existingAchievements.map(a => a.achievement_id));

    // Get user's compression stats
    const stats = await base44.entities.CompressionStat.filter({ created_by: user.email });
    
    if (stats.length === 0) {
      return Response.json({ newAchievements: [] });
    }

    const totalFiles = stats.length;
    const totalSaved = stats.reduce((sum, s) => sum + (s.original_size - s.compressed_size), 0);
    
    // Count by media type
    const imageCount = stats.filter(s => s.media_type === 'image').length;
    const videoCount = stats.filter(s => s.media_type === 'video').length;
    const audioCount = stats.filter(s => s.media_type === 'audio').length;

    // Count by output format
    const formatCounts = {};
    stats.forEach(s => {
      formatCounts[s.output_format] = (formatCounts[s.output_format] || 0) + 1;
    });

    // Count files by size
    const smallFiles = stats.filter(s => s.original_size < 1024 * 1024).length;
    const mediumFiles = stats.filter(s => s.original_size >= 1024 * 1024 && s.original_size <= 10 * 1024 * 1024).length;
    const largeFiles = stats.filter(s => s.original_size > 10 * 1024 * 1024).length;

    // Calculate compression percentages
    const compressionRates = stats.map(s => ((s.original_size - s.compressed_size) / s.original_size) * 100);
    const avgCompression = compressionRates.reduce((a, b) => a + b, 0) / compressionRates.length;

    // Check for high compression achievements
    const has90Percent = compressionRates.some(r => r >= 90);
    const has95Percent = compressionRates.some(r => r >= 95);
    
    // Check for big files
    const hasBigFile = stats.some(s => s.original_size > 100 * 1024 * 1024);
    const hasHugeFile = stats.some(s => s.original_size > 250 * 1024 * 1024);

    // Count by day of week
    const weekendFiles = stats.filter(s => {
      const day = new Date(s.created_date).getDay();
      return day === 0 || day === 6;
    }).length;
    
    const weekdayFiles = totalFiles - weekendFiles;

    // Count by time of day
    const morningFiles = stats.filter(s => {
      const hour = new Date(s.created_date).getHours();
      return hour < 12;
    }).length;

    const nightFiles = stats.filter(s => {
      const hour = new Date(s.created_date).getHours();
      return hour >= 20;
    }).length;

    const nightOwlFiles = stats.filter(s => {
      const hour = new Date(s.created_date).getHours();
      return hour >= 0 && hour < 6;
    }).length;

    const earlyBirdFiles = stats.filter(s => {
      const hour = new Date(s.created_date).getHours();
      return hour < 6;
    }).length;

    // Count by season
    const seasonCounts = { spring: 0, summer: 0, fall: 0, winter: 0 };
    stats.forEach(s => {
      const month = new Date(s.created_date).getMonth();
      if (month >= 2 && month <= 4) seasonCounts.spring++;
      else if (month >= 5 && month <= 7) seasonCounts.summer++;
      else if (month >= 8 && month <= 10) seasonCounts.fall++;
      else seasonCounts.winter++;
    });

    // Check for consistent savings
    const consecutive50Plus = stats.every(s => ((s.original_size - s.compressed_size) / s.original_size) >= 0.5);
    const neverIncreased = stats.every(s => s.compressed_size < s.original_size);

    // Check format variety
    const usedFormats = new Set(stats.map(s => s.output_format));
    const allFormatsUsed10Times = ['jpg', 'png', 'webp', 'avif', 'gif', 'mp4', 'mp3'].every(f => (formatCounts[f] || 0) >= 10);

    // Count high quality compressions
    const highQuality = stats.filter(s => s.quality && s.quality >= 95).length;
    const lowQuality = stats.filter(s => s.quality && s.quality < 50).length;

    // Check account age
    const accountAge = Date.now() - new Date(user.created_date).getTime();
    const daysSinceJoin = Math.floor(accountAge / (1000 * 60 * 60 * 24));
    
    const joinedIn2025 = new Date(user.created_date).getFullYear() === 2025;

    // Build achievement checks
    const achievementChecks = [
      // Compression Count (11)
      { id: 'first_compress', condition: totalFiles >= 1 },
      { id: 'compress_5', condition: totalFiles >= 5 },
      { id: 'compress_10', condition: totalFiles >= 10 },
      { id: 'compress_25', condition: totalFiles >= 25 },
      { id: 'compress_50', condition: totalFiles >= 50 },
      { id: 'compress_100', condition: totalFiles >= 100 },
      { id: 'compress_250', condition: totalFiles >= 250 },
      { id: 'compress_500', condition: totalFiles >= 500 },
      { id: 'compress_1000', condition: totalFiles >= 1000 },
      { id: 'compress_5000', condition: totalFiles >= 5000 },
      { id: 'compress_10000', condition: totalFiles >= 10000 },
      
      // Space Saved (9)
      { id: 'save_10mb', condition: totalSaved >= 10 * 1024 * 1024 },
      { id: 'save_50mb', condition: totalSaved >= 50 * 1024 * 1024 },
      { id: 'save_100mb', condition: totalSaved >= 100 * 1024 * 1024 },
      { id: 'save_500mb', condition: totalSaved >= 500 * 1024 * 1024 },
      { id: 'save_1gb', condition: totalSaved >= 1024 * 1024 * 1024 },
      { id: 'save_5gb', condition: totalSaved >= 5 * 1024 * 1024 * 1024 },
      { id: 'save_10gb', condition: totalSaved >= 10 * 1024 * 1024 * 1024 },
      { id: 'save_50gb', condition: totalSaved >= 50 * 1024 * 1024 * 1024 },
      { id: 'save_100gb', condition: totalSaved >= 100 * 1024 * 1024 * 1024 },
      
      // Format Specialist (8)
      { id: 'jpg_specialist', condition: (formatCounts['jpg'] || 0) >= 50 },
      { id: 'png_specialist', condition: (formatCounts['png'] || 0) >= 50 },
      { id: 'webp_specialist', condition: (formatCounts['webp'] || 0) >= 50 },
      { id: 'avif_specialist', condition: (formatCounts['avif'] || 0) >= 50 },
      { id: 'gif_specialist', condition: (formatCounts['gif'] || 0) >= 50 },
      { id: 'video_specialist', condition: videoCount >= 25 },
      { id: 'audio_specialist', condition: audioCount >= 25 },
      { id: 'all_formats', condition: usedFormats.size >= 7 },
      
      // Efficiency (4)
      { id: 'save_90_percent', condition: has90Percent },
      { id: 'save_95_percent', condition: has95Percent },
      { id: 'big_file', condition: hasBigFile },
      { id: 'huge_file', condition: hasHugeFile },
      
      // Media Type Mastery (4)
      { id: 'image_master', condition: imageCount >= 100 },
      { id: 'video_master', condition: videoCount >= 50 },
      { id: 'audio_master', condition: audioCount >= 50 },
      { id: 'gif_master', condition: (formatCounts['gif'] || 0) >= 75 },
      
      // Size Categories (3)
      { id: 'small_optimizer', condition: smallFiles >= 50 },
      { id: 'medium_handler', condition: mediumFiles >= 50 },
      { id: 'large_processor', condition: largeFiles >= 25 },
      
      // Quality (2)
      { id: 'perfectionist', condition: highQuality >= 50 },
      { id: 'minimalist', condition: lowQuality >= 50 },
      
      // Supporter (4)
      { id: 'pro_member', condition: user.plan === 'pro' },
      { id: 'annual_supporter', condition: user.plan === 'pro' && user.billing_frequency === 'annual' },
      { id: 'loyal_subscriber', condition: user.plan === 'pro' && daysSinceJoin >= 180 },
      { id: 'veteran', condition: user.plan === 'pro' && daysSinceJoin >= 365 },
      
      // Special (4)
      { id: 'weekend_warrior', condition: weekendFiles >= 100 },
      { id: 'workday_hero', condition: weekdayFiles >= 100 },
      { id: 'morning_person', condition: morningFiles >= 50 },
      { id: 'night_shifter', condition: nightFiles >= 50 },
      
      // Time-based (3)
      { id: 'night_owl', condition: nightOwlFiles >= 1 },
      { id: 'early_bird', condition: earlyBirdFiles >= 1 },
      { id: 'speed_demon', condition: false }, // Requires timing logic
      
      // Efficiency Expert (2)
      { id: 'efficient_compressor', condition: avgCompression >= 70 && totalFiles >= 20 },
      { id: 'size_reducer', condition: neverIncreased && totalFiles >= 50 },
      
      // Seasonal (4)
      { id: 'summer_optimizer', condition: seasonCounts.summer >= 50 },
      { id: 'winter_compressor', condition: seasonCounts.winter >= 50 },
      { id: 'spring_cleaner', condition: seasonCounts.spring >= 50 },
      { id: 'fall_processor', condition: seasonCounts.fall >= 50 },
      
      // Advanced Stats (2)
      { id: 'consistent_saver', condition: consecutive50Plus && totalFiles >= 100 },
      { id: 'variety_seeker', condition: allFormatsUsed10Times },
      
      // Milestones (3)
      { id: 'first_week', condition: daysSinceJoin >= 7 },
      { id: 'first_month', condition: daysSinceJoin >= 30 },
      { id: 'first_year', condition: daysSinceJoin >= 365 },
      
      // Early Supporter (2)
      { id: 'early_adopter', condition: joinedIn2025 },
      { id: 'beta_tester', condition: new Date(user.created_date) < new Date('2025-01-01') },
      
      // Collector (5)
      { id: '10_achievement', condition: existingAchievements.length >= 10 },
      { id: '25_achievement', condition: existingAchievements.length >= 25 },
      { id: '50_achievement', condition: existingAchievements.length >= 50 },
      { id: '75_achievement', condition: existingAchievements.length >= 75 },
      { id: '100_achievement', condition: existingAchievements.length >= 100 },
    ];

    // Find new achievements to unlock
    const newAchievements = [];
    for (const check of achievementChecks) {
      if (check.condition && !unlockedIds.has(check.id)) {
        await base44.entities.Achievement.create({
          achievement_id: check.id,
          unlocked_at: new Date().toISOString()
        });
        newAchievements.push(check.id);
        break; // Only unlock one at a time for notification purposes
      }
    }

    return Response.json({ 
      newAchievements,
      totalAchievements: existingAchievements.length + newAchievements.length,
      stats: {
        totalFiles,
        totalSaved,
        imageCount,
        videoCount,
        audioCount
      }
    });

  } catch (error) {
    console.error('Personal achievement check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});