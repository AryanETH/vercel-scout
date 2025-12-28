import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "./useSupabaseAuth";

export interface BundleWebsite {
  url: string;
  name: string;
}

export interface Bundle {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: string;
  websites: BundleWebsite[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Sample pre-made bundles
export const SAMPLE_BUNDLES: Omit<Bundle, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    name: "Learning & Courses",
    description: "Educational platforms and course providers",
    category: "education",
    websites: [
      { url: "udemy.com", name: "Udemy" },
      { url: "coursera.org", name: "Coursera" },
      { url: "edx.org", name: "edX" },
      { url: "skillshare.com", name: "Skillshare" },
      { url: "pluralsight.com", name: "Pluralsight" },
    ],
    is_public: true,
  },
  {
    name: "Developer Tools",
    description: "Essential tools for developers",
    category: "development",
    websites: [
      { url: "stackoverflow.com", name: "Stack Overflow" },
      { url: "dev.to", name: "DEV Community" },
      { url: "hashnode.com", name: "Hashnode" },
      { url: "medium.com", name: "Medium" },
      { url: "producthunt.com", name: "Product Hunt" },
    ],
    is_public: true,
  },
  {
    name: "Design Inspiration",
    description: "Design galleries and inspiration sites",
    category: "design",
    websites: [
      { url: "dribbble.com", name: "Dribbble" },
      { url: "behance.net", name: "Behance" },
      { url: "awwwards.com", name: "Awwwards" },
      { url: "pinterest.com", name: "Pinterest" },
      { url: "figma.com", name: "Figma Community" },
    ],
    is_public: true,
  },
  {
    name: "News & Tech",
    description: "Stay updated with tech news",
    category: "news",
    websites: [
      { url: "techcrunch.com", name: "TechCrunch" },
      { url: "theverge.com", name: "The Verge" },
      { url: "wired.com", name: "Wired" },
      { url: "arstechnica.com", name: "Ars Technica" },
      { url: "hackernews.com", name: "Hacker News" },
    ],
    is_public: true,
  },
  {
    name: "AI & ML Resources",
    description: "Artificial Intelligence and Machine Learning",
    category: "ai",
    websites: [
      { url: "huggingface.co", name: "Hugging Face" },
      { url: "openai.com", name: "OpenAI" },
      { url: "kaggle.com", name: "Kaggle" },
      { url: "paperswithcode.com", name: "Papers With Code" },
      { url: "arxiv.org", name: "arXiv" },
    ],
    is_public: true,
  },
];

// Popular website suggestions based on category
export const POPULAR_SUGGESTIONS: Record<string, BundleWebsite[]> = {
  learning: [
    { url: "udemy.com", name: "Udemy" },
    { url: "coursera.org", name: "Coursera" },
    { url: "edx.org", name: "edX" },
    { url: "khanacademy.org", name: "Khan Academy" },
    { url: "codecademy.com", name: "Codecademy" },
  ],
  shopping: [
    { url: "amazon.com", name: "Amazon" },
    { url: "ebay.com", name: "eBay" },
    { url: "etsy.com", name: "Etsy" },
    { url: "aliexpress.com", name: "AliExpress" },
    { url: "shopify.com", name: "Shopify" },
  ],
  research: [
    { url: "scholar.google.com", name: "Google Scholar" },
    { url: "researchgate.net", name: "ResearchGate" },
    { url: "arxiv.org", name: "arXiv" },
    { url: "jstor.org", name: "JSTOR" },
    { url: "semanticscholar.org", name: "Semantic Scholar" },
  ],
  development: [
    { url: "github.com", name: "GitHub" },
    { url: "stackoverflow.com", name: "Stack Overflow" },
    { url: "dev.to", name: "DEV" },
    { url: "npmjs.com", name: "npm" },
    { url: "docs.google.com", name: "Google Docs" },
  ],
  design: [
    { url: "dribbble.com", name: "Dribbble" },
    { url: "behance.net", name: "Behance" },
    { url: "figma.com", name: "Figma" },
    { url: "canva.com", name: "Canva" },
    { url: "unsplash.com", name: "Unsplash" },
  ],
  news: [
    { url: "bbc.com", name: "BBC" },
    { url: "cnn.com", name: "CNN" },
    { url: "reuters.com", name: "Reuters" },
    { url: "nytimes.com", name: "NY Times" },
    { url: "theguardian.com", name: "The Guardian" },
  ],
  social: [
    { url: "twitter.com", name: "Twitter" },
    { url: "reddit.com", name: "Reddit" },
    { url: "linkedin.com", name: "LinkedIn" },
    { url: "facebook.com", name: "Facebook" },
    { url: "instagram.com", name: "Instagram" },
  ],
  ai: [
    { url: "openai.com", name: "OpenAI" },
    { url: "huggingface.co", name: "Hugging Face" },
    { url: "kaggle.com", name: "Kaggle" },
    { url: "anthropic.com", name: "Anthropic" },
    { url: "midjourney.com", name: "Midjourney" },
  ],
  custom: [
    { url: "google.com", name: "Google" },
    { url: "wikipedia.org", name: "Wikipedia" },
    { url: "youtube.com", name: "YouTube" },
    { url: "reddit.com", name: "Reddit" },
    { url: "medium.com", name: "Medium" },
  ],
};

export function useBundles() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);

  const fetchBundles = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setBundles([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse websites JSONB field
      const parsedBundles = (data || []).map((b: any) => ({
        ...b,
        websites: Array.isArray(b.websites) ? b.websites : JSON.parse(b.websites || "[]"),
      }));
      
      setBundles(parsedBundles);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const createBundle = useCallback(
    async (bundle: {
      name: string;
      description?: string;
      category: string;
      websites: BundleWebsite[];
      is_public?: boolean;
    }) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("bundles")
          .insert({
            user_id: user.id,
            name: bundle.name,
            description: bundle.description || null,
            category: bundle.category,
            websites: JSON.stringify(bundle.websites) as unknown as any,
            is_public: bundle.is_public ?? false,
          })
          .select()
          .single();

        if (error) throw error;
        
        const websitesData = data.websites;
        const parsedWebsites: BundleWebsite[] = typeof websitesData === 'string' 
          ? JSON.parse(websitesData) 
          : Array.isArray(websitesData) 
            ? (websitesData as unknown as BundleWebsite[])
            : [];
        
        const newBundle: Bundle = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description,
          category: data.category,
          websites: parsedWebsites,
          is_public: data.is_public,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        setBundles((prev) => [newBundle, ...prev]);
        return newBundle;
      } catch (error) {
        console.error("Error creating bundle:", error);
        return null;
      }
    },
    [user]
  );

  const deleteBundle = useCallback(async (bundleId: string) => {
    try {
      const { error } = await supabase.from("bundles").delete().eq("id", bundleId);
      if (error) throw error;
      
      setBundles((prev) => prev.filter((b) => b.id !== bundleId));
      if (activeBundle?.id === bundleId) {
        setActiveBundle(null);
      }
    } catch (error) {
      console.error("Error deleting bundle:", error);
    }
  }, [activeBundle]);

  const clearActiveBundle = useCallback(() => {
    setActiveBundle(null);
  }, []);

  // Get site filters for active bundle (for web search)
  const getBundleSiteFilters = useCallback(() => {
    if (!activeBundle) return null;
    return activeBundle.websites.map((w) => `site:${w.url}`).join(" OR ");
  }, [activeBundle]);

  return {
    bundles,
    isLoading,
    activeBundle,
    setActiveBundle,
    clearActiveBundle,
    createBundle,
    deleteBundle,
    fetchBundles,
    getBundleSiteFilters,
    sampleBundles: SAMPLE_BUNDLES,
  };
}
