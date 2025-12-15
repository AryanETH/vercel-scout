import { Settings, ExternalLink, ArrowRight } from "lucide-react";

interface SetupPromptProps {
  onConfigure: () => void;
}

export function SetupPrompt({ onConfigure }: SetupPromptProps) {
  return (
    <div className="max-w-xl mx-auto animate-fade-up">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-6 flex items-center justify-center animate-float">
          <Settings className="w-7 h-7" />
        </div>
        
        <h3 className="font-display text-2xl font-semibold mb-3">
          Quick Setup Required
        </h3>
        <p className="text-muted-foreground mb-6">
          To search Vercel sites, you'll need a Google Custom Search Engine ID. 
          It takes about 2 minutes to set up.
        </p>

        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-sm font-medium">Create a search engine</p>
              <a
                href="https://programmablesearchengine.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                programmablesearchengine.google.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-sm font-medium">Set sites to search</p>
              <code className="text-xs text-muted-foreground font-mono">*.vercel.app</code>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-sm font-medium">Copy your Search Engine ID</p>
              <p className="text-xs text-muted-foreground">Found in the control panel after creation</p>
            </div>
          </div>
        </div>

        <button
          onClick={onConfigure}
          className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Configure Search Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
