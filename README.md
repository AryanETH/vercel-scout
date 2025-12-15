# Vercel Scout

A powerful search engine for discovering portfolios, tools, and projects across 11+ hosting platforms.

## Features

- **Multi-Platform Search**: Search across Vercel, GitHub Pages, Netlify, Railway, OnRender, Bubble, Framer, Replit, Bolt, Fly.io, and Lovable
- **Dual Search Modes**: 
  - Custom API search with platform filtering and pagination
  - Google Custom Search Engine integration
- **Platform Filtering**: Filter results by specific hosting platforms
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Results**: Fast search with loading states and error handling

## Supported Platforms

- **Vercel** (vercel.app)
- **GitHub Pages** (github.io) 
- **Netlify** (netlify.app)
- **Railway** (railway.app)
- **OnRender** (onrender.com)
- **Bubble** (bubbleapps.io)
- **Framer** (framer.website)
- **Replit** (replit.app)
- **Bolt** (bolt.host)
- **Fly.io** (fly.dev)
- **Lovable** (lovable.app)

## Getting Started

```bash
npm install
npm run dev
```

## Search Modes

### Custom Search
- Uses Google Custom Search API
- Platform-specific filtering
- Pagination support
- Interleaved results from multiple platforms

### Google CSE
- Direct Google Custom Search Engine integration
- Uses your configured CSE with all platforms included
- Native Google search interface

## Project Structure

- `src/hooks/useMultiSearch.ts` - Main search logic with multi-platform support
- `src/components/PlatformFilters.tsx` - Platform selection filters
- `src/components/SearchResult.tsx` - Individual search result display with platform badges
- `src/components/GoogleCSE.tsx` - Google Custom Search Engine integration
- `src/components/SearchModeToggle.tsx` - Toggle between custom and Google search

## Technologies Used

- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Google Custom Search API** - Search functionality

## Configuration

The app uses Google Custom Search Engine ID: `c45a3d17b28ad4867` which includes all supported platforms:
- netlify.app
- railway.app  
- bubbleapps.io
- framer.website
- replit.app
- bolt.host
- fly.dev
- lovable.app
- vercel.app
- onrender.com
- github.io