<div align="center">
  <img src="public/logo.svg" alt="Yourel Logo" width="120" height="120" />
  
  # Yourel
  
  **Discover FREE Indie-Built Tools & Projects**
  
  A modern search engine for finding free tools, apps, and projects hosted on developer-friendly platforms.

  [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://yourel.lovable.app)
  [![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4?style=for-the-badge)](https://lovable.dev)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

  [Live Demo](https://yourel.lovable.app) • [Report Bug](https://github.com/yourusername/yourel/issues) • [Request Feature](https://github.com/yourusername/yourel/issues)

</div>

---

## ✨ Features

### 🔍 Smart Search
- **Multi-Platform Search** - Search across Vercel, Netlify, GitHub Pages, Railway, Lovable, Replit, and more
- **AI-Powered Summaries** - Get intelligent summaries of search results powered by Gemini AI
- **Real-time Suggestions** - Autocomplete suggestions as you type
- **Platform Filters** - Filter results by specific hosting platforms

### 📦 Custom Bundles
- **Create Bundles** - Group websites into custom search bundles
- **Pre-made Templates** - Use curated bundles for Learning, Dev Tools, Design, AI, and more
- **Share Bundles** - Share your bundles with others via unique links
- **Focused Search** - Search only within your bundle's websites

### ❤️ Favorites & Profiles
- **Save Favorites** - Bookmark your favorite discoveries
- **Public Profiles** - Share your profile and favorites at `/u/username`
- **Personalized Experience** - Your favorites sync across devices

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- **Animated Grid Background** - Subtle comet animations for visual appeal
- **Loading States** - Smooth skeleton loaders and transitions

### 🤖 AI Features
- **Smart Summaries** - AI analyzes search results and provides curated recommendations
- **Free Tools Only** - AI filters out paid/freemium tools automatically
- **Popularity Ranking** - Results ranked by community adoption and activity

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Search API** | Firecrawl |
| **AI** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Deployment** | Lovable / Vercel |
| **State Management** | React Query (TanStack Query) |
| **Routing** | React Router v6 |

---

## 📁 Project Structure

```
yourel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── SearchInput.tsx  # Main search input
│   │   ├── SearchResult.tsx # Result card component
│   │   ├── BundleSelector.tsx
│   │   ├── TopPicks.tsx
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Home/Search page
│   │   ├── Auth.tsx         # Authentication
│   │   ├── UserProfile.tsx  # Public profiles
│   │   └── Admin.tsx        # Admin dashboard
│   ├── hooks/               # Custom React hooks
│   │   ├── useMultiSearch.ts
│   │   ├── useBundles.ts
│   │   ├── useSupabaseAuth.ts
│   │   └── ...
│   ├── lib/                 # Utilities & API
│   │   └── api/
│   │       └── search.ts    # Search API client
│   └── integrations/        # Third-party integrations
│       └── supabase/
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── web-search/      # Main search function
│   │   ├── ai-search/       # AI summary generation
│   │   ├── search-suggestions/
│   │   ├── crawl-site/
│   │   └── update-daily-picks/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account
- Firecrawl API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yourel.git
   cd yourel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Deploy Edge Functions
   - Add secrets: `FIRECRAWL_API_KEY`, `LOVABLE_API_KEY`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📊 Database Schema

```sql
-- Core Tables
profiles        -- User profiles with username, avatar
favorites       -- User's saved favorite sites
bundles         -- Custom search bundles
indexed_sites   -- Pre-indexed sites for local search
daily_top_picks -- Curated daily recommendations
search_history  -- Search analytics
```

---

## 🔌 API Endpoints (Edge Functions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/web-search` | POST | Search across platforms via Firecrawl |
| `/functions/v1/ai-search` | POST | Generate AI summary of results |
| `/functions/v1/search` | POST | Search local indexed sites |
| `/functions/v1/search-suggestions` | POST | Get autocomplete suggestions |
| `/functions/v1/crawl-site` | POST | Index a new site |
| `/functions/v1/update-daily-picks` | POST | Refresh daily picks |

---

## 🎯 Supported Platforms

| Platform | Domain | Badge Color |
|----------|--------|-------------|
| Vercel | `.vercel.app` | ⚫ Black |
| Netlify | `.netlify.app` | 🔵 Teal |
| GitHub Pages | `.github.io` | ⚫ Gray |
| Railway | `.railway.app` | 🟣 Purple |
| Render | `.onrender.com` | 🟢 Green |
| Lovable | `.lovable.app` | 💜 Pink |
| Replit | `.replit.app` | 🟠 Orange |
| Fly.io | `.fly.dev` | 🟣 Purple |
| Framer | `.framer.website` | 🔵 Blue |
| Bubble | `.bubbleapps.io` | 🔵 Blue |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Lovable](https://lovable.dev) - AI-powered app development
- [Supabase](https://supabase.com) - Backend as a Service
- [Firecrawl](https://firecrawl.dev) - Web search API
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

<div align="center">
  
  **Made with ❤️ by [Sahil Kumar](https://github.com/yourusername)**
  
  ⭐ Star this repo if you found it useful!
  
</div>
