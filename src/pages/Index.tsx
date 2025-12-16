import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchInput } from "@/components/SearchInput";
import { SearchResult } from "@/components/SearchResult";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { PlatformFilters, Platform } from "@/components/PlatformFilters";
import { ResultsPagination } from "@/components/ResultsPagination";
import { SupportModal } from "@/components/SupportModal";
import { useMultiSearch } from "@/hooks/useMultiSearch";
import { analytics } from "@/lib/analytics";

const Index = () => {
  const { results, isLoading, error, hasSearched, totalResults, currentPage, totalPages, search, changePage, changeFilter } = useMultiSearch();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Track page view on mount
  useEffect(() => {
    analytics.track('page_view', { url: window.location.href });
  }, []);

  const handleSearch = (query: string) => {
    search(query, selectedPlatform, 1);
  };

  const handleFilterChange = (platform: Platform) => {
    setSelectedPlatform(platform);
    if (hasSearched) {
      changeFilter(platform);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-foreground/[0.02] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/[0.01] rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <Logo />
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className={`text-center ${hasSearched || isLoading ? 'py-8 md:py-12' : 'py-16 md:py-24'} transition-all duration-500`}>
            <AnimatedTitle />
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up stagger-1">
              Discover portfolios, tools, and projects across popular hosting platforms
            </p>
            <div className="animate-fade-up stagger-2 mb-6">
              <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} />
            </div>
            <div className="animate-fade-up stagger-3">
              <SearchInput onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>

          {/* Results section */}
          <div className="pb-20">
            {error && (
              <div className="glass rounded-2xl p-6 text-center animate-scale-in">
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please try again or check your connection.
                </p>
              </div>
            )}

            {isLoading && <SearchSkeleton />}

            {!isLoading && !error && results.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-6 animate-fade-in">
                  Found {totalResults} results
                </p>
                {results.map((result, index) => (
                  <SearchResult
                    key={`${result.link}-${index}`}
                    title={result.title}
                    link={result.link}
                    snippet={result.snippet}
                    platform={result.platform}
                    index={index}
                  />
                ))}
                <ResultsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
              <EmptyState hasSearched={hasSearched} />
            )}
          </div>
        </div>
      </main>

      {/* Big Brand Text */}
      <div className="relative z-10 py-16 md:py-24 px-6 md:px-12 overflow-hidden">
        <div className="max-w-8xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent whitespace-nowrap animate-slide-in-right">
            #YOUREL
          </h2>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Built for you ♥</p>
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end text-xs">
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Vercel
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Netlify
            </a>
            <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Railway
            </a>
            <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Render
            </a>
            <a href="https://bubble.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Bubble
            </a>
            <a href="https://framer.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Framer
            </a>
            <a href="https://replit.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Replit
            </a>
            <a href="https://fly.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Fly.io
            </a>
            <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Lovable
            </a>
          </div>
        </div>
      </footer>

      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </div>
  );
};

export default Index;
