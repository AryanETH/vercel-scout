import { useState, useEffect } from 'react';

const PEXELS_API_KEY = 'bBbzlhy1UX8lr9VtcFaoTmLc2PdelfrTay5LQ6RPWyElPcNhsWutV3Iw';
const STORAGE_KEY = 'yourel-pexels-daily';

// Nature-focused search queries for daily rotation
const NATURE_QUERIES = [
  'mountains landscape hd',
  'nature forest hd',
  'wildlife animals hd',
  'ocean waves hd',
  'sunset nature hd',
  'waterfall nature hd',
  'autumn forest hd',
  'snow mountains hd',
  'tropical beach hd',
  'green valley hd'
];

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };
  alt: string;
}

interface DailyImage {
  url: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  date: string; // YYYY-MM-DD format
}

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Generate a seed number from date for consistent daily image
function getDateSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function usePexelsDaily() {
  const [dailyImage, setDailyImage] = useState<DailyImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyImage = async () => {
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

      // Fetch new image from Pexels
      try {
        setIsLoading(true);
        
        const seed = getDateSeed(today);
        // Pick a nature query based on the day
        const queryIndex = seed % NATURE_QUERIES.length;
        const searchQuery = NATURE_QUERIES[queryIndex];
        const page = (seed % 5) + 1; // Pages 1-5 for variety
        
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=15&page=${page}&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch from Pexels');
        }

        const data = await response.json();
        const photos: PexelsPhoto[] = data.photos;

        if (photos && photos.length > 0) {
          // Pick a photo based on date seed
          const photoIndex = seed % photos.length;
          const photo = photos[photoIndex];

          const newDailyImage: DailyImage = {
            url: photo.src.large2x || photo.src.large,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            alt: photo.alt || searchQuery,
            date: today
          };

          // Cache the image
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newDailyImage));
          setDailyImage(newDailyImage);
        }
      } catch (err) {
        console.error('Pexels API error:', err);
        setError('Failed to load daily image');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyImage();
  }, []);

  return { dailyImage, isLoading, error };
}
