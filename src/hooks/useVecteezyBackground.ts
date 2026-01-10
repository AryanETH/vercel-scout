import { useState, useEffect, useCallback } from 'react';

interface BackgroundImage {
  id: string;
  url: string;
  title: string;
  contributor: string;
  category: string;
}

// Beautiful curated background images
const backgroundImages: BackgroundImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    title: 'Mountain Peaks',
    contributor: 'Samuel Ferrara',
    category: 'mountains'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    title: 'Nature Valley',
    contributor: 'David Marcu',
    category: 'nature'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    title: 'Ocean Waves',
    contributor: 'Matt Hardy',
    category: 'ocean'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    title: 'Forest Sunlight',
    contributor: 'Lukasz Szmigiel',
    category: 'forest'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    title: 'Sunset Sky',
    contributor: 'Luca Bravo',
    category: 'sunset'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    title: 'Foggy Mountains',
    contributor: 'v2osk',
    category: 'mountains'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
    title: 'Waterfall',
    contributor: 'Robert Lukeman',
    category: 'nature'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
    title: 'Lake Reflection',
    contributor: 'Pietro De Grandi',
    category: 'landscape'
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
    title: 'Green Hills',
    contributor: 'Robert Bye',
    category: 'nature'
  },
  {
    id: '10',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    title: 'Alpine Peak',
    contributor: 'Kalen Emsley',
    category: 'mountains'
  }
];

export function useVecteezyBackground() {
  const [currentImage, setCurrentImage] = useState<BackgroundImage>(backgroundImages[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload the first image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImages[0].url;
    img.onload = () => setIsLoaded(true);
  }, []);

  // Rotate images every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % backgroundImages.length;
        
        // Preload next image
        const nextNextIndex = (nextIndex + 1) % backgroundImages.length;
        const preloadImg = new Image();
        preloadImg.src = backgroundImages[nextNextIndex].url;
        
        setCurrentImage(backgroundImages[nextIndex]);
        return nextIndex;
      });
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    currentImage,
    isLoaded,
    totalImages: backgroundImages.length,
    currentIndex
  };
}