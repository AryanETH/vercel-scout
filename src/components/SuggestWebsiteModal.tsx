import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuggestWebsiteModalProps {
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

const categories = [
  "Portfolio",
  "E-commerce",
  "Blog",
  "SaaS",
  "Landing Page",
  "Documentation",
  "Creative",
  "Business",
  "Educational",
  "Entertainment",
  "Other"
];

export function SuggestWebsiteModal({ isOpen, onClose }: SuggestWebsiteModalProps) {
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!website.trim() || !category || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(website.startsWith('http') ? website : `https://${website}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const suggestion: WebsiteSuggestion = {
      id: Date.now().toString(),
      website: website.startsWith('http') ? website : `https://${website}`,
      category,
      description,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Save to localStorage (in a real app, this would be sent to a server)
    const existingSuggestions = JSON.parse(localStorage.getItem('yourel_suggestions') || '[]');
    existingSuggestions.push(suggestion);
    localStorage.setItem('yourel_suggestions', JSON.stringify(existingSuggestions));

    toast({
      title: "Website Suggested! 🎉",
      description: "Thank you for your suggestion. It will be reviewed soon.",
    });

    // Reset form
    setWebsite("");
    setCategory("");
    setDescription("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Suggest a Website
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">
              Help us grow our collection by suggesting amazing websites
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us what makes this website special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !website.trim() || !category || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Suggestion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}