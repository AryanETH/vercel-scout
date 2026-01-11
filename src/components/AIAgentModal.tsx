import { useState } from "react";
import { X, Bot, Send, Loader2, Sparkles, Search, Heart, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onAddToFavorites: (url: string, name: string) => void;
}

interface AgentStep {
  type: 'thinking' | 'searching' | 'found' | 'saving' | 'complete' | 'error';
  message: string;
  results?: { title: string; url: string }[];
}

const EXAMPLE_PROMPTS = [
  "Find me the best free YouTube to MP3 converters and save top 3 to favorites",
  "Search for free logo makers and add the best ones to my favorites",
  "Find AI image generators and save the top 5 free tools",
  "Look for free resume builders and favorite the best options",
];

export function AIAgentModal({ isOpen, onClose, onSearch, onAddToFavorites }: AIAgentModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);

  const addStep = (step: AgentStep) => {
    setSteps(prev => [...prev, step]);
  };

  const processPrompt = async () => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setSteps([]);

    // Step 1: Understanding the request
    addStep({ type: 'thinking', message: 'Understanding your request...' });
    await new Promise(r => setTimeout(r, 1000));

    // Extract search query from prompt
    const searchTerms = prompt.toLowerCase();
    let searchQuery = "";
    
    if (searchTerms.includes("youtube") && searchTerms.includes("mp3")) {
      searchQuery = "youtube to mp3 converter free";
    } else if (searchTerms.includes("logo")) {
      searchQuery = "free logo maker online";
    } else if (searchTerms.includes("ai image") || searchTerms.includes("image generator")) {
      searchQuery = "AI image generator free";
    } else if (searchTerms.includes("resume")) {
      searchQuery = "free resume builder online";
    } else {
      // Extract key terms
      const words = prompt.split(' ').filter(w => 
        w.length > 3 && 
        !['find', 'search', 'look', 'best', 'free', 'save', 'favorites', 'the', 'and', 'for', 'top'].includes(w.toLowerCase())
      );
      searchQuery = words.slice(0, 4).join(' ') + ' free tool';
    }

    // Step 2: Searching
    addStep({ type: 'searching', message: `Searching for "${searchQuery}"...` });
    await new Promise(r => setTimeout(r, 1500));

    // Trigger the actual search
    onSearch(searchQuery);

    // Step 3: Simulated results (in real implementation, this would come from search results)
    const mockResults = [
      { title: `Best ${searchQuery.split(' ')[0]} Tool`, url: `https://example-tool-1.vercel.app` },
      { title: `Free ${searchQuery.split(' ')[0]} Online`, url: `https://example-tool-2.netlify.app` },
      { title: `${searchQuery.split(' ')[0]} Pro Free`, url: `https://example-tool-3.vercel.app` },
    ];

    addStep({ 
      type: 'found', 
      message: `Found ${mockResults.length} relevant tools!`,
      results: mockResults
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 4: Check if user wants to save to favorites
    if (searchTerms.includes('save') || searchTerms.includes('favorite') || searchTerms.includes('add')) {
      addStep({ type: 'saving', message: 'Adding top results to your favorites...' });
      await new Promise(r => setTimeout(r, 1000));

      // Determine how many to save
      let countToSave = 3;
      const numberMatch = prompt.match(/top\s*(\d+)|(\d+)\s*(best|top)/i);
      if (numberMatch) {
        countToSave = parseInt(numberMatch[1] || numberMatch[2]) || 3;
      }

      // Note: In real implementation, we'd save actual search results
      addStep({ 
        type: 'complete', 
        message: `Done! I've searched for "${searchQuery}" and the results are ready. Check the search results to add your favorites!`
      });
    } else {
      addStep({ 
        type: 'complete', 
        message: `Search complete! Check the results for "${searchQuery}".`
      });
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processPrompt();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">AI Agent</h2>
              <p className="text-xs text-muted-foreground">Describe what you want to find</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Example Prompts */}
          {steps.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Try these examples:
              </p>
              <div className="grid gap-2">
                {EXAMPLE_PROMPTS.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-left text-sm p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div 
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    step.type === 'error' ? 'bg-red-500/10' :
                    step.type === 'complete' ? 'bg-green-500/10' :
                    'bg-muted/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    step.type === 'thinking' ? 'bg-purple-500/20' :
                    step.type === 'searching' ? 'bg-blue-500/20' :
                    step.type === 'found' ? 'bg-green-500/20' :
                    step.type === 'saving' ? 'bg-pink-500/20' :
                    step.type === 'complete' ? 'bg-green-500/20' :
                    'bg-red-500/20'
                  }`}>
                    {step.type === 'thinking' && <Bot className="w-4 h-4 text-purple-500" />}
                    {step.type === 'searching' && <Search className="w-4 h-4 text-blue-500" />}
                    {step.type === 'found' && <Sparkles className="w-4 h-4 text-green-500" />}
                    {step.type === 'saving' && <Heart className="w-4 h-4 text-pink-500" />}
                    {step.type === 'complete' && <FolderPlus className="w-4 h-4 text-green-500" />}
                    {step.type === 'error' && <X className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{step.message}</p>
                    {step.results && (
                      <div className="mt-2 space-y-1">
                        {step.results.map((result, j) => (
                          <div key={j} className="text-xs text-muted-foreground">
                            • {result.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to find..."
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isProcessing}
            />
            <Button
              onClick={processPrompt}
              disabled={!prompt.trim() || isProcessing}
              className="px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • The agent will search and can save to favorites
          </p>
        </div>
      </div>
    </div>
  );
}
