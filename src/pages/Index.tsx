import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchInput } from "@/components/SearchInput";
import { SearchResult } from "@/components/SearchResult";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useVercelSearch } from "@/hooks/useVercelSearch";

const Index = () => {
  const { results, isLoading, error, hasSearched, search } = useVercelSearch();

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
          <div className="text-center py-16 md:py-24">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-up">
              Find Vercel Sites
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-up stagger-1">
              Discover portfolios, tools, and projects deployed on Vercel's global edge network.
            </p>
            <div className="animate-fade-up stagger-2">
              <SearchInput onSearch={search} isLoading={isLoading} />
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
                  Found {results.length} results
                </p>
                {results.map((result, index) => (
                  <SearchResult
                    key={result.link}
                    title={result.title}
                    link={result.link}
                    snippet={result.snippet}
                    index={index}
                  />
                ))}
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
              <EmptyState hasSearched={hasSearched} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Built with precision for the modern web</p>
          <div className="flex items-center gap-6">
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Vercel
            </a>
            <a href="https://developers.google.com/custom-search" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Google CSE
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
