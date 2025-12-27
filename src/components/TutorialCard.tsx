import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Heart, ThumbsUp, User, X, ChevronRight, ChevronLeft } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Yourel! 👋",
    description: "The anti-SEO search engine for developers. Let's show you around in 30 seconds.",
    icon: <Search className="w-8 h-8 text-primary" />,
  },
  {
    title: "Search for anything",
    description: "Type your query in the search bar. We search across Vercel, Netlify, GitHub Pages, and more developer platforms.",
    icon: <Search className="w-8 h-8 text-blue-500" />,
    highlight: "search",
  },
  {
    title: "Save your favorites ❤️",
    description: "On desktop, hover over a result to see the heart icon. On mobile, long-press (hold) on any result to favorite it.",
    icon: <Heart className="w-8 h-8 text-pink-500" />,
    highlight: "favorite",
  },
  {
    title: "Rate the results",
    description: "Help improve search quality by giving thumbs up or down to results. Your feedback matters!",
    icon: <ThumbsUp className="w-8 h-8 text-green-500" />,
    highlight: "rate",
  },
  {
    title: "Your Profile",
    description: "Access your favorites, settings, and share your profile from the user menu in the top right.",
    icon: <User className="w-8 h-8 text-purple-500" />,
    highlight: "profile",
  },
];

interface TutorialCardProps {
  onComplete: () => void;
}

export function TutorialCard({ onComplete }: TutorialCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("yourel_tutorial_completed", "true");
    onComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4">
      <Card className="relative w-full max-w-md p-6 space-y-6 border-primary/20 shadow-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="absolute top-3 right-3 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted/50 animate-scale-in">
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
        </div>

        {/* Demo area for specific steps */}
        {step.highlight === "favorite" && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-sm text-muted-foreground">Long press →</span>
              <div className="flex items-center gap-2 animate-pulse">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <span className="text-xs text-pink-500">Saved!</span>
              </div>
            </div>
          </div>
        )}

        {step.highlight === "rate" && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">or</span>
              <ThumbsUp className="w-5 h-5 text-red-500 rotate-180" />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {tutorialSteps.length}
        </p>
      </Card>
    </div>
  );
}
