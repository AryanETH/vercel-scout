import { Triangle } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3 animate-fade-up">
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/20 blur-xl rounded-full animate-glow-pulse" />
        <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
          <Triangle className="w-5 h-5 text-primary-foreground fill-current" />
        </div>
      </div>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight">
          VercelFinder
        </h1>
        <p className="text-xs text-muted-foreground -mt-0.5">
          Discover Vercel sites
        </p>
      </div>
    </div>
  );
}
