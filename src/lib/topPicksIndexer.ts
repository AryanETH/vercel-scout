// Local type (independent of hook) used for Google CSE results
interface SearchResultInternal {
  title: string;
  link: string;
  snippet: string;
  platform: string;
}
const API_KEY = "AIzaSyByFwruZ-h21A5YUNn6jj9qyBaeHBNgGSQ";
const CSE_ID = "c45a3d17b28ad4867";

const PLATFORM_SITES: Record<string, string> = {
  vercel: "site:vercel.app",
  github: "site:github.io",
  netlify: "site:netlify.app",
  railway: "site:railway.app",
  onrender: "site:onrender.com",
  bubble: "site:bubbleapps.io",
  framer: "site:framer.website",
  replit: "site:replit.app",
  bolt: "site:bolt.host",
  fly: "site:fly.dev",
  lovable: "site:lovable.app",
};

// Popular search terms to find user-created projects
const TRENDING_SEARCHES = [
  "portfolio website", "personal dashboard", "saas app", "landing page demo", "blog site", "ecommerce store",
  "todo list app", "chat application", "weather dashboard", "calculator tool", "web game", "utility tool",
  "ai project", "machine learning demo", "react portfolio", "nextjs app", "vue project", "angular demo",
  "design showcase", "component demo", "ui showcase", "project template",
  "startup website", "business app", "agency site", "personal project", "creative portfolio", "minimal design",
  "web app", "side project", "demo site", "prototype", "mvp", "showcase"
];

interface IndexedSite {
  title: string;
  link: string;
  snippet: string;
  platform: string;
  searchTerm: string;
  rank: number;
  score: number;
}

class TopPicksIndexer {
  private indexedSites: IndexedSite[] = [];
  private lastIndexTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async searchPlatform(
    query: string,
    platform: string,
    num: number = 5
  ): Promise<SearchResultInternal[]> {
    const searchQuery = encodeURIComponent(`${query} ${PLATFORM_SITES[platform]}`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${searchQuery}&num=${num}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.warn(`Search error for ${platform}:`, data.error.message);
        return [];
      }

      const results = (data.items || []).map((item: any) => ({
        title: item.title || "Untitled",
        link: item.link,
        snippet: item.snippet || "",
        platform,
      }));

      // Filter out platform homepages and main domains - only show user-created content
      return results.filter(result => this.isUserCreatedContent(result.link, platform));
    } catch (error) {
      console.warn(`Failed to search ${platform}:`, error);
      return [];
    }
  }

  private isUserCreatedContent(url: string, platform: string): boolean {
    const lowercaseUrl = url.toLowerCase();
    
    // Platform main domains to exclude
    const platformMainDomains = [
      'vercel.com',
      'netlify.com', 
      'railway.app',
      'render.com',
      'onrender.com',
      'github.com',
      'github.io',
      'replit.com',
      'fly.io',
      'framer.com',
      'bubble.io',
      'lovable.dev',
      'bolt.new',
      'bolt.host'
    ];

    // Exclude main platform domains
    for (const domain of platformMainDomains) {
      if (lowercaseUrl.includes(`://${domain}`) || lowercaseUrl.includes(`://www.${domain}`)) {
        return false;
      }
    }

    // Exclude common non-user pages
    const excludePatterns = [
      '/docs',
      '/documentation',
      '/blog',
      '/pricing',
      '/features',
      '/about',
      '/contact',
      '/login',
      '/signup',
      '/dashboard',
      '/settings',
      '/help',
      '/support',
      '/terms',
      '/privacy',
      '/api',
      'status.',
      'www.',
      'blog.',
      'docs.',
      'help.',
      'support.',
      'api.',
      'status.'
    ];

    for (const pattern of excludePatterns) {
      if (lowercaseUrl.includes(pattern)) {
        return false;
      }
    }

    // Only include subdomains that look like user projects
    const userContentPatterns = [
      '.vercel.app',
      '.netlify.app', 
      '.railway.app',
      '.onrender.com',
      '.github.io',
      '.replit.app',
      '.fly.dev',
      '.framer.website',
      '.bubbleapps.io',
      '.lovable.app',
      '.bolt.host'
    ];

    return userContentPatterns.some(pattern => lowercaseUrl.includes(pattern));
  }

  async indexTopSites(): Promise<void> {
    console.log("🔍 Starting to index top sites...");
    const newIndexedSites: IndexedSite[] = [];

    // Sample fewer searches to avoid API limits and improve reliability
    const searchSample = TRENDING_SEARCHES.slice(0, 4);
    const platformSample = Object.keys(PLATFORM_SITES).slice(0, 4);

    for (const searchTerm of searchSample) {
      for (const platform of platformSample) {
        try {
          const results = await this.searchPlatform(searchTerm, platform, 3);
          
          results.forEach((result, index) => {
            const score = this.calculateScore(result, searchTerm, index);
            newIndexedSites.push({
              ...result,
              searchTerm,
              rank: index + 1,
              score,
            });
          });

          // Longer delay to respect API limits and improve reliability
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(`Failed to index ${searchTerm} on ${platform}:`, error);
        }
      }
    }

    // Sort by score and remove duplicates
    const uniqueSites = this.removeDuplicates(newIndexedSites);
    this.indexedSites = uniqueSites.sort((a, b) => b.score - a.score);
    this.lastIndexTime = Date.now();

    console.log(`✅ Indexed ${this.indexedSites.length} unique sites`);
  }

  private calculateScore(result: SearchResultInternal, searchTerm: string, rank: number): number {
    let score = 100 - (rank * 10); // Base score decreases with rank

    // Boost for popular platforms hosting user content
    const platformBoosts: Record<string, number> = {
      vercel: 20,
      netlify: 15,
      github: 12,
      railway: 10,
      bolt: 25,
      lovable: 25,
      onrender: 8,
      replit: 8,
      fly: 10,
      framer: 12,
      bubble: 8,
    };
    score += platformBoosts[result.platform] || 0;

    // Boost for user project indicators in title/snippet
    const projectKeywords = [
      'portfolio', 'dashboard', 'app', 'tool', 'saas', 'demo', 'project', 
      'website', 'site', 'application', 'platform', 'service', 'showcase',
      'personal', 'my', 'built', 'created', 'developed', 'made'
    ];
    const titleLower = result.title.toLowerCase();
    const snippetLower = result.snippet.toLowerCase();
    
    projectKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 5;
      if (snippetLower.includes(keyword)) score += 3;
    });

    // Penalty for generic/template-like titles
    const genericPenalties = ['untitled', 'default', 'template', 'example', 'test'];
    genericPenalties.forEach(penalty => {
      if (titleLower.includes(penalty)) score -= 10;
    });

    // Boost for quality project types
    const qualityBoosts: Record<string, number> = {
      'ai': 15,
      'saas': 12,
      'dashboard': 10,
      'portfolio': 8,
      'ecommerce': 10,
      'chat': 8,
      'weather': 6,
      'todo': 6,
    };
    
    Object.entries(qualityBoosts).forEach(([keyword, boost]) => {
      if (searchTerm.includes(keyword) || titleLower.includes(keyword)) {
        score += boost;
      }
    });

    // Boost for having a custom subdomain (indicates real project)
    const url = result.link.toLowerCase();
    if (url.match(/^https?:\/\/[a-z0-9-]+\.(vercel\.app|netlify\.app|railway\.app|onrender\.com|github\.io)/)) {
      score += 10;
    }

    return score;
  }

  private removeDuplicates(sites: IndexedSite[]): IndexedSite[] {
    const seen = new Set<string>();
    return sites.filter(site => {
      const key = site.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async getTopPicks(count: number = 12): Promise<IndexedSite[]> {
    // Check if we need to refresh the index
    const needsRefresh = Date.now() - this.lastIndexTime > this.CACHE_DURATION;
    
    if (this.indexedSites.length === 0 || needsRefresh) {
      await this.indexTopSites();
    }

    return this.indexedSites.slice(0, count);
  }

  getCategorizedPicks(): {
    ai: IndexedSite[];
    devtools: IndexedSite[];
    gems: IndexedSite[];
  } {
    const picks = this.indexedSites.slice(0, 30); // Get more for better categorization

    // AI & Next-Gen: AI projects, ML demos, smart apps
    const ai = picks.filter(site => {
      const titleLower = site.title.toLowerCase();
      const snippetLower = site.snippet.toLowerCase();
      const searchTermLower = site.searchTerm.toLowerCase();
      
      return (
        site.platform === 'bolt' || 
        site.platform === 'lovable' ||
        searchTermLower.includes('ai') ||
        searchTermLower.includes('machine learning') ||
        titleLower.includes('ai') ||
        titleLower.includes('ml') ||
        titleLower.includes('gpt') ||
        titleLower.includes('chatbot') ||
        titleLower.includes('neural') ||
        snippetLower.includes('artificial intelligence') ||
        snippetLower.includes('machine learning')
      );
    }).slice(0, 4);

    // Dev Tools: Dashboards, utilities, developer tools
    const devtools = picks.filter(site => {
      const titleLower = site.title.toLowerCase();
      const snippetLower = site.snippet.toLowerCase();
      const searchTermLower = site.searchTerm.toLowerCase();
      
      return !ai.includes(site) && (
        searchTermLower.includes('tool') ||
        searchTermLower.includes('dashboard') ||
        searchTermLower.includes('utility') ||
        searchTermLower.includes('calculator') ||
        titleLower.includes('dashboard') ||
        titleLower.includes('tool') ||
        titleLower.includes('admin') ||
        titleLower.includes('panel') ||
        titleLower.includes('manager') ||
        titleLower.includes('editor') ||
        titleLower.includes('converter') ||
        titleLower.includes('generator') ||
        snippetLower.includes('manage') ||
        snippetLower.includes('track') ||
        snippetLower.includes('monitor')
      );
    }).slice(0, 4);

    // Hidden Gems: Portfolios, creative projects, unique apps
    const gems = picks.filter(site => {
      const titleLower = site.title.toLowerCase();
      const snippetLower = site.snippet.toLowerCase();
      const searchTermLower = site.searchTerm.toLowerCase();
      
      return !ai.includes(site) && !devtools.includes(site) && (
        searchTermLower.includes('portfolio') ||
        searchTermLower.includes('personal') ||
        searchTermLower.includes('creative') ||
        searchTermLower.includes('showcase') ||
        searchTermLower.includes('blog') ||
        searchTermLower.includes('game') ||
        site.platform === 'framer' ||
        titleLower.includes('portfolio') ||
        titleLower.includes('personal') ||
        titleLower.includes('blog') ||
        titleLower.includes('game') ||
        titleLower.includes('creative') ||
        titleLower.includes('art') ||
        titleLower.includes('design') ||
        snippetLower.includes('showcase') ||
        snippetLower.includes('creative')
      );
    }).slice(0, 4);

    // Fill remaining slots with top-scored sites if categories are empty
    const allCategorized = [...ai, ...devtools, ...gems];
    const remaining = picks.filter(site => !allCategorized.includes(site));

    if (ai.length < 4) {
      ai.push(...remaining.slice(0, 4 - ai.length));
    }
    if (devtools.length < 4) {
      devtools.push(...remaining.slice(0, 4 - devtools.length));
    }
    if (gems.length < 4) {
      gems.push(...remaining.slice(0, 4 - gems.length));
    }

    return { ai, devtools, gems };
  }
}

export const topPicksIndexer = new TopPicksIndexer();