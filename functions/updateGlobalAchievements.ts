import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all compression stats
    const allStats = await base44.asServiceRole.entities.CompressionStat.list('-created_date', 100000);
    
    // Calculate global metrics
    const totalFiles = allStats.length;
    const totalSavings = allStats.reduce((sum, stat) => sum + (stat.original_size - stat.compressed_size), 0);
    
    // Count by media type
    const imageCount = allStats.filter(s => s.media_type === 'image').length;
    const videoCount = allStats.filter(s => s.media_type === 'video').length;
    const audioCount = allStats.filter(s => s.media_type === 'audio').length;
    
    // Get unique user count
    const uniqueUsers = new Set(allStats.map(s => s.created_by).filter(Boolean)).size;
    
    // Calculate average savings percentage
    const avgSavingsPercent = allStats.length > 0 
      ? allStats.reduce((sum, s) => sum + ((s.original_size - s.compressed_size) / s.original_size * 100), 0) / allStats.length 
      : 0;

    // Define all global achievements and their tracking logic (100 total)
    const achievementChecks = [
      // File count achievements (19)
      { id: 'global_100', metric: totalFiles, goal: 100 },
      { id: 'global_500', metric: totalFiles, goal: 500 },
      { id: 'global_1000', metric: totalFiles, goal: 1000 },
      { id: 'global_2500', metric: totalFiles, goal: 2500 },
      { id: 'global_5000', metric: totalFiles, goal: 5000 },
      { id: 'global_10000', metric: totalFiles, goal: 10000 },
      { id: 'global_25000', metric: totalFiles, goal: 25000 },
      { id: 'global_50000', metric: totalFiles, goal: 50000 },
      { id: 'global_75000', metric: totalFiles, goal: 75000 },
      { id: 'global_100000', metric: totalFiles, goal: 100000 },
      { id: 'global_150000', metric: totalFiles, goal: 150000 },
      { id: 'global_200000', metric: totalFiles, goal: 200000 },
      { id: 'global_250000', metric: totalFiles, goal: 250000 },
      { id: 'global_500000', metric: totalFiles, goal: 500000 },
      { id: 'global_750000', metric: totalFiles, goal: 750000 },
      { id: 'global_1000000', metric: totalFiles, goal: 1000000 },
      { id: 'global_2500000', metric: totalFiles, goal: 2500000 },
      { id: 'global_5000000', metric: totalFiles, goal: 5000000 },
      { id: 'global_10000000', metric: totalFiles, goal: 10000000 },
      
      // Data saved achievements (23)
      { id: 'global_save_10mb', metric: totalSavings, goal: 10 * 1024 * 1024 },
      { id: 'global_save_50mb', metric: totalSavings, goal: 50 * 1024 * 1024 },
      { id: 'global_save_100mb', metric: totalSavings, goal: 100 * 1024 * 1024 },
      { id: 'global_save_250mb', metric: totalSavings, goal: 250 * 1024 * 1024 },
      { id: 'global_save_500mb', metric: totalSavings, goal: 500 * 1024 * 1024 },
      { id: 'global_save_1gb', metric: totalSavings, goal: 1024 * 1024 * 1024 },
      { id: 'global_save_2gb', metric: totalSavings, goal: 2 * 1024 * 1024 * 1024 },
      { id: 'global_save_5gb', metric: totalSavings, goal: 5 * 1024 * 1024 * 1024 },
      { id: 'global_save_10gb', metric: totalSavings, goal: 10 * 1024 * 1024 * 1024 },
      { id: 'global_save_25gb', metric: totalSavings, goal: 25 * 1024 * 1024 * 1024 },
      { id: 'global_save_50gb', metric: totalSavings, goal: 50 * 1024 * 1024 * 1024 },
      { id: 'global_save_75gb', metric: totalSavings, goal: 75 * 1024 * 1024 * 1024 },
      { id: 'global_save_100gb', metric: totalSavings, goal: 100 * 1024 * 1024 * 1024 },
      { id: 'global_save_250gb', metric: totalSavings, goal: 250 * 1024 * 1024 * 1024 },
      { id: 'global_save_500gb', metric: totalSavings, goal: 500 * 1024 * 1024 * 1024 },
      { id: 'global_save_750gb', metric: totalSavings, goal: 750 * 1024 * 1024 * 1024 },
      { id: 'global_save_1tb', metric: totalSavings, goal: 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_2tb', metric: totalSavings, goal: 2 * 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_5tb', metric: totalSavings, goal: 5 * 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_10tb', metric: totalSavings, goal: 10 * 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_25tb', metric: totalSavings, goal: 25 * 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_50tb', metric: totalSavings, goal: 50 * 1024 * 1024 * 1024 * 1024 },
      { id: 'global_save_100tb', metric: totalSavings, goal: 100 * 1024 * 1024 * 1024 * 1024 },
      
      // User count achievements (16)
      { id: 'global_10_users', metric: uniqueUsers, goal: 10 },
      { id: 'global_25_users', metric: uniqueUsers, goal: 25 },
      { id: 'global_50_users', metric: uniqueUsers, goal: 50 },
      { id: 'global_100_users', metric: uniqueUsers, goal: 100 },
      { id: 'global_250_users', metric: uniqueUsers, goal: 250 },
      { id: 'global_500_users', metric: uniqueUsers, goal: 500 },
      { id: 'global_1000_users', metric: uniqueUsers, goal: 1000 },
      { id: 'global_2500_users', metric: uniqueUsers, goal: 2500 },
      { id: 'global_5000_users', metric: uniqueUsers, goal: 5000 },
      { id: 'global_10000_users', metric: uniqueUsers, goal: 10000 },
      { id: 'global_25000_users', metric: uniqueUsers, goal: 25000 },
      { id: 'global_50000_users', metric: uniqueUsers, goal: 50000 },
      { id: 'global_100000_users', metric: uniqueUsers, goal: 100000 },
      { id: 'global_250000_users', metric: uniqueUsers, goal: 250000 },
      { id: 'global_500000_users', metric: uniqueUsers, goal: 500000 },
      { id: 'global_1000000_users', metric: uniqueUsers, goal: 1000000 },
      
      // Format specific (9)
      { id: 'global_1000_images', metric: imageCount, goal: 1000 },
      { id: 'global_10000_images', metric: imageCount, goal: 10000 },
      { id: 'global_100000_images', metric: imageCount, goal: 100000 },
      { id: 'global_500_videos', metric: videoCount, goal: 500 },
      { id: 'global_5000_videos', metric: videoCount, goal: 5000 },
      { id: 'global_50000_videos', metric: videoCount, goal: 50000 },
      { id: 'global_500_audio', metric: audioCount, goal: 500 },
      { id: 'global_5000_audio', metric: audioCount, goal: 5000 },
      { id: 'global_50000_audio', metric: audioCount, goal: 50000 },
      
      // Weekly/Monthly (6) - Simplified
      { id: 'global_1000_week', metric: 0, goal: 1000 },
      { id: 'global_5000_week', metric: 0, goal: 5000 },
      { id: 'global_10000_week', metric: 0, goal: 10000 },
      { id: 'global_10000_month', metric: 0, goal: 10000 },
      { id: 'global_50000_month', metric: 0, goal: 50000 },
      { id: 'global_100000_month', metric: 0, goal: 100000 },
      
      // Consecutive Activity (4) - Simplified
      { id: 'global_7_days', metric: 0, goal: 7 },
      { id: 'global_30_days', metric: 0, goal: 30 },
      { id: 'global_100_days', metric: 0, goal: 100 },
      { id: 'global_365_days', metric: 0, goal: 365 },
      
      // Efficiency (3)
      { id: 'global_avg_50_savings', metric: avgSavingsPercent, goal: 50 },
      { id: 'global_avg_70_savings', metric: avgSavingsPercent, goal: 70 },
      { id: 'global_avg_80_savings', metric: avgSavingsPercent, goal: 80 },
      
      // Special Events (3) - Requires date tracking
      { id: 'global_holiday_2025', metric: 0, goal: 10000 },
      { id: 'global_newyear_2026', metric: 0, goal: 5000 },
      { id: 'global_summer_2025', metric: 0, goal: 25000 },
      
      // Pro Members (4) - Requires subscription tracking
      { id: 'global_100_pro', metric: 0, goal: 100 },
      { id: 'global_500_pro', metric: 0, goal: 500 },
      { id: 'global_1000_pro', metric: 0, goal: 1000 },
      { id: 'global_5000_pro', metric: 0, goal: 5000 },
      
      // Batch (3) - Requires batch tracking
      { id: 'global_10000_batch', metric: 0, goal: 10000 },
      { id: 'global_50000_batch', metric: 0, goal: 50000 },
      { id: 'global_100000_batch', metric: 0, goal: 100000 },
      
      // Downloads (4) - Requires download tracking
      { id: 'global_10000_downloads', metric: 0, goal: 10000 },
      { id: 'global_50000_downloads', metric: 0, goal: 50000 },
      { id: 'global_100000_downloads', metric: 0, goal: 100000 },
      { id: 'global_1000_zips', metric: 0, goal: 1000 },
      
      // Performance (6) - Requires detailed tracking
      { id: 'global_avg_5mb', metric: totalFiles > 0 ? totalSavings / totalFiles / (1024 * 1024) : 0, goal: 5 },
      { id: 'global_avg_10mb', metric: totalFiles > 0 ? totalSavings / totalFiles / (1024 * 1024) : 0, goal: 10 },
      { id: 'global_peak_hour', metric: 0, goal: 1000 },
      { id: 'global_peak_day', metric: 0, goal: 10000 },
      { id: 'global_fastest_growth', metric: 0, goal: 1000 },
      { id: 'global_community_milestone', metric: totalFiles, goal: 100000 },
      
      // Remaining achievements would need additional tracking entities (18 more)
    ];
    
    // Get existing global achievements
    const existingAchievements = await base44.asServiceRole.entities.GlobalAchievement.list('-created_date', 1000);
    const existingMap = new Map(existingAchievements.map(a => [a.achievement_id, a]));
    
    // Update or create achievements
    for (const check of achievementChecks) {
      const existing = existingMap.get(check.id);
      const completed = check.metric >= check.goal;
      
      if (existing) {
        // Update existing
        if (existing.current_progress !== check.metric || existing.completed !== completed) {
          await base44.asServiceRole.entities.GlobalAchievement.update(existing.id, {
            current_progress: check.metric,
            completed: completed,
            completed_at: completed && !existing.completed ? new Date().toISOString() : existing.completed_at
          });
        }
      } else {
        // Create new
        await base44.asServiceRole.entities.GlobalAchievement.create({
          achievement_id: check.id,
          current_progress: check.metric,
          goal: check.goal,
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        });
      }
    }
    
    return Response.json({
      success: true,
      metrics: {
        totalFiles,
        totalSavings,
        uniqueUsers,
        imageCount,
        videoCount,
        audioCount,
        avgSavingsPercent
      }
    });
    
  } catch (error) {
    console.error('Global achievements update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});