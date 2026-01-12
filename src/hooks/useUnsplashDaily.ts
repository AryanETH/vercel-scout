import { useState, useEffect } from 'react';

const STORAGE_KEY = 'yourel-unsplash-daily-v2'; // New key to clear old cache
const ROTATION_KEY = 'yourel-unsplash-rotation-index';

// Verified Unsplash landscape images with direct URLs
// All images are landscape orientation and verified working
const UNSPLASH_IMAGES = [
  // === CINEMATIC - Moody, atmospheric landscapes ===
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    photographer: 'Samuel Ferrara',
    photographerUrl: 'https://unsplash.com/@samferrara',
    alt: 'Mountain Peaks at Sunset'
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    photographer: 'v2osk',
    photographerUrl: 'https://unsplash.com/@v2osk',
    alt: 'Foggy Mountain Valley'
  },
  {
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    photographer: 'Matt Hardy',
    photographerUrl: 'https://unsplash.com/@matthardy',
    alt: 'Ocean Waves'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    photographer: 'David Marcu',
    photographerUrl: 'https://unsplash.com/@davidmarcu',
    alt: 'Mountain Sunrise'
  },
  
  // === CLEAN - Clear skies, mountain ranges ===
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    photographer: 'Kalen Emsley',
    photographerUrl: 'https://unsplash.com/@kalenemsley',
    alt: 'Alpine Mountain Peak'
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
    photographer: 'Pietro De Grandi',
    photographerUrl: 'https://unsplash.com/@pietrodegrandi',
    alt: 'Lake Reflection'
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
    photographer: 'Robert Bye',
    photographerUrl: 'https://unsplash.com/@robertbye',
    alt: 'Green Rolling Hills'
  },
  
  // === TECH/CITIES - Urban, neon, night ===
  {
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
    photographer: 'Luca Bravo',
    photographerUrl: 'https://unsplash.com/@lucabravo',
    alt: 'City Skyline at Night'
  },
  {
    url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&q=80',
    photographer: 'Jezael Melgoza',
    photographerUrl: 'https://unsplash.com/@jezar',
    alt: 'Tokyo Neon Streets'
  },
  {
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80',
    photographer: 'Pedro Lastra',
    photographerUrl: 'https://unsplash.com/@peterlaster',
    alt: 'New York Skyline'
  },
  
  // === NATURE/FOREST ===
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    photographer: 'Lukasz Szmigiel',
    photographerUrl: 'https://unsplash.com/@szmigieldesign',
    alt: 'Forest Sunlight'
  },
  {
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
    photographer: 'Robert Lukeman',
    photographerUrl: 'https://unsplash.com/@robertlukeman',
    alt: 'Waterfall in Forest'
  },
  {
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80',
    photographer: 'Luca Baggio',
    photographerUrl: 'https://unsplash.com/@luca42',
    alt: 'Misty Forest'
  },
  
  // === MOUNTAINS & SNOW ===
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    photographer: 'Joshua Earle',
    photographerUrl: 'https://unsplash.com/@joshuaearle',
    alt: 'Snowy Mountain'
  },
  {
    url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1920&q=80',
    photographer: 'Daniele Levis Pelusi',
    photographerUrl: 'https://unsplash.com/@yogidan2012',
    alt: 'Desert Dunes'
  },
  
  // === WATER & LAKES ===
  {
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
    photographer: 'Ray Bilcliff',
    photographerUrl: 'https://unsplash.com/@raybilcliff',
    alt: 'Autumn Lake'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    photographer: 'Luca Bravo',
    photographerUrl: 'https://unsplash.com/@lucabravo',
    alt: 'Mountain Lake Sunset'
  },
  
  // === SKY & AURORA ===
  {
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80',
    photographer: 'Tim Swaan',
    photographerUrl: 'https://unsplash.com/@timswaanphotography',
    alt: 'Northern Lights'
  },
  {
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    photographer: 'Jonatan Pie',
    photographerUrl: 'https://unsplash.com/@r3dmax',
    alt: 'Aurora Borealis'
  },
  
  // === BEACH & COAST ===
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    photographer: 'Sean Oulashin',
    photographerUrl: 'https://unsplash.com/@oulashin',
    alt: 'Tropical Beach'
  }
];

interface DailyImage {
  url: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
}

interface DailyImagesCache {
  date: string;
  images: DailyImage[];
}

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Generate a seed from date for consistent daily selection
function getDateSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Shuffle array with seed for consistent daily shuffle
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Get 5 images for today (consistent across the day)
function getDailyImages(date: string): DailyImage[] {
  const seed = getDateSeed(date);
  const shuffled = seededShuffle(UNSPLASH_IMAGES, seed);
  
  // Take first 5 images from shuffled array
  return shuffled.slice(0, 5);
}

// Get and increment rotation index (0-4, cycles on each refresh)
function getRotationIndex(): number {
  const stored = localStorage.getItem(ROTATION_KEY);
  let index = stored ? parseInt(stored, 10) : 0;
  
  // Ensure valid range
  if (isNaN(index) || index < 0 || index > 4) {
    index = 0;
  }
  
  // Increment for next refresh (cycle 0-4)
  const nextIndex = (index + 1) % 5;
  localStorage.setItem(ROTATION_KEY, nextIndex.toString());
  
  return index;
}

export function useUnsplashDaily() {
  const [dailyImage, setDailyImage] = useState<DailyImage | null>(null);
  const [dailyImages, setDailyImages] = useState<DailyImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDailyImages = () => {
      const today = getTodayDate();
      
      try {
        // Check if we have today's images cached
        const cached = localStorage.getItem(STORAGE_KEY);
        let images: DailyImage[];
        
        if (cached) {
          const cachedData: DailyImagesCache = JSON.parse(cached);
          if (cachedData.date === today && cachedData.images?.length === 5) {
            // Use cached images
            images = cachedData.images;
          } else {
            // New day, generate new images and reset rotation
            images = getDailyImages(today);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, images }));
            localStorage.setItem(ROTATION_KEY, '0'); // Reset rotation for new day
          }
        } else {
          // First time, generate images
          images = getDailyImages(today);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, images }));
        }
        
        // Get current rotation index (increments on each page load)
        const rotationIndex = getRotationIndex();
        
        setDailyImages(images);
        setCurrentIndex(rotationIndex);
        setDailyImage(images[rotationIndex]);
        
      } catch (err) {
        console.error('Unsplash image error:', err);
        setError('Failed to load daily images');
        
        // Fallback to first image from the list
        const fallbackImage = UNSPLASH_IMAGES[0];
        setDailyImage(fallbackImage);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyImages();
  }, []);

  return { 
    dailyImage, 
    dailyImages, 
    currentIndex, 
    isLoading, 
    error,
    totalImages: 5
  };
}
