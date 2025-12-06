import { memo } from 'react';
import MediaCard from './MediaCard';

// Memoized version to prevent unnecessary re-renders
export default memo(MediaCard, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.image.name === next.image.name &&
    prev.image.size === next.image.size &&
    prev.autoProcess === next.autoProcess &&
    prev.isPro === next.isPro &&
    prev.onRemove === next.onRemove &&
    prev.onProcessed === next.onProcessed &&
    prev.onCompare === next.onCompare &&
    prev.onFilenameUpdate === next.onFilenameUpdate
  );
});