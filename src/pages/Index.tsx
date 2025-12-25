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
import { SupportModal } from "@/components/SupportModal";
import { AdminPanel } from "@/components/AdminPanel";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { AISummaryCard } from "@/components/AISummaryCard";
import { RelatedSearches } from "@/components/RelatedSearches";

import { Button } from "@/components/ui/button";
import { Users, Plus, Heart } from "lucide-react";
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
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("general");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [fromSuggestion, setFromSuggestion] = useState(false);




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

  const handleSearch = (query: string, isSuggestion = false) => {
    if (!isAuthenticated) {
      setShowInviteModal(true);
      return;
    }
    setFromSuggestion(isSuggestion);
    setLastSearchQuery(query);
    search(query, selectedPlatform, 1, searchMode === "favorites");
    // Reset the suggestion flag after a short delay
    if (isSuggestion) {
      setTimeout(() => setFromSuggestion(false), 500);
    }
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
      {/* Animated Grid Background - only on home page */}
      {!hasSearched && !isLoading && <AnimatedGrid />}
      
      {/* Additional background decoration - only on home page */}
      {!hasSearched && !isLoading && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/[0.03] to-purple-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/[0.01] via-blue-500/[0.01] to-purple-500/[0.01] rounded-full blur-3xl" />
        </div>
      )}

      {/* Header - changes layout based on search state */}
      <header className={`relative z-50 px-4 py-3 md:px-12 md:py-4 ${hasSearched || isLoading ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'md:py-6'}`}>
        {/* Results page header layout */}
        {(hasSearched || isLoading) ? (
          <div className="flex flex-col gap-2">
            {/* Mobile: Logo centered, search bar full width below */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <Logo />
                <div className="flex items-center gap-2">
                  {isAuthenticated && user && (
                    <UserProfile
                      user={user}
                      onLogout={logout}
                      onShowFavorites={() => setShowFavoritesModal(true)}
                      onShowSettings={() => {}}
                    />
                  )}
                </div>
              </div>
              <SearchInput onSearch={handleSearch} isLoading={isLoading} externalQuery={lastSearchQuery} suppressSuggestions={fromSuggestion} />
            </div>
            
            {/* Desktop: Logo + search bar + filters + user in one row */}
            <div className="hidden md:flex items-center gap-4">
              <Logo />
              <div className="flex-1 max-w-md">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} externalQuery={lastSearchQuery} suppressSuggestions={fromSuggestion} />
              </div>
              <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} variant="dropdown" />
              <div className="flex items-center gap-2 ml-auto">
                {isAuthenticated && user && (
                  <UserProfile
                    user={user}
                    onLogout={logout}
                    onShowFavorites={() => setShowFavoritesModal(true)}
                    onShowSettings={() => {}}
                  />
                )}
                {!isAuthenticated && (
                  <Button variant="outline" onClick={() => setShowInviteModal(true)}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Home page header layout */
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuggestModal(true)}
                    className="px-2 sm:px-3"
                  >
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add website</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    className="px-2 sm:px-3"
                  >
                    <Users className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Invite</span>
                  </Button>
                  {user && (
                    <UserProfile
                      user={user}
                      onLogout={logout}
                      onShowFavorites={() => setShowFavoritesModal(true)}
                      onShowSettings={() => {}}
                    />
                  )}
                </>
              )}
              {!isAuthenticated && (
                <Button variant="outline" onClick={() => setShowInviteModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-20 px-4 md:px-12">
        <div className={hasSearched || isLoading ? "" : "max-w-4xl mx-auto"}>
          {/* Hero section */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-16 md:py-24 transition-all duration-500">
              <AnimatedTitle />
              <p className="text-sm md:text-base text-muted-foreground font-medium tracking-widest uppercase mb-8 animate-fade-up stagger-2">
                F*CK SEO • FIND SITES & FREE TOOLS
              </p>
              <div className="animate-fade-up stagger-4 mb-8 relative z-30">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} />
              </div>
              <div className="animate-fade-up stagger-3 mb-6 relative z-20">
                <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Results view */}
          {(hasSearched || isLoading) && (
            <div className="pb-20">
              <div className="flex items-start gap-4 md:gap-6">
                {/* Desktop spacer: aligns content under the search input (not under the logo) */}
                <div className="hidden md:block invisible shrink-0" aria-hidden="true">
                  <Logo />
                </div>

                <div className="min-w-0 flex-1 max-w-2xl">
                  {/* Search mode tabs - horizontal scroll on mobile like Google */}
                  <div className="mb-3 md:mb-4 pt-1 md:pt-2 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
                    <SearchModeSelector mode={searchMode} onChange={handleSearchModeChange} />
                  </div>

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
                    <AISummaryCard summary={aiSummary} isLoading={isAILoading} searchQuery={lastSearchQuery} />
                  )}

                  {!isLoading && !error && results.length > 0 && (
                    <div className="space-y-0 md:space-y-3">
                      <p className="text-xs text-muted-foreground mb-2 md:mb-4 animate-fade-in">
                        About {totalResults} results
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

                      {/* Related Searches */}
                      <RelatedSearches query={lastSearchQuery} onSearch={handleSearch} />
                    </div>
                  )}

                  {!isLoading && !error && results.length === 0 && (
                    <EmptyState hasSearched={hasSearched} />
                  )}
                </div>
              </div>
            </div>
          )}
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
      <footer className="relative z-20 border-t border-border py-4 md:py-6 px-4 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-4 text-sm text-muted-foreground">
          {/* Mobile: Support link */}
          <button 
            onClick={() => setShowSupportModal(true)}
            className="md:hidden flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors text-xs"
          >
            <Heart className="w-3 h-3" />
            Support Yourel
          </button>
          
          <p className="flex items-center gap-2 text-xs md:text-sm">
            Built for you 
            <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
          </p>
          
          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center text-[10px] md:text-xs">
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
            {/* Desktop: Support link inline */}
            <button 
              onClick={() => setShowSupportModal(true)}
              className="hidden md:inline-flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors"
            >
              <Heart className="w-3 h-3" />
              Support
            </button>
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

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

    </div>
  );
};

export default Index;
