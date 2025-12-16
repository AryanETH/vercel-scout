interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: 'click' | 'search' | 'page_view' | 'platform_filter' | 'voice_search';
  data: {
    url?: string;
    query?: string;
    platform?: string;
    element?: string;
  };
  userAgent: string;
  deviceInfo: {
    isMobile: boolean;
    platform: string;
    browser: string;
    screenResolution: string;
  };
  location?: {
    ip?: string;
    country?: string;
    city?: string;
    timezone: string;
  };
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  private loadEvents() {
    const stored = localStorage.getItem('analytics-events');
    if (stored) {
      this.events = JSON.parse(stored);
    }
  }

  private saveEvents() {
    localStorage.setItem('analytics-events', JSON.stringify(this.events));
  }

  private async getLocationInfo(): Promise<AnalyticsEvent['location']> {
    try {
      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Try to get IP and location (using a free service)
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          ip: data.ip,
          country: data.country_name,
          city: data.city,
          timezone
        };
      }
      
      return { timezone };
    } catch (error) {
      return { 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      };
    }
  }

  private getDeviceInfo(): AnalyticsEvent['deviceInfo'] {
    const userAgent = navigator.userAgent;
    
    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Detect platform
    let platform = 'Unknown';
    if (userAgent.includes('Windows')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'macOS';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Get screen resolution
    const screenResolution = `${screen.width}x${screen.height}`;
    
    return {
      isMobile,
      platform,
      browser,
      screenResolution
    };
  }

  async track(type: AnalyticsEvent['type'], data: AnalyticsEvent['data'] = {}) {
    const event: AnalyticsEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      data,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      location: await this.getLocationInfo()
    };

    this.events.push(event);
    this.saveEvents();
    
    console.log('Analytics tracked:', event);
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(type: AnalyticsEvent['type']): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  getEventsInRange(startDate: Date, endDate: Date): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startDate.getTime() && 
      event.timestamp <= endDate.getTime()
    );
  }

  getTotalEvents(): number {
    return this.events.length;
  }

  getUniqueUsers(): number {
    const uniqueAgents = new Set(this.events.map(event => event.userAgent));
    return uniqueAgents.size;
  }

  getTopSearches(limit: number = 10): Array<{query: string, count: number}> {
    const searches = this.events
      .filter(event => event.type === 'search' && event.data.query)
      .map(event => event.data.query!);
    
    const counts = searches.reduce((acc, query) => {
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopPlatforms(limit: number = 10): Array<{platform: string, count: number}> {
    const platforms = this.events
      .filter(event => event.type === 'platform_filter' && event.data.platform)
      .map(event => event.data.platform!);
    
    const counts = platforms.reduce((acc, platform) => {
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clearEvents() {
    this.events = [];
    this.saveEvents();
  }
}

export const analytics = new Analytics();