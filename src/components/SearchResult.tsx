import { ExternalLink, Globe } from "lucide-react";

interface SearchResultProps {
  title: string;
  link: string;
  snippet: string;
  index: number;
}

export function SearchResult({ title, link, snippet, index }: SearchResultProps) {
  const displayUrl = link.replace(/^https?:\/\//, "").split("/")[0];

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block glass rounded-2xl p-6 hover-lift opacity-0 animate-slide-up
        hover:bg-accent/50 transition-colors duration-300
      `}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {displayUrl}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold mb-2 line-clamp-2 group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {snippet}
          </p>
        </div>
        <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0" />
      </div>
    </a>
  );
}
