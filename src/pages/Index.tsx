import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { UserProfile } from "@/components/UserProfile";
import { SearchModeSelector, SearchMode } from "@/components/SearchModeSelector";
import { FavoritesModal } from "@/components/FavoritesModal";
import { SearchInput } from "@/components/SearchInput";
import { SearchResult } from "@/components/SearchResult";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { PlatformFilters, Platform } from "@/components/PlatformFilters";
import { ResultsPagination } from "@/components/ResultsPagination";
import { InviteModal } from "@/components/InviteModal";
import { SuggestWebsiteModal } from "@/components/SuggestWebsiteModal";
import { AdminPanel } from "@/components/AdminPanel";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { AISummaryCard } from "@/components/AISummaryCard";

import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useMultiSearch } from "@/hooks/useMultiSearch";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { results, isLoading, error, hasSearched, totalResults, currentPage, totalPages, aiSummary, isAILoading, search, changePage, changeFilter } = useMultiSearch();
  const { 
    user, 
    isLoading: authLoading, 
    authenticate, 
    getInviteText, 
    generatePassword,
    likeSite,
    dislikeSite,
    addToFavorites,
    removeFromFavorites,
    logout,
    isAuthenticated 
  } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("general");
  const [lastSearchQuery, setLastSearchQuery] = useState("");




  useEffect(() => {
    // Show invite modal if not authenticated after loading
    if (!authLoading && !isAuthenticated) {
      setShowInviteModal(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    // Hidden admin access with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminPanel(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSearch = (query: string) => {
    if (!isAuthenticated) {
      setShowInviteModal(true);
      return;
    }
    setLastSearchQuery(query);
    search(query, selectedPlatform, 1, searchMode === "favorites");
  };

  const handleFilterChange = (platform: Platform) => {
    if (!isAuthenticated) {
      setShowInviteModal(true);
      return;
    }
    setSelectedPlatform(platform);
    if (hasSearched) {
      changeFilter(platform, searchMode === "favorites");
    }
  };

  const handleSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    if (hasSearched && lastSearchQuery) {
      // Re-run last search with new mode
      search(lastSearchQuery, selectedPlatform, 1, mode === "favorites");
    }
  };



  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Grid Background */}
      <AnimatedGrid />
      
      {/* Additional background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/[0.03] to-purple-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/[0.01] via-blue-500/[0.01] to-purple-500/[0.01] rounded-full blur-3xl" />
      </div>

      {/* Header - changes layout based on search state */}
      <header className={`relative z-50 flex items-center justify-between px-6 py-4 md:px-12 ${hasSearched || isLoading ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'md:py-6'}`}>
        <Logo />
        
        {/* Search bar in header when results are shown */}
        {(hasSearched || isLoading) && (
          <div className="flex-1 max-w-xl mx-4 relative z-50">
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Platform filter dropdown in header when results shown */}
          {(hasSearched || isLoading) && (
            <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} variant="dropdown" />
          )}
          
          {isAuthenticated && (
            <>
              {/* Only show Suggest and Invite on home screen, not on results */}
              {!hasSearched && !isLoading && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuggestModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Suggest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </>
              )}
              {user && (
                <UserProfile
                  user={user}
                  onLogout={logout}
                  onShowFavorites={() => setShowFavoritesModal(true)}
                  onShowSettings={() => {}} // TODO: Implement settings
                />
              )}
            </>
          )}
          {!isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-16 md:py-24 transition-all duration-500">
              <AnimatedTitle />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up stagger-1">
                Discover The Undiscovered
              </p>
              <div className="animate-fade-up stagger-4 mb-8 relative z-30">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} />
              </div>
              <div className="animate-fade-up stagger-3 mb-6 relative z-20">
                <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Search mode tabs when results are shown */}
          {(hasSearched || isLoading) && (
            <div className="mb-6 pt-2">
              <div className="border-b border-border">
                <SearchModeSelector mode={searchMode} onChange={handleSearchModeChange} />
              </div>
            </div>
          )}

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

            {/* AI Summary */}
            {!isLoading && !error && hasSearched && (
              <AISummaryCard summary={aiSummary} isLoading={isAILoading} />
            )}

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
                    onLike={likeSite}
                    onDislike={dislikeSite}
                    onAddToFavorites={addToFavorites}
                    isLiked={user?.likedSites?.includes(result.link) || false}
                    isDisliked={user?.dislikedSites?.includes(result.link) || false}
                    isFavorite={user?.favorites?.includes(result.link) || false}
                  />
                ))}
                <ResultsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => changePage(page, searchMode === "favorites")}
                />
              </div>
            )}

            {!isLoading && !error && results.length === 0 && (
              <EmptyState hasSearched={hasSearched} />
            )}
          </div>
        </div>
      </main>

      {/* Big Brand Text - only show on home, not results */}
      {!hasSearched && !isLoading && (
        <div className="relative z-20 py-16 md:py-24 px-6 md:px-12 overflow-hidden">
          <div className="max-w-8xl mx-auto text-center">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent whitespace-nowrap animate-slide-in-right">
              #YOUREL
            </h2>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-20 border-t border-border py-6 px-6 md:px-12">
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

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onAuthenticate={authenticate}
        userInviteCode={user?.inviteCode}
        inviteText={getInviteText()}
        remainingInvites={user?.inviteCount || 0}
        generatePassword={generatePassword}
      />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={user?.favorites || []}
        onRemoveFromFavorites={removeFromFavorites}
      />

      <SuggestWebsiteModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
      />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />


    </div>
  );
};

export default Index;
