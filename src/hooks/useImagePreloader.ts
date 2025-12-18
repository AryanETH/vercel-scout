import { useState, useEffect } from 'react';

interface ImageCache {
  [key: string]: string;
}

export function useImagePreloader(imageSrc: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `yourel_image_${imageSrc}`;
    
    // Check if image is already cached in localStorage
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      setCachedSrc(cachedImage);
      setIsLoaded(true);
      return;
    }

    // Preload and cache the image
    const img = new Image();
    img.onload = () => {
      // Convert image to base64 and cache it
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/png');
          localStorage.setItem(cacheKey, base64);
          setCachedSrc(base64);
        } catch (error) {
          // If localStorage is full or unavailable, use original src
          setCachedSrc(imageSrc);
        }
      } else {
        setCachedSrc(imageSrc);
      }
      
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      // Fallback to original src if loading fails
      setCachedSrc(imageSrc);
      setIsLoaded(true);
    };
    
    img.src = imageSrc;
  }, [imageSrc]);

  return { isLoaded, cachedSrc };
}

// Preload critical images on app start
export function preloadCriticalImages() {
  const criticalImages = ['/yourel-logo.png'];
  
  criticalImages.forEach(src => {
    const cacheKey = `yourel_image_${src}`;
    
    // Skip if already cached
    if (localStorage.getItem(cacheKey)) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/png');
          localStorage.setItem(cacheKey, base64);
        } catch (error) {
          console.log('Could not cache image:', src);
        }
      }
    };
    
    img.src = src;
  });
}