import { useState, useEffect } from 'react';

const STORAGE_KEY = 'yourel-unsplash-daily';

// Curated Unsplash images with photographer credits
// These are high-quality nature/landscape images that change daily
const UNSPLASH_IMAGES = [
  {
    id: '1506905925346-21bda4d32df4',
    photographer: 'Samuel Ferrara',
    photographerUrl: 'https://unsplash.com/@samferrara',
    alt: 'Mountain Peaks'
  },
  {
    id: '1469474968028-56623f02e42e',
    photographer: 'David Marcu',
    photographerUrl: 'https://unsplash.com/@davidmarcu',
    alt: 'Nature Valley'
  },
  {
    id: '1518837695005-2083093ee35b',
    photographer: 'Matt Hardy',
    photographerUrl: 'https://unsplash.com/@matthardy',
    alt: 'Ocean Waves'
  },
  {
    id: '1441974231531-c6227db76b6e',
    photographer: 'Lukasz Szmigiel',
    photographerUrl: 'https://unsplash.com/@szmigieldesign',
    alt: 'Forest Sunlight'
  },
  {
    id: '1507003211169-0a1dd7228f2d',
    photographer: 'Luca Bravo',
    photographerUrl: 'https://unsplash.com/@lucabravo',
    alt: 'Sunset Sky'
  },
  {
    id: '1470071459604-3b5ec3a7fe05',
    photographer: 'v2osk',
    photographerUrl: 'https://unsplash.com/@v2osk',
    alt: 'Foggy Mountains'
  },
  {
    id: '1433086966358-54859d0ed716',
    photographer: 'Robert Lukeman',
    photographerUrl: 'https://unsplash.com/@robertlukeman',
    alt: 'Waterfall'
  },
  {
    id: '1501785888041-af3ef285b470',
    photographer: 'Pietro De Grandi',
    photographerUrl: 'https://unsplash.com/@pietrodegrandi',
    alt: 'Lake Reflection'
  },
  {
    id: '1472214103451-9374bd1c798e',
    photographer: 'Robert Bye',
    photographerUrl: 'https://unsplash.com/@robertbye',
    alt: 'Green Hills'
  },
  {
    id: '1464822759023-fed622ff2c3b',
    photographer: 'Kalen Emsley',
    photographerUrl: 'https://unsplash.com/@kalenemsley',
    alt: 'Alpine Peak'
  },
  {
    id: '1500534314209-a25ddb2bd429',
    photographer: 'Joshua Earle',
    photographerUrl: 'https://unsplash.com/@joshuaearle',
    alt: 'Ice & Snow'
  },
  {
    id: '1475924156734-496f6cac6ec1',
    photographer: 'Tim Swaan',
    photographerUrl: 'https://unsplash.com/@timswaanphotography',
    alt: 'Northern Lights'
  },
  {
    id: '1505765050516-f72dcac9c60e',
    photographer: 'Daniele Levis Pelusi',
    photographerUrl: 'https://unsplash.com/@yogidan2012',
    alt: 'Desert Dunes'
  },
  {
    id: '1439066615861-d1af74d74000',
    photographer: 'Ray Bilcliff',
    photographerUrl: 'https://unsplash.com/@raybilcliff',
    alt: 'Autumn Lake'
  },
  {
    id: '1426604966848-d7adac402bff',
    photographer: 'Luca Baggio',
    photographerUrl: 'https://unsplash.com/@luca42',
    alt: 'Misty Forest'
  }
];

interface DailyImage {
  url: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  date: string;
}

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Generate a consistent index from date
function getDayOfYear(date: string): number {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function useUnsplashDaily() {
  const [dailyImage, setDailyImage] = useState<DailyImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDailyImage = () => {
      const today = getTodayDate();
      
      // Check if we already have today's image cached
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedData: DailyImage = JSON.parse(cached);
          if (cachedData.date === today) {
            setDailyImage(cachedData);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse cached image:', e);
      }

      try {
        // Pick image based on day of year for daily rotation
        const dayOfYear = getDayOfYear(today);
        const imageIndex = dayOfYear % UNSPLASH_IMAGES.length;
        const selectedImage = UNSPLASH_IMAGES[imageIndex];

        const newDailyImage: DailyImage = {
          url: `https://images.unsplash.com/photo-${selectedImage.id}?w=1920&q=80`,
          photographer: selectedImage.photographer,
          photographerUrl: selectedImage.photographerUrl,
          alt: selectedImage.alt,
          date: today
        };

        // Cache the image
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDailyImage));
        setDailyImage(newDailyImage);
      } catch (err) {
        console.error('Unsplash image error:', err);
        setError('Failed to load daily image');
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyImage();
  }, []);

  return { dailyImage, isLoading, error };
}
