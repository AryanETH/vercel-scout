import { Sparkles, Loader2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface AISummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  searchQuery?: string;
}

interface ParsedSummary {
  topic: string;
  description: string;
  links: { title: string; url: string; description: string }[];
  sources: string[];
  conclusionSummary: string;
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/`/g, '')
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseSummary(summary: string): ParsedSummary {
  const cleanedSummary = cleanText(summary);
  const lines = cleanedSummary.split('\n').filter(line => line.trim());
  
  const result: ParsedSummary = {
    topic: '',
    description: '',
    links: [],
    sources: [],
    conclusionSummary: ''
  };

  const urlRegex = /https?:\/\/[^\s)]+/g;
  const allUrls = cleanedSummary.match(urlRegex) || [];
  
  let currentSection = 'description';
  const descriptionParts: string[] = [];
  const summaryParts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    if (!result.topic && (lowerLine.startsWith('keywords:') || lowerLine.startsWith('topic:') || i === 0)) {
      result.topic = line.replace(/^keywords?:\s*/i, '').replace(/^topic:\s*/i, '').replace(/^you're looking for\s*/i, '');
      continue;
    }
    
    if (lowerLine.includes('http://') || lowerLine.includes('https://')) {
      const urls = line.match(urlRegex);
      if (urls) {
        urls.forEach(url => {
          const titleMatch = line.match(/\d+\.\s*([^(]+)\s*\(/) || line.match(/([^:]+):\s*http/);
          const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
          
          const afterUrl = line.split(url)[1] || '';
          const description = cleanText(afterUrl).replace(/^[\s:.-]+/, '').trim();
          
          if (!result.links.find(l => l.url === url)) {
            result.links.push({ title, url, description });
          }
        });
      }
      continue;
    }
    
    if (lowerLine.startsWith('summary:') || lowerLine.includes('you could also') || lowerLine.includes('in summary')) {
      currentSection = 'summary';
      const summaryText = line.replace(/^summary:\s*/i, '');
      if (summaryText) summaryParts.push(summaryText);
      continue;
    }
    
    if (currentSection === 'summary') {
      summaryParts.push(line);
    } else {
      descriptionParts.push(line);
    }
  }
  
  result.description = descriptionParts.join(' ').trim();
  result.conclusionSummary = summaryParts.join(' ').trim();
  result.sources = allUrls.map(url => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  });

  return result;
}

export function AISummaryCard({ summary, isLoading, searchQuery }: AISummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const parsed = useMemo(() => {
    if (!summary) return null;
    return parseSummary(summary);
  }, [summary]);

  if (!isLoading && !summary) return null;

  // Mobile: collapsible card like Google AI Overview
  // Desktop: full card always visible
  return (
    <div className="mb-4 md:mb-6 animate-fade-in">
      {/* Mobile view - collapsible */}
      <div className="md:hidden">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
              <span className="font-semibold text-foreground">AI Overview</span>
            </div>
            {parsed?.sources && parsed.sources.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {[...new Set(parsed.sources)].slice(0, 3).map((source, idx) => (
                    <div 
                      key={idx}
                      className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground"
                    >
                      {source.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {parsed.sources.length > 3 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{parsed.sources.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
              </div>
            ) : parsed && (
              <div className={`relative ${!isExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
                {/* Main description with highlighted keywords */}
                <p className="text-sm text-foreground leading-relaxed">
                  {parsed.description || parsed.conclusionSummary}
                </p>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {/* Links section */}
                    {parsed.links.length > 0 && (
                      <div>
                        <h4 className="text-primary font-medium text-sm mb-2">Related Resources</h4>
                        <div className="space-y-2">
                          {parsed.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Summary */}
                    {parsed.conclusionSummary && parsed.description && (
                      <p className="text-sm text-muted-foreground">{parsed.conclusionSummary}</p>
                    )}
                  </div>
                )}
                
                {/* Fade gradient when collapsed */}
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
                )}
              </div>
            )}
          </div>

          {/* Show more/less button */}
          {!isLoading && parsed && (
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full rounded-none border-t border-border/50 h-11 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop view - full card */}
      <div className="hidden md:block bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
              AI Summary
              {isLoading && <span className="text-xs text-muted-foreground font-normal">Generating...</span>}
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
              </div>
            ) : parsed && (
              <div className="space-y-4">
                {/* Keywords */}
                {(searchQuery || parsed.topic) && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(searchQuery || parsed.topic).split(/\s+/).filter(Boolean).map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Description */}
                {parsed.description && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Overview</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{parsed.description}</p>
                  </div>
                )}
                
                {/* Links */}
                {parsed.links.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recommended</h4>
                    <div className="space-y-1">
                      {parsed.links.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 rounded-lg p-2 -mx-2 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm text-primary font-medium hover:underline block truncate">
                              {link.title}
                            </span>
                            {link.description && (
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {link.description}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Summary */}
                {parsed.conclusionSummary && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{parsed.conclusionSummary}</p>
                  </div>
                )}
                
                {/* Sources */}
                {parsed.sources.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Sources:</span>
                      <span className="text-foreground/70">
                        {[...new Set(parsed.sources)].join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
