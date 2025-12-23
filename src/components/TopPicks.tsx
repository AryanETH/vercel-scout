import { ExternalLink, Sparkles, Wrench, Gem, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { topPicksIndexer } from "@/lib/topPicksIndexer";
import { fallbackTopPicks } from "@/lib/fallbackPicks";

interface IndexedSite {
  title: string;
  link: string;
  snippet: string;
  platform: string;
  searchTerm: string;
  rank: number;
  score: number;
}

const categoryConfig = {
  ai: {
    title: "AI & Next-Gen",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  devtools: {
    title: "Dev Tools",
    icon: Wrench,
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  gems: {
    title: "Hidden Gems",
    icon: Gem,
    gradient: "from-emerald-500/20 to-teal-500/20"
  }
};

export function TopPicks() {
  const [picks, setPicks] = useState<{
    ai: IndexedSite[];
    devtools: IndexedSite[];
    gems: IndexedSite[];
  }>({ ai: [], devtools: [], gems: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const loadTopPicks = async () => {
      setIsLoading(true);
      setError(null);
      setUsingFallback(false);
      
      try {
        // First try to load from admin panel (localStorage)
        const adminData = localStorage.getItem('admin-top-picks');
        if (adminData) {
          const adminPicks = JSON.parse(adminData);
          const categorizedAdminPicks = {
            ai: adminPicks.filter((item: any) => item.category === 'ai'),
            devtools: adminPicks.filter((item: any) => item.category === 'devtools'),
            gems: adminPicks.filter((item: any) => item.category === 'gems')
          };
          
          const totalAdminResults = categorizedAdminPicks.ai.length + categorizedAdminPicks.devtools.length + categorizedAdminPicks.gems.length;
          
          if (totalAdminResults > 0) {
            console.log('📊 Using admin curated picks:', categorizedAdminPicks);
            setPicks(categorizedAdminPicks);
            setUsingFallback(false);
            setLastUpdated(new Date());
            setError(null);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to API if no admin data
        console.log('🔍 Starting to load top picks from API...');
        await topPicksIndexer.getTopPicks(12);
        const categorizedPicks = topPicksIndexer.getCategorizedPicks();
        
        console.log('📊 Categorized picks:', categorizedPicks);
        
        // Check if we got any results
        const totalResults = categorizedPicks.ai.length + categorizedPicks.devtools.length + categorizedPicks.gems.length;
        
        if (totalResults === 0) {
          console.log('⚠️ No results from indexer, using fallback');
          setPicks(fallbackTopPicks);
          setUsingFallback(true);
        } else {
          setPicks(categorizedPicks);
          setUsingFallback(false);
        }
        
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('❌ Failed to load top picks:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load picks';
        
        // Check if it's a quota exceeded error
        if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota metric')) {
          console.log('📊 API quota exceeded, offering Google CSE fallback');
          setQuotaExceeded(true);
          setError('API quota exceeded for today');
        } else {
          console.log('🔄 Using fallback picks');
          setError(errorMessage);
        }
        
        setPicks(fallbackTopPicks);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopPicks();
  }, []);

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  return (
    <div className="space-y-12 animate-fade-up">
      {error && (
        <div className="text-center py-8">
          <div className="glass rounded-xl p-6 border border-destructive/20">
            <h3 className="font-semibold text-destructive mb-2">
              {quotaExceeded ? 'API Quota Exceeded' : 'Failed to Load Top Picks'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              {quotaExceeded ? 'API quota exceeded - showing curated examples' : 'Please try again later'}
            </p>
          </div>
        </div>
      )}
      <div className="text-center rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isLoading ? (
            <>
              <Search className="w-3 h-3 animate-spin" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Indexing Top Sites...
              </span>
            </>
          ) : (
            <>
              <div className={`w-2 h-2 rounded-full animate-pulse ${usingFallback ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className={`text-xs font-medium uppercase tracking-wider ${usingFallback ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                {usingFallback ? 'Trending' : 'Trending'} • {lastUpdated?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </>
          )}
        </div>
        <h2 className="font-display text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Top Picks from Search
        </h2>
        <p className="text-muted-foreground text-lg mb-4">
          {usingFallback 
            ? 'Curated examples of real user-created websites on popular platforms'
            : 'Real websites discovered through internal search indexing'
          }
        </p>

      </div>

      {categories.map((categoryKey, categoryIndex) => {
        const category = categoryConfig[categoryKey];
        const Icon = category.icon;
        const categoryItems = picks[categoryKey] || [];
        
        if (categoryItems.length === 0 && !isLoading) {
          return null; // Skip empty categories
        }

        return (
          <div 
            key={categoryKey}
            className="opacity-0 animate-slide-up"
            style={{ 
              animationDelay: `${categoryIndex * 0.2}s`, 
              animationFillMode: "forwards" 
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} backdrop-blur-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                {category.title}
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {categoryItems.length} sites
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="glass rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-6 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded mb-3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryItems.map((item, index) => (
                  <a
                    key={item.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group glass rounded-xl p-6 hover-lift opacity-0 animate-slide-up
                      hover:bg-accent/50 transition-all duration-300
                      border border-border/50 hover:border-border
                    `}
                    style={{ 
                      animationDelay: `${(categoryIndex * 0.2) + (index * 0.1)}s`, 
                      animationFillMode: "forwards" 
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Rank #{item.rank} • {item.searchTerm}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-semibold mb-2 group-hover:text-foreground transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.snippet}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new URL(item.link).hostname}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {item.platform}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Score: {Math.round(item.score)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}