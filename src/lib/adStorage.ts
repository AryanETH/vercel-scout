// Ad storage and management

export interface Ad {
  id: string;
  title: string;
  description: string;
  link: string;
  displayUrl: string;
  imageUrl?: string;
  keywords: string[]; // Keywords that trigger this ad
  isActive: boolean;
  isPowerAd: boolean; // Power ads show on every search
  createdAt: string;
  clicks: number;
  impressions: number;
}

const ADS_STORAGE_KEY = 'yourel-ads';

export const adStorage = {
  // Get all ads
  getAds(): Ad[] {
    try {
      const stored = localStorage.getItem(ADS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save all ads
  saveAds(ads: Ad[]): void {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads));
  },

  // Add a new ad
  addAd(ad: Omit<Ad, 'id' | 'createdAt' | 'clicks' | 'impressions'>): Ad {
    const ads = this.getAds();
    const newAd: Ad = {
      ...ad,
      id: `ad-${Date.now()}`,
      createdAt: new Date().toISOString(),
      clicks: 0,
      impressions: 0,
    };
    ads.push(newAd);
    this.saveAds(ads);
    return newAd;
  },

  // Update an ad
  updateAd(id: string, updates: Partial<Ad>): void {
    const ads = this.getAds();
    const index = ads.findIndex(ad => ad.id === id);
    if (index !== -1) {
      ads[index] = { ...ads[index], ...updates };
      this.saveAds(ads);
    }
  },

  // Delete an ad
  deleteAd(id: string): void {
    const ads = this.getAds().filter(ad => ad.id !== id);
    this.saveAds(ads);
  },

  // Toggle ad active status
  toggleAdStatus(id: string): void {
    const ads = this.getAds();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.isActive = !ad.isActive;
      this.saveAds(ads);
    }
  },

  // Get matching ads for a search query
  getMatchingAds(query: string): Ad[] {
    const ads = this.getAds().filter(ad => ad.isActive);
    
    // Get power ads (always show)
    const powerAds = ads.filter(ad => ad.isPowerAd);
    
    // Get keyword-matched ads
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    
    const keywordAds = ads.filter(ad => {
      if (ad.isPowerAd) return false; // Already included in powerAds
      
      // Check if any keyword matches the query
      return ad.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return queryLower.includes(keywordLower) || 
               queryWords.some(word => keywordLower.includes(word) || word.includes(keywordLower));
      });
    });
    
    // Power ads first, then keyword-matched ads
    return [...powerAds, ...keywordAds];
  },

  // Record an impression
  recordImpression(id: string): void {
    const ads = this.getAds();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.impressions++;
      this.saveAds(ads);
    }
  },

  // Record a click
  recordClick(id: string): void {
    const ads = this.getAds();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.clicks++;
      this.saveAds(ads);
    }
  },

  // Get favicon URL for a website
  getFaviconUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  }
};
