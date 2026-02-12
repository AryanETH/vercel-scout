import { useEffect, useState } from "react";

const platforms = ["Vercel", "GitHub", "OnRender", "Lovable", "Bolt", "Netlify", "Replit"];

export function AnimatedTitle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % platforms.length);
        setIsVisible(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-up text-black dark:text-white">
      Find{" "}
      <span
        className={`inline-block transition-all duration-400 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        {platforms[currentIndex]}
      </span>{" "}
      Sites
    </h2>
  );
}
