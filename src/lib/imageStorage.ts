import Dexie, { type Table } from 'dexie';

// Define the stored image interface
interface StoredImage {
  id: string;
  name: string;
  data: string; // base64 data
  timestamp: number;
}

// Create Dexie database
class ImageDatabase extends Dexie {
  images!: Table<StoredImage, string>;

  constructor() {
    super('yourel-backgrounds');
    this.version(1).stores({
      images: 'id, name, timestamp'
    });
  }
}

const db = new ImageDatabase();

// localStorage key for the selected background
const SELECTED_BG_KEY = 'yourel-selected-background';
const SHOW_BG_KEY = 'yourel-show-backgrounds';

export const imageStorage = {
  // Save image to IndexedDB via Dexie
  async saveImage(id: string, name: string, data: string): Promise<void> {
    try {
      await db.images.put({
        id,
        name,
        data,
        timestamp: Date.now()
      });
      console.log('Image saved to Dexie:', id);
    } catch (error) {
      console.error('Failed to save image to Dexie:', error);
      throw error;
    }
  },

  // Get a single image by ID
  async getImage(id: string): Promise<StoredImage | undefined> {
    try {
      return await db.images.get(id);
    } catch (error) {
      console.error('Failed to get image:', error);
      return undefined;
    }
  },

  // Get all stored images
  async getAllImages(): Promise<StoredImage[]> {
    try {
      return await db.images.toArray();
    } catch (error) {
      console.error('Failed to get all images:', error);
      return [];
    }
  },

  // Delete an image by ID
  async deleteImage(id: string): Promise<void> {
    try {
      await db.images.delete(id);
      console.log('Image deleted:', id);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  },

  // Clear all images
  async clearAll(): Promise<void> {
    try {
      await db.images.clear();
      console.log('All images cleared');
    } catch (error) {
      console.error('Failed to clear images:', error);
    }
  },

  // Save selected background URL to localStorage (for quick access on page load)
  saveSelectedBackground(url: string | null): void {
    if (url) {
      localStorage.setItem(SELECTED_BG_KEY, url);
    } else {
      localStorage.removeItem(SELECTED_BG_KEY);
    }
  },

  // Get selected background from localStorage
  getSelectedBackground(): string | null {
    return localStorage.getItem(SELECTED_BG_KEY);
  },

  // Save show backgrounds setting
  saveShowBackgrounds(show: boolean): void {
    localStorage.setItem(SHOW_BG_KEY, show.toString());
  },

  // Get show backgrounds setting
  getShowBackgrounds(): boolean {
    const saved = localStorage.getItem(SHOW_BG_KEY);
    return saved === null ? true : saved === 'true';
  }
};

// Apply background on page load
export function applyStoredBackground(): void {
  const showBg = imageStorage.getShowBackgrounds();
  const bgUrl = imageStorage.getSelectedBackground();
  
  if (showBg && bgUrl) {
    // Apply to body or create a background div
    document.documentElement.style.setProperty('--custom-bg-url', `url(${bgUrl})`);
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Apply background immediately when script loads
  applyStoredBackground();
}
