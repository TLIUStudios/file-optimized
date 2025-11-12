{showMetadataViewer && fileMetadata && (
        <Dialog open={showMetadataViewer} onOpenChange={setShowMetadataViewer}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto [&>button]:bg-red-600 [&>button]:hover:bg-red-700 [&>button]:text-white">
            <DialogHeader>
              <DialogTitle>File Metadata</DialogTitle>
              <DialogDescription>
                Comprehensive information about your file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                  {['name', 'type', 'size', 'lastModified'].map(key => 
                    fileMetadata[key] && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                        </span>
                        <span className="text-slate-900 dark:text-white font-mono text-xs">
                          {String(fileMetadata[key])}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Media Properties Section */}
              {(isImage || isVideo || isGif) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    {isVideo ? <Video className="w-4 h-4" /> : isGif ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    {isVideo ? 'Video' : isGif ? 'Animation' : 'Image'} Properties
                  </h3>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                    {['width', 'height', 'aspectRatio', 'megapixels', 'frames', 'totalDuration', 'avgFrameDelay', 'fps', 'duration', 'estimatedBitrate', 'colorDepth'].map(key => 
                      fileMetadata[key] && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                          </span>
                          <span className="text-slate-900 dark:text-white font-mono text-xs">
                            {String(fileMetadata[key])}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Audio Properties Section */}
              {isAudio && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Audio Properties
                  </h3>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                    {['duration', 'estimatedBitrate'].map(key => 
                      fileMetadata[key] && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                          </span>
                          <span className="text-slate-900 dark:text-white font-mono text-xs">
                            {String(fileMetadata[key])}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Compression Info Section */}
              {processed && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Compression Results
                  </h3>
                  <div className="space-y-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                    {['compressedFormat', 'compressedSize', 'savings', 'savingsBytes', 'compressionRatio', 'compressedFrames'].map(key => 
                      fileMetadata[key] && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">
                            {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                          </span>
                          <span className="text-emerald-900 dark:text-emerald-300 font-mono text-xs font-bold">
                            {String(fileMetadata[key])}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Size Comparison Chart (if processed) */}
              {processed && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Size Comparison</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-slate-600 dark:bg-slate-400 flex items-center justify-end pr-2"
                          style={{ width: '100%' }}
                        >
                          <span className="text-xs text-white font-semibold">Original</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono w-20 text-right">{fileMetadata.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-end pr-2"
                          style={{ width: `${(fileMetadata.compressedSizeBytes / fileMetadata.sizeBytes) * 100}%` }}
                        >
                          <span className="text-xs text-white font-semibold">Compressed</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono w-20 text-right">{fileMetadata.compressedSize}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}