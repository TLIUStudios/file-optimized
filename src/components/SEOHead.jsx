import { useEffect } from 'react';

export default function SEOHead({ 
  title = "File Optimized - Compress, Upscale & Convert Media Files",
  description = "Professional file optimization tool. Compress images, videos, and audio. Upscale photos with AI. Convert between formats. Fast, secure, and privacy-focused.",
  image = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69100dedd17537e37249237a/cd98bb516_image.png",
  url = typeof window !== 'undefined' ? window.location.href : ""
}) {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`) || 
                    document.querySelector(`meta[name="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Standard meta tags
    updateMeta('description', description);
    
    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:url', url);
    updateMeta('og:type', 'website');
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    
    // Additional SEO tags
    updateMeta('robots', 'index, follow');
    updateMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
  }, [title, description, image, url]);
  
  return null;
}