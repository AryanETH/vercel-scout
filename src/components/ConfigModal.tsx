import { useState } from "react";
import { Settings, ExternalLink, X } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cseId: string) => void;
  currentId: string;
}

export function ConfigModal({ isOpen, onClose, onSave, currentId }: ConfigModalProps) {
  const [cseId, setCseId] = useState(currentId);

  if (!isOpen) return null;

  const handleSave = () => {
    if (cseId.trim()) {
      onSave(cseId.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass rounded-2xl shadow-glow animate-scale-in overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-semibold">Configuration</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Custom Search Engine ID
              </label>
              <input
                type="text"
                value={cseId}
                onChange={(e) => setCseId(e.target.value)}
                placeholder="e.g., 017576662512468239146:omuauf_gy2o"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <p className="text-sm text-muted-foreground">
                To get your Search Engine ID:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to Google Programmable Search Engine</li>
                <li>Create a new search engine</li>
                <li>Set "Sites to search" to <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">*.vercel.app</code></li>
                <li>Copy the Search Engine ID</li>
              </ol>
              <a
                href="https://programmablesearchengine.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline mt-2"
              >
                Open Google PSE
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!cseId.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
