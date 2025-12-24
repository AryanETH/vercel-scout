import { Sparkles, Loader2 } from "lucide-react";

interface AISummaryCardProps {
  summary: string | null;
  isLoading: boolean;
}

export function AISummaryCard({ summary, isLoading }: AISummaryCardProps) {
  if (!isLoading && !summary) return null;

  return (
    <div className="glass rounded-2xl p-6 mb-6 animate-fade-in border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
            AI Summary
            {isLoading && <span className="text-xs text-muted-foreground font-normal">Thinking...</span>}
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
