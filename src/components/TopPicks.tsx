import { ExternalLink, Sparkles, Wrench, Gem, Search, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fallbackTopPicks } from "@/lib/fallbackPicks";

interface DailyPick {
  id: string;
  title: string;
  url: string;
  snippet: string | null;
  platform: string;
  category: string;
  search_term: string | null;
  rank: number;
  score: number;
  valid_for_date: string;
}

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

  const loadTopPicks = async () => {
    setIsLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      // Fetch from daily_top_picks table
      const today = new Date().toISOString().split('T')[0];
      
      const { data: dailyPicks, error: fetchError } = await supabase
        .from('daily_top_picks')
        .select('*')
        .eq('valid_for_date', today)
        .order('rank', { ascending: true });

      if (fetchError) {
        console.error('Error fetching daily picks:', fetchError);
        throw fetchError;
      }

      if (dailyPicks && dailyPicks.length > 0) {
        // Transform to expected format and categorize
        const categorized = {
          ai: [] as IndexedSite[],
          devtools: [] as IndexedSite[],
          gems: [] as IndexedSite[]
        };

        dailyPicks.forEach((pick: DailyPick) => {
          const site: IndexedSite = {
            title: pick.title,
            link: pick.url,
            snippet: pick.snippet || '',
            platform: pick.platform,
            searchTerm: pick.search_term || '',
            rank: pick.rank,
            score: pick.score
          };

          if (pick.category === 'ai') {
            categorized.ai.push(site);
          } else if (pick.category === 'devtools') {
            categorized.devtools.push(site);
          } else if (pick.category === 'gems') {
            categorized.gems.push(site);
          }
        });

        console.log('📊 Loaded daily picks from database:', categorized);
        setPicks(categorized);
        setLastUpdated(new Date());
        setUsingFallback(false);
        return;
      }

      // If no picks for today, try to trigger update
      console.log('No picks for today, triggering update...');
      try {
        const { error: invokeError } = await supabase.functions.invoke('update-daily-picks');
        if (!invokeError) {
          // Retry fetching after update
          const { data: newPicks } = await supabase
            .from('daily_top_picks')
            .select('*')
            .eq('valid_for_date', today)
            .order('rank', { ascending: true });

          if (newPicks && newPicks.length > 0) {
            const categorized = {
              ai: [] as IndexedSite[],
              devtools: [] as IndexedSite[],
              gems: [] as IndexedSite[]
            };

            newPicks.forEach((pick: DailyPick) => {
              const site: IndexedSite = {
                title: pick.title,
                link: pick.url,
                snippet: pick.snippet || '',
                platform: pick.platform,
                searchTerm: pick.search_term || '',
                rank: pick.rank,
                score: pick.score
              };

              if (pick.category === 'ai') {
                categorized.ai.push(site);
              } else if (pick.category === 'devtools') {
                categorized.devtools.push(site);
              } else if (pick.category === 'gems') {
                categorized.gems.push(site);
              }
            });

            setPicks(categorized);
            setLastUpdated(new Date());
            setUsingFallback(false);
            return;
          }
        }
      } catch (invokeErr) {
        console.error('Error triggering update:', invokeErr);
      }

      // Fall back to static picks
      setPicks(fallbackTopPicks);
      setUsingFallback(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading top picks:', err);
      setPicks(fallbackTopPicks);
      setUsingFallback(true);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopPicks();
  }, []);

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  return (
    <div className="space-y-12 animate-fade-up">
      {error && (
        <div className="text-center py-8">
          <div className="glass rounded-xl p-6 border border-destructive/20">
            <h3 className="font-semibold text-destructive mb-2">
              Failed to Load Top Picks
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
          </div>
        </div>
      )}
      <div className="text-center rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isLoading ? (
            <>
              <Search className="w-3 h-3 animate-spin" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Loading Today's Picks...
              </span>
            </>
          ) : (
            <>
              <div className={`w-2 h-2 rounded-full animate-pulse ${usingFallback ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${usingFallback ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                Updated Daily at 12:00 AM • {lastUpdated?.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <button
                onClick={loadTopPicks}
                className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                title="Refresh picks"
              >
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Top Picks from Search
        </h2>
        <p className="text-muted-foreground text-sm sm:text-lg mb-2 sm:mb-4">
          {usingFallback 
            ? 'Curated examples of real user-created websites'
            : 'Fresh picks discovered and updated daily at midnight'
          }
        </p>
      </div>

      {categories.map((categoryKey, categoryIndex) => {
        const category = categoryConfig[categoryKey];
        const Icon = category.icon;
        const categoryItems = picks[categoryKey] || [];
        
        if (categoryItems.length === 0 && !isLoading) {
          return null;
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
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${category.gradient} backdrop-blur-sm`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold">
                {category.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
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
                      group glass rounded-xl p-4 sm:p-6 hover-lift opacity-0 animate-slide-up
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
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Rank #{item.rank} • {item.searchTerm}
                          </span>
                        </div>
                        <h4 className="font-display text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-foreground transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {item.snippet}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {(() => {
                              try {
                                return new URL(item.link).hostname;
                              } catch {
                                return item.link;
                              }
                            })()}
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
