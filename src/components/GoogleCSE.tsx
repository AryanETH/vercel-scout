import { useEffect } from "react";

interface GoogleCSEProps {
  className?: string;
}

export function GoogleCSE({ className }: GoogleCSEProps) {
  useEffect(() => {
    // Load Google CSE script if not already loaded
    if (!document.querySelector('script[src*="cse.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://cse.google.com/cse.js?cx=c45a3d17b28ad4867';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={className}>
      <div className="gcse-search"></div>
    </div>
  );
}