import { useState, useEffect } from 'react';

const searchTerms = [
  'AI tools',
  'Free tools',
  'Portfolios',
  'Side projects',
  'Hackathon projects',
  'Student projects',
  'Developer tools',
  'Productivity tools',
  'Open-source tools',
  'React projects',
  'Next.js apps',
  'Chatbots',
  'Landing pages',
  'Dashboards',
  'APIs',
  'Games',
  'Design portfolios',
  'SaaS',
  'Web apps'
];

export function useAnimatedPlaceholder() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentTerm = searchTerms[currentIndex];
    
    if (isTyping) {
      // Typing animation
      if (displayText.length < currentTerm.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentTerm.slice(0, displayText.length + 1));
        }, 100); // 100ms per character
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait 1 second then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing animation
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50); // Faster erasing
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next term
        setCurrentIndex((prev) => (prev + 1) % searchTerms.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, currentIndex]);

  return `Search ${displayText}`;
}