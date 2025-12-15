interface DailyPickTemplate {
  name: string;
  description: string;
  baseUrl: string;
  category: "ai" | "devtools" | "gems";
}

const pickTemplates: DailyPickTemplate[] = [
  // 🤖 AI & Next-Gen
  {
    name: "Daily AI Demo",
    description: "Fresh AI-generated web apps deployed every day",
    baseUrl: "ai-demo-{date}.vercel.app",
    category: "ai"
  },
  {
    name: "Bolt Showcase",
    description: "Today's featured full-stack app built with AI",
    baseUrl: "showcase-{weekday}-{shortdate}.bolt.new",
    category: "ai"
  },
  {
    name: "Lovable Daily",
    description: "Fresh AI-built project rotating every 24 hours",
    baseUrl: "daily-build-{datecompact}.lovable.dev",
    category: "ai"
  },
  {
    name: "v0 Featured",
    description: "Today's top AI-generated UI component showcase",
    baseUrl: "featured-{shortdate}-{year}.v0.dev",
    category: "ai"
  },

  // 🛠️ Dev Tools
  {
    name: "Dev Tool of the Day",
    description: "Rotating developer utility hosted on Railway",
    baseUrl: "devtool-{weekday}-{monthday}.railway.app",
    category: "devtools"
  },
  {
    name: "Code Playground",
    description: "Daily coding challenge and sandbox environment",
    baseUrl: "playground-{datecompact}.netlify.app",
    category: "devtools"
  },
  {
    name: "Transform Daily",
    description: "Fresh data transformation tools updated daily",
    baseUrl: "transform-{shortdate}.vercel.app",
    category: "devtools"
  },
  {
    name: "API Explorer",
    description: "Today's featured API testing and documentation tool",
    baseUrl: "api-explorer-{monthday}.onrender.com",
    category: "devtools"
  },

  // 💎 Hidden Gems
  {
    name: "Design Gem",
    description: "Daily rotating design tool and creative showcase",
    baseUrl: "gem-{weekday}-{shortdate}.netlify.app",
    category: "gems"
  },
  {
    name: "Micro Tool",
    description: "Tiny utility that changes every day - today's pick",
    baseUrl: "micro-{datecompact}.vercel.app",
    category: "gems"
  },
  {
    name: "Creative Canvas",
    description: "Fresh creative tool or art project updated daily",
    baseUrl: "canvas-{shortdate}-{year}.railway.app",
    category: "gems"
  },
  {
    name: "Hidden Feature",
    description: "Discover today's secret web app with unique functionality",
    baseUrl: "hidden-{monthday}-{weekday}.onrender.com",
    category: "gems"
  }
];

function formatDateTokens(template: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const shortWeekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  
  return template
    .replace('{year}', String(year))
    .replace('{month}', month)
    .replace('{day}', day)
    .replace('{monthday}', month + day)
    .replace('{datecompact}', year + month + day)
    .replace('{date}', year + '-' + month + '-' + day)
    .replace('{shortdate}', monthName + day)
    .replace('{weekday}', weekday)
    .replace('{shortweekday}', shortWeekday);
}

export function generateDailyPicks() {
  return pickTemplates.map(template => ({
    name: template.name,
    description: template.description,
    url: `https://${formatDateTokens(template.baseUrl)}`,
    category: template.category
  }));
}