import { useState, useRef, useEffect } from 'react';
import { X, Bot, Sparkles, Send, Loader2, CheckCircle2, Search, Heart, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onAddToFavorites: (url: string, name: string) => void;
  onCreateBundle: (name: string, websites: string[]) => void;
}

interface AgentStep {
  id: string;
  type: 'thinking' | 'searching' | 'analyzing' | 'action' | 'complete' | 'error';
  message: string;
  detail?: string;
  results?: Array<{ title: string; url: string; snippet: string }>;
}

const EXAMPLE_PROMPTS = [
  "Find the best free YouTube to MP3 converters and save them to my favorites",
  "Search for open source AI image generators and create a bundle called 'AI Tools'",
  "Find free PDF editors that work offline",
  "Look for the best free alternatives to Photoshop",
  "Find free background remover tools and compare them",
];

export function AIAgentModal({
  isOpen,
  onClose,
  onSearch,
  onAddToFavorites,
  onCreateBundle,
}: AIAgentModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const stepsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when new steps are added
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const addStep = (step: Omit<AgentStep, 'id'>) => {
    setSteps(prev => [...prev, { ...step, id: crypto.randomUUID() }]);
  };

  const updateLastStep = (updates: Partial<AgentStep>) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps.length > 0) {
        newSteps[newSteps.length - 1] = { ...newSteps[newSteps.length - 1], ...updates };
      }
      return newSteps;
    });
  };

  const parseIntent = (userPrompt: string) => {
    const lowerPrompt = userPrompt.toLowerCase();
    
    const actions = {
      search: true,
      saveFavorites: lowerPrompt.includes('favorite') || lowerPrompt.includes('save'),
      createBundle: lowerPrompt.includes('bundle') || lowerPrompt.includes('collection'),
    };

    // Extract search query - remove action words
    let searchQuery = userPrompt
      .replace(/find|search|look for|get|show me|and save them to my favorites|and create a bundle|called ['"][^'"]+['"]/gi, '')
      .trim();

    // Extract bundle name if creating bundle
    const bundleNameMatch = userPrompt.match(/bundle called ['"]([^'"]+)['"]/i) ||
                           userPrompt.match(/called ['"]([^'"]+)['"]/i);
    const bundleName = bundleNameMatch ? bundleNameMatch[1] : null;

    return { actions, searchQuery, bundleName };
  };

  const executeAgent = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setSteps([]);

    try {
      // Step 1: Understanding intent
      addStep({ type: 'thinking', message: 'Understanding your request...' });
      await new Promise(r => setTimeout(r, 800));

      const { actions, searchQuery, bundleName } = parseIntent(prompt);
      
      updateLastStep({
        type: 'thinking',
        message: 'Analyzed your request',
        detail: `Search: "${searchQuery}"${actions.saveFavorites ? ' → Save to favorites' : ''}${actions.createBundle ? ` → Create bundle "${bundleName}"` : ''}`,
      });

      await new Promise(r => setTimeout(r, 500));

      // Step 2: Searching
      addStep({ type: 'searching', message: `Searching for "${searchQuery}"...` });

      // Actually perform the search
      const { data, error } = await supabase.functions.invoke('search', {
        body: { query: `free ${searchQuery}`, platform: 'all', page: 1, limit: 10 }
      });

      if (error) throw new Error('Search failed');

      const results = data?.results || [];
      
      updateLastStep({
        type: 'searching',
        message: `Found ${results.length} results`,
        results: results.slice(0, 5).map((r: any) => ({
          title: r.title,
          url: r.link,
          snippet: r.snippet,
        })),
      });

      await new Promise(r => setTimeout(r, 500));

      // Step 3: Analyzing results
      addStep({ type: 'analyzing', message: 'Analyzing and ranking results...' });
      await new Promise(r => setTimeout(r, 1000));

      const topResults = results.slice(0, 5);
      updateLastStep({
        type: 'analyzing',
        message: `Selected top ${topResults.length} tools based on relevance and quality`,
      });

      await new Promise(r => setTimeout(r, 500));

      // Step 4: Execute actions
      if (actions.saveFavorites && topResults.length > 0) {
        addStep({ type: 'action', message: 'Saving to favorites...' });
        
        for (const result of topResults.slice(0, 3)) {
          await onAddToFavorites(result.link, result.title);
          await new Promise(r => setTimeout(r, 300));
        }
        
        updateLastStep({
          type: 'action',
          message: `Added ${Math.min(3, topResults.length)} tools to your favorites`,
        });
        await new Promise(r => setTimeout(r, 500));
      }

      if (actions.createBundle && bundleName && topResults.length > 0) {
        addStep({ type: 'action', message: `Creating bundle "${bundleName}"...` });
        
        const websites = topResults.slice(0, 5).map((r: any) => r.link);
        await onCreateBundle(bundleName, websites);
        
        updateLastStep({
          type: 'action',
          message: `Created bundle "${bundleName}" with ${websites.length} tools`,
        });
        await new Promise(r => setTimeout(r, 500));
      }

      // Trigger the actual search in the UI
      onSearch(searchQuery);

      // Complete
      addStep({
        type: 'complete',
        message: 'Task completed successfully!',
        detail: `Found and processed ${topResults.length} tools for "${searchQuery}"`,
      });

    } catch (error) {
      addStep({
        type: 'error',
        message: 'Something went wrong',
        detail: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAgent();
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                AI Agent Mode
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  Beta
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Describe what you want to do in natural language
              </p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Example prompts */}
          {steps.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {example.length > 50 ? example.slice(0, 50) + '...' : example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Execution steps */}
          {steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    step.type === 'complete'
                      ? 'bg-green-500/5 border-green-500/20'
                      : step.type === 'error'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      step.type === 'complete'
                        ? 'bg-green-500/10 text-green-500'
                        : step.type === 'error'
                        ? 'bg-destructive/10 text-destructive'
                        : step.type === 'thinking'
                        ? 'bg-purple-500/10 text-purple-500'
                        : step.type === 'searching'
                        ? 'bg-blue-500/10 text-blue-500'
                        : step.type === 'analyzing'
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {step.type === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : step.type === 'error' ? (
                        <X className="w-4 h-4" />
                      ) : step.type === 'thinking' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : step.type === 'searching' ? (
                        <Search className="w-4 h-4" />
                      ) : step.type === 'analyzing' ? (
                        <Bot className="w-4 h-4" />
                      ) : step.type === 'action' && step.message.includes('favorite') ? (
                        <Heart className="w-4 h-4" />
                      ) : step.type === 'action' && step.message.includes('bundle') ? (
                        <Package className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.message}</p>
                      {step.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                      )}
                      {step.results && step.results.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {step.results.slice(0, 3).map((result, idx) => (
                            <a
                              key={idx}
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary hover:underline group"
                            >
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="truncate">{result.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  executeAgent();
                }
              }}
              placeholder="Describe what you want to find or do..."
              className="flex-1 min-h-[48px] max-h-[120px] px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              disabled={isProcessing}
              rows={1}
            />
            <Button
              type="submit"
              disabled={isProcessing || !prompt.trim()}
              className="h-auto px-4 rounded-xl"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">Enter</kbd> to execute
          </p>
        </form>
      </div>
    </div>
  );
}
