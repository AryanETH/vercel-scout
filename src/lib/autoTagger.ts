export interface TagInfo {
  emoji: string;
  label: string;
  color: string;
}

export function getAutoTag(url: string): TagInfo {
  const lowercaseUrl = url.toLowerCase();
  
  // AI & Next-Gen platforms
  if (lowercaseUrl.includes('lovable') || lowercaseUrl.includes('bolt')) {
    return {
      emoji: '✨',
      label: 'AI',
      color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
    };
  }
  
  // Code repositories and GitHub pages
  if (lowercaseUrl.includes('github.io') || lowercaseUrl.includes('github.com')) {
    return {
      emoji: '💻',
      label: 'Code',
      color: 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30'
    };
  }
  
  // Frontend hosting platforms
  if (lowercaseUrl.includes('vercel') || lowercaseUrl.includes('netlify')) {
    return {
      emoji: '⚛️',
      label: 'Frontend',
      color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
    };
  }
  
  // Backend hosting platforms
  if (lowercaseUrl.includes('render') || lowercaseUrl.includes('railway')) {
    return {
      emoji: '⚙️',
      label: 'Backend',
      color: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'
    };
  }
  
  // Additional platform detection
  if (lowercaseUrl.includes('replit')) {
    return {
      emoji: '🔧',
      label: 'IDE',
      color: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30'
    };
  }
  
  if (lowercaseUrl.includes('fly.io')) {
    return {
      emoji: '🚀',
      label: 'Cloud',
      color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
    };
  }
  
  if (lowercaseUrl.includes('framer')) {
    return {
      emoji: '🎨',
      label: 'Design',
      color: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30'
    };
  }
  
  if (lowercaseUrl.includes('bubble')) {
    return {
      emoji: '🫧',
      label: 'No-Code',
      color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
    };
  }
  
  // Default tag for other web platforms
  return {
    emoji: '🌐',
    label: 'Web',
    color: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30'
  };
}