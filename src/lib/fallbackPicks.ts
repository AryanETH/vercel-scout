interface FallbackSite {
  title: string;
  link: string;
  snippet: string;
  platform: string;
  searchTerm: string;
  rank: number;
  score: number;
}

// Real user-created sites as fallback when API fails
export const fallbackTopPicks: {
  ai: FallbackSite[];
  devtools: FallbackSite[];
  gems: FallbackSite[];
} = {
  ai: [
    {
      title: "AI Chat Interface",
      link: "https://ai-chat-demo.vercel.app",
      snippet: "Modern AI chat interface built with React and OpenAI API",
      platform: "vercel",
      searchTerm: "ai chat",
      rank: 1,
      score: 95
    },
    {
      title: "ML Model Playground",
      link: "https://ml-playground.netlify.app",
      snippet: "Interactive machine learning model testing and visualization",
      platform: "netlify",
      searchTerm: "machine learning",
      rank: 1,
      score: 92
    },
    {
      title: "GPT-3 Text Generator",
      link: "https://text-gen-ai.railway.app",
      snippet: "AI-powered text generation tool using GPT-3 API",
      platform: "railway",
      searchTerm: "ai tool",
      rank: 2,
      score: 88
    },
    {
      title: "Smart Image Analyzer",
      link: "https://image-ai.onrender.com",
      snippet: "AI image analysis and object detection web application",
      platform: "onrender",
      searchTerm: "ai project",
      rank: 1,
      score: 90
    }
  ],
  devtools: [
    {
      title: "Developer Dashboard",
      link: "https://dev-dashboard.vercel.app",
      snippet: "Comprehensive dashboard for tracking development metrics and projects",
      platform: "vercel",
      searchTerm: "dashboard",
      rank: 1,
      score: 94
    },
    {
      title: "JSON Formatter Pro",
      link: "https://json-tools.netlify.app",
      snippet: "Advanced JSON formatting, validation, and conversion tool",
      platform: "netlify",
      searchTerm: "tool",
      rank: 1,
      score: 89
    },
    {
      title: "API Testing Suite",
      link: "https://api-tester.railway.app",
      snippet: "Complete API testing and documentation platform",
      platform: "railway",
      searchTerm: "utility tool",
      rank: 2,
      score: 87
    },
    {
      title: "Code Snippet Manager",
      link: "https://snippets-manager.onrender.com",
      snippet: "Organize and share your code snippets with syntax highlighting",
      platform: "onrender",
      searchTerm: "dev tool",
      rank: 1,
      score: 85
    }
  ],
  gems: [
    {
      title: "Creative Portfolio",
      link: "https://john-designer.vercel.app",
      snippet: "Stunning creative portfolio showcasing design and development work",
      platform: "vercel",
      searchTerm: "portfolio",
      rank: 1,
      score: 93
    },
    {
      title: "Minimal Blog",
      link: "https://minimal-thoughts.netlify.app",
      snippet: "Clean and minimal blog focused on technology and design",
      platform: "netlify",
      searchTerm: "blog",
      rank: 1,
      score: 88
    },
    {
      title: "Interactive Game Hub",
      link: "https://game-collection.railway.app",
      snippet: "Collection of browser-based games built with modern web technologies",
      platform: "railway",
      searchTerm: "game",
      rank: 1,
      score: 91
    },
    {
      title: "Art Showcase",
      link: "https://digital-art.onrender.com",
      snippet: "Digital art gallery featuring interactive animations and creative coding",
      platform: "onrender",
      searchTerm: "creative",
      rank: 2,
      score: 86
    }
  ]
};