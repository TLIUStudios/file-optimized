const loadFFmpeg = async () => {
    if (ffmpegLoading || ffmpegLoaded) return;

    setFfmpegLoading(true);

    try {
      console.log('🎬 Loading FFmpeg...');

      const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      
      console.log('✅ FFmpeg module loaded');
      const ffmpeg = new FFmpeg();

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });

      console.log('🔄 Loading FFmpeg core...');
      
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setFfmpegLoading(false);
      setFfmpegLoadError(null);

      console.log('✅ FFmpeg ready!');
      toast.success('Video/audio processor ready!');

    } catch (error) {
      console.error('❌ FFmpeg error:', error);

      setFfmpegLoading(false);
      setFfmpegLoadError(error.message);

      // Silent fail - video/audio is optional
      console.warn('FFmpeg unavailable - video/audio processing disabled');
    }
  };