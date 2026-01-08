import { useEffect } from 'react';

export default function SEOHead({ 
  title = "File Optimized - Compress, Upscale & Convert Media Files",
  description = "Professional file optimization tool. Compress images, videos, and audio. Upscale photos with AI. Convert between formats. Fast, secure, and privacy-focused.",
  image = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69100dedd17537e37249237a/cd98bb516_image.png",
  url = typeof window !== 'undefined' ? window.location.href : "",
  keywords = "image compression, video compression, audio compression, file optimizer, webp converter, reduce file size, compress images online, video compressor, photo optimizer, media converter"
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
    
    // Update or create link tags
    const updateLink = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };
    
    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'TLIU Studios');
    
    // Canonical URL
    updateLink('canonical', url);
    
    // Open Graph tags
    updateMeta('og:site_name', 'File Optimized');
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:image:alt', title);
    updateMeta('og:url', url);
    updateMeta('og:type', 'website');
    updateMeta('og:locale', 'en_US');
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@TLIUStudios');
    updateMeta('twitter:creator', '@TLIUStudios');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:image:alt', title);
    
    // Additional SEO tags
    updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('googlebot', 'index, follow');
    updateMeta('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');
    updateMeta('theme-color', '#10b981');
    updateMeta('language', 'English');
    
    // Add JSON-LD structured data for better rich snippets
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "File Optimized",
      "description": description,
      "url": url,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "creator": {
        "@type": "Organization",
        "name": "TLIU Studios",
        "url": "https://www.tliu.co"
      },
      "image": image,
      "screenshot": image,
      "featureList": [
        "Image compression and format conversion",
        "Video compression and editing",
        "Audio compression and editing",
        "AI-powered image upscaling",
        "Batch file processing",
        "Client-side processing for privacy"
      ],
      "browserRequirements": "Requires JavaScript and modern browser",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      }
    };
    
    structuredData.textContent = JSON.stringify(schema);
  }, [title, description, image, url, keywords]);
  
  return null;
}