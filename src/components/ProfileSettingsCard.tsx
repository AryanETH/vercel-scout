import { useState, useRef, useEffect } from "react";
import { X, Image, Upload, Check, Trash2, Camera } from "lucide-react";
import { imageStorage } from "@/lib/imageStorage";
import { useUnsplashDaily } from "@/hooks/useUnsplashDaily";

interface ProfileSettingsCardProps {
  isOpen: boolean;
  onClose: () => void;
}

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

interface BackgroundOption {
  id: string;
  url: string;
  name: string;
  type: 'yourel' | 'custom' | 'pexels';
  photographer?: string;
}

// Seasons Collection - Static beautiful images
const seasonsBackgrounds: BackgroundOption[] = [
  {
    id: 'season-mountains',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    name: 'Mountains',
    type: 'yourel',
    photographer: 'Samuel Ferrara'
  },
  {
    id: 'season-ocean',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    name: 'Ocean',
    type: 'yourel',
    photographer: 'Matt Hardy'
  },
  {
    id: 'season-forest',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    name: 'Forest',
    type: 'yourel',
    photographer: 'Lukasz Szmigiel'
  },
  {
    id: 'season-ice',
    url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=80',
    name: 'Ice & Snow',
    type: 'yourel',
    photographer: 'Joshua Earle'
  }
];

export function ProfileSettingsCard({ isOpen, onClose }: ProfileSettingsCardProps) {
  const [showBackgrounds, setShowBackgrounds] = useState(true);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([]);
  const [activeTab, setActiveTab] = useState<'yourel' | 'custom'>('yourel');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { dailyImage } = useUnsplashDaily();

  // Load settings from localStorage and IndexedDB
  useEffect(() => {
    const loadSettings = async () => {
      const savedShowBg = localStorage.getItem('yourel-show-backgrounds');
      const savedSelectedBg = localStorage.getItem('yourel-selected-background');
      
      if (savedShowBg !== null) setShowBackgrounds(savedShowBg === 'true');
      if (savedSelectedBg) setSelectedBackground(savedSelectedBg);
      
      // Load custom backgrounds from IndexedDB
      try {
        const storedImages = await imageStorage.getAllImages();
        const customBgs: BackgroundOption[] = storedImages.map(img => ({
          id: img.id,
          url: img.data,
          name: img.name,
          type: 'custom' as const
        }));
        setCustomBackgrounds(customBgs);
      } catch (error) {
        console.error('Failed to load custom backgrounds:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to localStorage (not custom backgrounds - those go to IndexedDB)
  const saveSettings = (showBg: boolean, selectedBg: string | null) => {
    console.log('Saving settings:', { showBg, selectedBg: selectedBg?.substring(0, 50) });
    
    localStorage.setItem('yourel-show-backgrounds', showBg.toString());
    if (selectedBg) {
      localStorage.setItem('yourel-selected-background', selectedBg);
    } else {
      localStorage.removeItem('yourel-selected-background');
    }
    
    // Dispatch custom event to notify background component
    window.dispatchEvent(new CustomEvent('background-settings-changed', {
      detail: { showBackgrounds: showBg, selectedBackground: selectedBg }
    }));
  };

  const handleToggleBackgrounds = () => {
    const newValue = !showBackgrounds;
    setShowBackgrounds(newValue);
    saveSettings(newValue, selectedBackground);
  };

  const handleSelectBackground = (url: string) => {
    setSelectedBackground(url);
    saveSettings(showBackgrounds, url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 15MB for GIFs, 10MB for others)
    const maxSize = file.type === 'image/gif' ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Image is too large. Please select an image under ${file.type === 'image/gif' ? '15MB' : '10MB'}.`);
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      if (!imageUrl) {
        alert('Failed to read image file.');
        return;
      }

      const imageId = `custom-${Date.now()}`;
      const imageName = file.name.split('.')[0] || 'custom-background';

      // Try to save to IndexedDB first
      try {
        await imageStorage.saveImage(imageId, imageName, imageUrl);
        
        const newBg: BackgroundOption = {
          id: imageId,
          url: imageUrl,
          name: imageName,
          type: 'custom'
        };
        setCustomBackgrounds(prev => [...prev, newBg]);
        setSelectedBackground(imageUrl);
        saveSettings(showBackgrounds, imageUrl);
      } catch (error) {
        console.error('IndexedDB save failed, using direct URL:', error);
        
        // Fallback: just use the image URL directly without saving to IndexedDB
        const newBg: BackgroundOption = {
          id: imageId,
          url: imageUrl,
          name: imageName,
          type: 'custom'
        };
        setCustomBackgrounds(prev => [...prev, newBg]);
        setSelectedBackground(imageUrl);
        saveSettings(showBackgrounds, imageUrl);
      }
    };

    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      alert('Failed to read image file. Please try again.');
    };

    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteCustomBackground = async (id: string) => {
    try {
      await imageStorage.deleteImage(id);
      const deletedBg = customBackgrounds.find(bg => bg.id === id);
      const updatedCustomBgs = customBackgrounds.filter(bg => bg.id !== id);
      setCustomBackgrounds(updatedCustomBgs);
      
      // If the deleted background was selected, clear selection
      if (deletedBg && selectedBackground === deletedBg.url) {
        setSelectedBackground(null);
        saveSettings(showBackgrounds, null);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Don't show on mobile - background customization is PC/tablet only
  if (isMobile) {
    onClose();
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-end p-4 pt-16"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold">Customize Page</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Show Background Images Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Show Background Images</span>
            </div>
            <button
              onClick={handleToggleBackgrounds}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showBackgrounds ? 'bg-blue-600' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showBackgrounds ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Background Selection */}
          {showBackgrounds && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'custom'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Use your own
                </button>
                <button
                  onClick={() => setActiveTab('yourel')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'yourel'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yourel backgrounds
                </button>
              </div>

              {/* Custom Upload Tab */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-500/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload from device</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.ico,.tiff,.avif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Custom Backgrounds Grid */}
                  {customBackgrounds.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {customBackgrounds.map((bg) => (
                        <div
                          key={bg.id}
                          className="relative group"
                        >
                          <button
                            onClick={() => handleSelectBackground(bg.url)}
                            className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                              selectedBackground === bg.url
                                ? 'border-blue-600 ring-2 ring-blue-600/20'
                                : 'border-border hover:border-blue-500'
                            }`}
                          >
                            <img
                              src={bg.url}
                              alt={bg.name}
                              className="w-full h-full object-cover"
                            />
                            {selectedBackground === bg.url && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomBackground(bg.id)}
                            className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{bg.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Yourel Backgrounds Tab - Now shows Unsplash Daily Image */}
              {activeTab === 'yourel' && (
                <div className="space-y-4">
                  {/* Today's Pick from Unsplash */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Today's Pick</h4>
                    {dailyImage ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSelectBackground(dailyImage.url)}
                          className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                            selectedBackground === dailyImage.url
                              ? 'border-blue-600 ring-2 ring-blue-600/20'
                              : 'border-border hover:border-blue-500'
                          }`}
                        >
                          <img
                            src={dailyImage.url}
                            alt={dailyImage.alt}
                            className="w-full h-full object-cover"
                          />
                          {selectedBackground === dailyImage.url && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <div className="flex items-center gap-2">
                              <Camera className="w-3 h-3 text-white/80" />
                              <p className="text-xs text-white font-medium">
                                Photo by {dailyImage.photographer}
                              </p>
                            </div>
                          </div>
                        </button>
                        <p className="text-xs text-muted-foreground text-center">
                          New nature image every day from Unsplash
                        </p>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl bg-muted animate-pulse flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Loading today's image...</span>
                      </div>
                    )}
                  </div>

                  {/* Seasons Collection */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Seasons Collection</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {seasonsBackgrounds.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleSelectBackground(bg.url)}
                          className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                            selectedBackground === bg.url
                              ? 'border-blue-600 ring-2 ring-blue-600/20'
                              : 'border-border hover:border-blue-500'
                          }`}
                        >
                          <img
                            src={bg.url.replace('w=1920', 'w=400')}
                            alt={bg.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedBackground === bg.url && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white font-medium">{bg.name}</p>
                            {bg.photographer && (
                              <p className="text-[10px] text-white/70">by {bg.photographer}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Use Default Option */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Default</h4>
                    <button
                      onClick={() => {
                        setSelectedBackground(null);
                        saveSettings(showBackgrounds, null);
                      }}
                      className={`relative w-full py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        selectedBackground === null
                          ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-600/10'
                          : 'border-border hover:border-blue-500'
                      }`}
                    >
                      {selectedBackground === null && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">Use Daily Unsplash Image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}