import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { UserProfile } from "@/components/UserProfile";
import { SearchModeSelector, SearchMode } from "@/components/SearchModeSelector";
import { FavoritesModal } from "@/components/FavoritesModal";
import { InviteModal } from "@/components/InviteModal";
import { SearchInput } from "@/components/SearchInput";
import { SearchResult } from "@/components/SearchResult";
import { AdResult } from "@/components/AdResult";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { adStorage, Ad } from "@/lib/adStorage";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { PlatformFilters, Platform } from "@/components/PlatformFilters";
import { ResultsPagination } from "@/components/ResultsPagination";
import { SuggestWebsiteModal } from "@/components/SuggestWebsiteModal";
import { SupportModal } from "@/components/SupportModal";
import { AdminPanel } from "@/components/AdminPanel";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { AISummaryCard } from "@/components/AISummaryCard";
import { RelatedSearches } from "@/components/RelatedSearches";
import { TutorialCard } from "@/components/TutorialCard";
import { BundleSelector } from "@/components/BundleSelector";
import { CreateBundleModal } from "@/components/CreateBundleModal";
import { DynamicBackground } from "@/components/DynamicBackground";
import { ProfileSettingsCard } from "@/components/ProfileSettingsCard";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { AIAgentModal } from "@/components/AIAgentModal";
import { useBackground } from "@/contexts/BackgroundContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { Button } from "@/components/ui/button";
import { Package, Heart, LogIn } from "lucide-react";
import { useMultiSearch } from "@/hooks/useMultiSearch";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useBundles } from "@/hooks/useBundles";
import { toast } from "sonner";

// Hook to detect if device is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

const Index = () => {
  const navigate = useNavigate();
  const { showBackgrounds } = useBackground();
  const isMobile = useIsMobile();
  const { results, isLoading, error, hasSearched, totalResults, currentPage, totalPages, aiSummary, isAILoading, search, changePage, changeFilter } = useMultiSearch();
  const { 
    user,
    profile,
    favorites,
    isLoading: authLoading,
    isAuthenticated,
    signOut,
    addToFavorites,
    removeFromFavorites
  } = useSupabaseAuth();
  const {
    bundles,
    activeBundle,
    setActiveBundle,
    clearActiveBundle,
    createBundle,
    deleteBundle,
    getBundleSiteFilters,
    sampleBundles,
  } = useBundles();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateBundleModal, setShowCreateBundleModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("general");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [fromSuggestion, setFromSuggestion] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [matchingAds, setMatchingAds] = useState<Ad[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if tutorial should be shown (first-time users)
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("yourel_tutorial_completed");
    if (!tutorialCompleted && isAuthenticated) {
      setShowTutorial(true);
    }
  }, [isAuthenticated]);

  // Generate invite code based on user
  const userInviteCode = profile?.username ? `YOUREL#${profile.username.toUpperCase().slice(0, 4)}` : '';
  const inviteText = `oyy ye dekh kya faadu chiz he be...\n\ye le invite code: ${userInviteCode}\n\n${window.location.origin}/auth`;

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const handleAddToFavorites = async (url: string, name: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    await addToFavorites(url, name);
    toast.success('Added to favorites');
  };

  const handleRemoveFromFavorites = async (url: string) => {
    await removeFromFavorites(url);
    toast.success('Removed from favorites');
  };

  const handleEditBundle = (bundle: any) => {
    setEditingBundle(bundle);
    setShowCreateBundleModal(true);
  };

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
      navigate('/auth');
      return;
    }
    setFromSuggestion(isSuggestion);
    setLastSearchQuery(query);
    // Find matching ads for this query
    const ads = adStorage.getMatchingAds(query);
    setMatchingAds(ads);
    const bundleFilters = getBundleSiteFilters();
    search(query, activeBundle ? "all" : selectedPlatform, 1, searchMode === "favorites", bundleFilters);
    // Reset the suggestion flag after a short delay
    if (isSuggestion) {
      setTimeout(() => setFromSuggestion(false), 500);
    }
  };

  const handleFilterChange = (platform: Platform) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (activeBundle) {
      toast('Clear the bundle filter to use platform filters');
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
      const bundleFilters = getBundleSiteFilters();
      // Re-run last search with new mode
      search(lastSearchQuery, activeBundle ? "all" : selectedPlatform, 1, mode === "favorites", bundleFilters);
    }
  };

  // If a bundle is selected/cleared while results are shown, re-run the current query
  useEffect(() => {
    if (!isAuthenticated || !hasSearched || !lastSearchQuery) return;
    const bundleFilters = getBundleSiteFilters();
    search(lastSearchQuery, activeBundle ? "all" : selectedPlatform, 1, searchMode === "favorites", bundleFilters);
  }, [activeBundle?.id, getBundleSiteFilters, hasSearched, isAuthenticated, lastSearchQuery, search, searchMode, selectedPlatform]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    toast.success(`Switched to ${isDark ? 'light' : 'dark'} mode`);
  }, []);

  // Focus search input
  const focusSearch = useCallback(() => {
    // Find the search input and focus it
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Navigate results with keyboard
  const navigateResults = useCallback((direction: 'up' | 'down') => {
    if (!hasSearched || results.length === 0) return;
    
    setSelectedResultIndex(prev => {
      if (direction === 'down') {
        return prev < results.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : results.length - 1;
      }
    });
  }, [hasSearched, results.length]);

  // Select current result
  const selectResult = useCallback(() => {
    if (selectedResultIndex >= 0 && selectedResultIndex < results.length) {
      const result = results[selectedResultIndex];
      window.open(result.link, '_blank');
    }
  }, [selectedResultIndex, results]);

  // Open in new tab
  const openInNewTab = useCallback(() => {
    if (selectedResultIndex >= 0 && selectedResultIndex < results.length) {
      const result = results[selectedResultIndex];
      window.open(result.link, '_blank');
    }
  }, [selectedResultIndex, results]);

  // Clear search / close modals
  const clearSearch = useCallback(() => {
    // Close any open modals first
    if (showShortcutsModal) {
      setShowShortcutsModal(false);
      return;
    }
    if (showProfileSettings) {
      setShowProfileSettings(false);
      return;
    }
    if (showCreateBundleModal) {
      setShowCreateBundleModal(false);
      return;
    }
    if (showFavoritesModal) {
      setShowFavoritesModal(false);
      return;
    }
    if (showSupportModal) {
      setShowSupportModal(false);
      return;
    }
    // Blur search input
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.blur();
    }
  }, [showShortcutsModal, showProfileSettings, showCreateBundleModal, showFavoritesModal, showSupportModal]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: focusSearch,
    onClearSearch: clearSearch,
    onToggleTheme: toggleTheme,
    onOpenSettings: () => setShowProfileSettings(true),
    onOpenBundles: () => {}, // Bundle selector is always visible
    onCreateBundle: () => setShowCreateBundleModal(true),
    onShowShortcuts: () => setShowShortcutsModal(true),
    onPlatformChange: handleFilterChange,
    onNavigateResults: navigateResults,
    onSelectResult: selectResult,
    onOpenInNewTab: openInNewTab,
  }, true);

  // Reset selected result when results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [results]);



  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col ${showBackgrounds && !isMobile && !hasSearched && !isLoading ? 'bg-transparent' : 'bg-background'}`} style={{ zIndex: 1 }}>
      {/* Dynamic Background with Unsplash Images */}
      <DynamicBackground hasSearched={hasSearched || isLoading} />
      
      {/* Animated Grid Background - show when background images are OFF, or always on mobile */}
      {!hasSearched && !isLoading && (!showBackgrounds || isMobile) && <AnimatedGrid />}
      
      {/* Additional background decoration - only when background images are OFF */}
      {!hasSearched && !isLoading && !showBackgrounds && (
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
                  {isAuthenticated && profile && (
                    <UserProfile
                      user={{ email: user?.email, full_name: profile?.full_name }}
                      favorites={favorites}
                      onLogout={handleLogout}
                      onShowFavorites={() => setShowFavoritesModal(true)}
                      onShowSettings={() => setShowProfileSettings(true)}
                      onShowInvite={() => setShowInviteModal(true)}
                      onShowShortcuts={() => setShowShortcutsModal(true)}
                      onShowAIAgent={() => setShowAIAgent(true)}
                    />
                  )}
                </div>
              </div>
              <SearchInput onSearch={handleSearch} isLoading={isLoading} externalQuery={lastSearchQuery} suppressSuggestions={fromSuggestion} requireAuth isAuthenticated={isAuthenticated} onAuthRequired={() => navigate('/auth')} />
              <div className="mt-2 flex items-center gap-2">
                {!activeBundle && (
                  <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} variant="dropdown" />
                )}
                <BundleSelector
                  bundles={bundles}
                  activeBundle={activeBundle}
                  onSelectBundle={setActiveBundle}
                  onCreateBundle={() => setShowCreateBundleModal(true)}
                  onEditBundle={handleEditBundle}
                  onDeleteBundle={deleteBundle}
                  sampleBundles={sampleBundles}
                  username={profile?.username || undefined}
                />
              </div>
            </div>
            
            {/* Desktop: Logo + search bar + filters + user in one row */}
            <div className="hidden md:flex items-center gap-4">
              <Logo />
              <div className="flex-1 max-w-md">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} externalQuery={lastSearchQuery} suppressSuggestions={fromSuggestion} requireAuth isAuthenticated={isAuthenticated} onAuthRequired={() => navigate('/auth')} />
              </div>
              {!activeBundle && (
                <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} variant="dropdown" />
              )}
              <BundleSelector
                bundles={bundles}
                activeBundle={activeBundle}
                onSelectBundle={setActiveBundle}
                onCreateBundle={() => setShowCreateBundleModal(true)}
                onEditBundle={handleEditBundle}
                onDeleteBundle={deleteBundle}
                sampleBundles={sampleBundles}
                username={profile?.username || undefined}
              />
              <div className="flex items-center gap-2 ml-auto">
                {isAuthenticated && profile && (
                  <UserProfile
                    user={{ email: user?.email, full_name: profile?.full_name }}
                    favorites={favorites}
                    onLogout={handleLogout}
                    onShowFavorites={() => setShowFavoritesModal(true)}
                    onShowSettings={() => setShowProfileSettings(true)}
                    onShowInvite={() => setShowInviteModal(true)}
                    onShowShortcuts={() => setShowShortcutsModal(true)}
                    onShowAIAgent={() => setShowAIAgent(true)}
                  />
                )}
                {!isAuthenticated && (
                  <Button variant="outline" onClick={() => navigate('/auth')}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Home page header layout */
          <div className="flex items-center justify-between">
            {/* Logo hidden on landing page, only show on search results */}
            <div className="invisible">
              <Logo />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated && (
                <>
                  <BundleSelector
                    bundles={bundles}
                    activeBundle={activeBundle}
                    onSelectBundle={setActiveBundle}
                    onCreateBundle={() => setShowCreateBundleModal(true)}
                    onEditBundle={handleEditBundle}
                    onDeleteBundle={deleteBundle}
                    sampleBundles={sampleBundles}
                    username={profile?.username || undefined}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateBundleModal(true)}
                    className="px-2 sm:px-3"
                  >
                    <Package className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create Bundle</span>
                  </Button>
                  {profile && (
                    <UserProfile
                      user={{ email: user?.email, full_name: profile?.full_name }}
                      favorites={favorites}
                      onLogout={handleLogout}
                      onShowFavorites={() => setShowFavoritesModal(true)}
                      onShowSettings={() => setShowProfileSettings(true)}
                      onShowInvite={() => setShowInviteModal(true)}
                      onShowShortcuts={() => setShowShortcutsModal(true)}
                      onShowAIAgent={() => setShowAIAgent(true)}
                    />
                  )}
                </>
              )}
              {!isAuthenticated && (
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-20 px-4 md:px-12 flex-1">
        <div className={hasSearched || isLoading ? "" : "max-w-4xl mx-auto"}>
          {/* Hero section */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-16 md:py-24 transition-all duration-500">
              <AnimatedTitle />
              <p className={`text-sm md:text-base font-bold tracking-widest uppercase mb-8 animate-fade-up stagger-2 ${showBackgrounds ? 'text-black dark:text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-muted-foreground'}`}>
                F*CK SEO • FIND SITES & FREE TOOLS
              </p>
              <div className="animate-fade-up stagger-4 mb-8 relative z-30">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} requireAuth isAuthenticated={isAuthenticated} onAuthRequired={() => navigate('/auth')} />
              </div>
              {!activeBundle && (
                <div className="animate-fade-up stagger-3 mb-6 relative z-20">
                  <PlatformFilters selected={selectedPlatform} onChange={handleFilterChange} />
                </div>
              )}
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
                      
                      {/* Sponsored Ads - Google style */}
                      {matchingAds.length > 0 && currentPage === 1 && (
                        <div className="mb-4">
                          {matchingAds.map((ad) => (
                            <AdResult key={ad.id} ad={ad} />
                          ))}
                        </div>
                      )}
                      
                      {results.map((result, index) => (
                        <SearchResult
                          key={`${result.link}-${index}`}
                          title={result.title}
                          link={result.link}
                          snippet={result.snippet}
                          platform={result.platform}
                          index={index}
                          onAddToFavorites={handleAddToFavorites}
                          isFavorite={favorites?.some(fav => fav.url === result.link) || false}
                          isSelected={selectedResultIndex === index}
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

      {/* Big Brand Text + Footer - pushed to bottom */}
      <div className="mt-auto">
        {/* Big Brand Text - only show on home, not results */}
        {!hasSearched && !isLoading && (
          <div className="relative z-20 py-6 md:py-12 px-6 md:px-12 overflow-hidden">
            <div className="max-w-8xl mx-auto text-center">
              <h2 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter bg-gradient-to-r from-black via-gray-900 to-gray-800 dark:from-white dark:via-white/80 dark:to-white/60 bg-clip-text text-transparent whitespace-nowrap animate-slide-in-right">
                #YOUREL
              </h2>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={`relative z-20 py-3 md:py-6 px-4 md:px-12 ${showBackgrounds && !isMobile ? '' : 'border-t border-border'}`}>
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2 md:gap-4 text-sm text-muted-foreground">
          <p className={`flex items-center gap-2 text-xs md:text-sm ${showBackgrounds && !isMobile ? 'text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-muted-foreground'}`}>
            Built for you 
            <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
            <button 
              onClick={() => setShowSupportModal(true)}
              className="md:hidden text-red-500 hover:text-red-400 transition-colors"
            >
              Buy Me a Coffee
            </button>
          </p>
          
          <button 
            onClick={() => setShowSupportModal(true)}
            className="hidden md:inline-flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors text-xs"
          >
            <Heart className="w-3 h-3" />
            Buy Me a Coffee
          </button>
        </div>
      </footer>
      </div>

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={favorites}
        onRemoveFromFavorites={handleRemoveFromFavorites}
        onAddToFavorites={handleAddToFavorites}
        username={profile?.username}
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

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onAuthenticate={() => true}
        userInviteCode={userInviteCode}
        inviteText={inviteText}
        remainingInvites={0}
        generatePassword={() => ''}
      />

      <CreateBundleModal
        isOpen={showCreateBundleModal}
        onClose={() => {
          setShowCreateBundleModal(false);
          setEditingBundle(null);
        }}
        onCreateBundle={createBundle}
        editingBundle={editingBundle}
        favorites={favorites || []}
      />

      <ProfileSettingsCard
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* AI Agent Modal */}
      <AIAgentModal
        isOpen={showAIAgent}
        onClose={() => setShowAIAgent(false)}
        onSearch={handleSearch}
        onAddToFavorites={handleAddToFavorites}
      />

      {/* Tutorial Card */}
      {showTutorial && (
        <TutorialCard onComplete={() => setShowTutorial(false)} />
      )}

    </div>
  );
};

export default Index;
