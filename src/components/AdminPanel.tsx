import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WebsiteSuggestion {
  id: string;
  website: string;
  category: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [suggestions, setSuggestions] = useState<WebsiteSuggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
    }
  }, [isAuthenticated]);

  const loadSuggestions = () => {
    const saved = JSON.parse(localStorage.getItem('yourel_suggestions') || '[]');
    setSuggestions(saved);
  };

  const handleAuthenticate = () => {
    if (password === "686") {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const updateSuggestionStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = suggestions.map(s => 
      s.id === id ? { ...s, status } : s
    );
    setSuggestions(updated);
    localStorage.setItem('yourel_suggestions', JSON.stringify(updated));
    
    toast({
      title: status === 'approved' ? "Approved" : "Rejected",
      description: `Website suggestion has been ${status}`,
    });
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const reviewedSuggestions = suggestions.filter(s => s.status !== 'pending');

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Access
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">
                Enter admin password to access the panel
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
              />
            </div>
            
            <Button 
              onClick={handleAuthenticate} 
              disabled={!password.trim()}
              className="w-full"
            >
              Access Admin Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Panel - Website Suggestions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Pending Suggestions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Pending Review ({pendingSuggestions.length})
            </h3>
            {pendingSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No pending suggestions
              </p>
            ) : (
              <div className="space-y-3">
                {pendingSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <a 
                            href={suggestion.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                          >
                            {suggestion.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <Badge variant="outline">{suggestion.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(suggestion.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Suggestions */}
          {reviewedSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Reviewed ({reviewedSuggestions.length})
              </h3>
              <div className="space-y-2">
                {reviewedSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <a 
                        href={suggestion.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {suggestion.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Badge variant={suggestion.status === 'approved' ? 'default' : 'destructive'}>
                      {suggestion.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}