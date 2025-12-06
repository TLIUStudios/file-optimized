import { memo } from 'react';
import MediaCard from './MediaCard';

// Memoized version to prevent unnecessary re-renders
export default memo(MediaCard, (prev, next) => {
  return (
    prev.image.name === next.image.name &&
    prev.autoProcess === next.autoProcess &&
    prev.isPro === next.isPro
  );
});