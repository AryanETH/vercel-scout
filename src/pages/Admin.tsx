import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminAuth } from "@/components/AdminAuth";
import { Save, Edit3, Trash2, Plus, BarChart3, Users, Search, MousePointer, Smartphone, Globe } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface TopPickItem {
  id: string;
  title: string;
  link: string;
  snippet: string;
  platform: string;
  category: 'ai' | 'devtools' | 'gems';
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  const [topPicks, setTopPicks] = useState<TopPickItem[]>([]);
  const [editingItem, setEditingItem] = useState<TopPickItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<TopPickItem>>({
    category: 'ai'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalEvents: 0,
    uniqueUsers: 0,
    topSearches: [] as Array<{query: string, count: number}>,
    topPlatforms: [] as Array<{platform: string, count: number}>,
    recentEvents: [] as any[]
  });

  // Check authentication on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin-authenticated') === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const saved = localStorage.getItem('admin-top-picks');
    if (saved) {
      setTopPicks(JSON.parse(saved));
    } else {
      // Initialize with some sample data
      const sampleData: TopPickItem[] = [
        {
          id: '1',
          title: 'AI Chat Assistant',
          link: 'https://example.com/ai-chat',
          snippet: 'A powerful AI chatbot built with modern web technologies',
          platform: 'vercel',
          category: 'ai'
        },
        {
          id: '2',
          title: 'Developer Portfolio',
          link: 'https://example.com/portfolio',
          snippet: 'Clean and modern developer portfolio showcasing projects',
          platform: 'netlify',
          category: 'devtools'
        }
      ];
      setTopPicks(sampleData);
      localStorage.setItem('admin-top-picks', JSON.stringify(sampleData));
    }

    // Load analytics data
    loadAnalyticsData();
  }, [isAuthenticated]);

  const loadAnalyticsData = () => {
    const events = analytics.getEvents();
    setAnalyticsData({
      totalEvents: analytics.getTotalEvents(),
      uniqueUsers: analytics.getUniqueUsers(),
      topSearches: analytics.getTopSearches(10),
      topPlatforms: analytics.getTopPlatforms(10),
      recentEvents: events.slice(-50).reverse() // Last 50 events, most recent first
    });
  };

  const saveToStorage = (data: TopPickItem[]) => {
    localStorage.setItem('admin-top-picks', JSON.stringify(data));
    setTopPicks(data);
  };

  const handleSave = (item: TopPickItem) => {
    const updated = topPicks.map(pick => 
      pick.id === item.id ? item : pick
    );
    saveToStorage(updated);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const updated = topPicks.filter(pick => pick.id !== id);
    saveToStorage(updated);
  };

  const handleAdd = () => {
    if (newItem.title && newItem.link && newItem.snippet && newItem.platform && newItem.category) {
      const item: TopPickItem = {
        id: Date.now().toString(),
        title: newItem.title,
        link: newItem.link,
        snippet: newItem.snippet,
        platform: newItem.platform,
        category: newItem.category
      };
      saveToStorage([...topPicks, item]);
      setNewItem({ category: 'ai' });
      setShowAddForm(false);
    }
  };

  const categories = {
    ai: 'AI & Next-Gen',
    devtools: 'Dev Tools',
    gems: 'Hidden Gems'
  };

  const platforms = ['vercel', 'github', 'netlify', 'railway', 'onrender', 'bubble', 'framer', 'replit', 'bolt', 'fly', 'lovable'];

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display text-xl font-semibold">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sessionStorage.removeItem('admin-authenticated');
              setIsAuthenticated(false);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Logout
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-6 md:px-12 py-4 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'content'
                ? 'glass-liquid-button bg-blue-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Content Management
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              loadAnalyticsData();
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'glass-liquid-button bg-blue-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Analytics Header */}
              <div>
                <h2 className="font-display text-3xl font-bold mb-2">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  Track user interactions, clicks, and device information
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Total Events</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData.totalEvents}</div>
                </div>

                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">Unique Users</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData.uniqueUsers}</div>
                </div>

                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-muted-foreground">Total Searches</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.topSearches.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MousePointer className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-muted-foreground">Platform Clicks</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.topPlatforms.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                </div>
              </div>

              {/* Top Searches and Platforms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Top Search Queries</h3>
                  <div className="space-y-3">
                    {analyticsData.topSearches.length > 0 ? (
                      analyticsData.topSearches.map((search, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{search.query}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            {search.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No search data yet</p>
                    )}
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Top Platform Filters</h3>
                  <div className="space-y-3">
                    {analyticsData.topPlatforms.length > 0 ? (
                      analyticsData.topPlatforms.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{platform.platform}</span>
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                            {platform.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No platform data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Recent User Activity</h3>
                  <button
                    onClick={() => {
                      analytics.clearEvents();
                      loadAnalyticsData();
                    }}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyticsData.recentEvents.length > 0 ? (
                    analyticsData.recentEvents.map((event, index) => (
                      <div key={index} className="border border-border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-medium">{event.type.replace('_', ' ')}</span>
                            {event.type === 'search' && <Search className="w-3 h-3" />}
                            {event.type === 'click' && <MousePointer className="w-3 h-3" />}
                            {event.type === 'platform_filter' && <Globe className="w-3 h-3" />}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <Smartphone className="w-3 h-3 inline mr-1" />
                            {event.deviceInfo.platform} • {event.deviceInfo.browser}
                            {event.deviceInfo.isMobile && ' (Mobile)'}
                          </div>
                          <div>
                            Screen: {event.deviceInfo.screenResolution}
                          </div>
                          <div>
                            {event.location?.country && `${event.location.city}, ${event.location.country}`}
                            {event.location?.ip && ` (${event.location.ip})`}
                          </div>
                        </div>
                        
                        {event.data.query && (
                          <div className="mt-2 text-xs">
                            <strong>Query:</strong> {event.data.query}
                          </div>
                        )}
                        {event.data.platform && (
                          <div className="mt-2 text-xs">
                            <strong>Platform:</strong> {event.data.platform}
                          </div>
                        )}
                        {event.data.url && (
                          <div className="mt-2 text-xs">
                            <strong>URL:</strong> {event.data.url}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No activity data yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
          {/* Header section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Top Picks Management</h2>
              <p className="text-muted-foreground">
                Manage curated examples of real user-created websites on popular platforms
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="glass-liquid-button bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Pick
            </button>
          </div>

          {/* Add new item form */}
          {showAddForm && (
            <div className="glass rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4">Add New Top Pick</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newItem.title || ''}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="Link"
                  value={newItem.link || ''}
                  onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Snippet"
                  value={newItem.snippet || ''}
                  onChange={(e) => setNewItem({...newItem, snippet: e.target.value})}
                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  rows={3}
                />
                <select
                  value={newItem.platform || ''}
                  onChange={(e) => setNewItem({...newItem, platform: e.target.value})}
                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={newItem.category || 'ai'}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value as 'ai' | 'devtools' | 'gems'})}
                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(categories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAdd}
                  className="glass-liquid-button bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Pick
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
              const categoryItems = topPicks.filter(item => item.category === categoryKey);
              
              return (
                <div key={categoryKey} className="glass rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    {categoryLabel}
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {categoryItems.length} items
                    </span>
                  </h3>
                  
                  {categoryItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No items in this category</p>
                  ) : (
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="border border-border rounded-lg p-4">
                          {editingItem?.id === item.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingItem.title}
                                onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="url"
                                value={editingItem.link}
                                onChange={(e) => setEditingItem({...editingItem, link: e.target.value})}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <textarea
                                value={editingItem.snippet}
                                onChange={(e) => setEditingItem({...editingItem, snippet: e.target.value})}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <select
                                  value={editingItem.platform}
                                  onChange={(e) => setEditingItem({...editingItem, platform: e.target.value})}
                                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {platforms.map(platform => (
                                    <option key={platform} value={platform}>
                                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editingItem.category}
                                  onChange={(e) => setEditingItem({...editingItem, category: e.target.value as 'ai' | 'devtools' | 'gems'})}
                                  className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {Object.entries(categories).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(editingItem)}
                                  className="glass-liquid-button bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="px-3 py-1 border border-border rounded text-sm hover:bg-accent transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{item.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{item.snippet}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                    {item.platform}
                                  </span>
                                  <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {new URL(item.link).hostname}
                                  </a>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;