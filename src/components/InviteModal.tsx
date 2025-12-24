import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Users, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (codeOrUsername: string, firstName?: string, lastName?: string, username?: string, password?: string) => boolean;
  userInviteCode?: string;
  inviteText?: string;
  remainingInvites?: number;
  generatePassword: () => string;
}

export function InviteModal({ 
  isOpen, 
  onClose, 
  onAuthenticate, 
  userInviteCode, 
  inviteText,
  remainingInvites = 0,
  generatePassword
}: InviteModalProps) {
  const [inviteCodeOrUsername, setInviteCodeOrUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const { toast } = useToast();

  // Check if username exists in database
  const checkUsernameAvailability = (usernameToCheck: string): boolean => {
    if (!usernameToCheck.trim()) return true;
    
    const existingUsers = JSON.parse(localStorage.getItem("yourel_users") || "[]");
    return !existingUsers.some((user: any) => user.username === usernameToCheck);
  };

  // Generate username suggestions based on first and last name
  useEffect(() => {
    if (firstName.trim() && lastName.trim()) {
      const suggestions = generateUsernameSuggestions(firstName.trim(), lastName.trim());
      setUsernameSuggestions(suggestions);
    } else {
      setUsernameSuggestions([]);
    }
  }, [firstName, lastName]);

  // Check username availability when username changes
  useEffect(() => {
    if (username.trim() && isNewUser) {
      setUsernameStatus('checking');
      
      // Debounce the check
      const timeoutId = setTimeout(() => {
        const isAvailable = checkUsernameAvailability(username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
        
        // If username is taken, generate alternative suggestions
        if (!isAvailable && firstName.trim() && lastName.trim()) {
          const alternatives = generateAlternativeUsernames(username, firstName, lastName);
          setUsernameSuggestions(alternatives);
          setShowSuggestions(true);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameStatus(null);
    }
  }, [username, isNewUser, firstName, lastName]);

  const generateUsernameSuggestions = (first: string, last: string): string[] => {
    const firstLower = first.toLowerCase();
    const lastLower = last.toLowerCase();
    const suggestions = [];
    
    // Basic combinations
    suggestions.push(firstLower + lastLower);
    suggestions.push(firstLower + last.charAt(0).toLowerCase());
    suggestions.push(first.charAt(0).toLowerCase() + lastLower);
    
    // With numbers
    const randomNums = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), new Date().getFullYear() % 100];
    suggestions.push(firstLower + randomNums[0]);
    suggestions.push(lastLower + randomNums[1]);
    suggestions.push(firstLower + lastLower + randomNums[2]);
    
    // With underscores
    suggestions.push(firstLower + '_' + lastLower);
    suggestions.push(firstLower + '_' + randomNums[0]);
    
    // Creative combinations
    suggestions.push(firstLower + lastLower.slice(0, 2) + randomNums[0]);
    suggestions.push(first.charAt(0).toLowerCase() + lastLower + randomNums[1]);
    
    // Filter out existing usernames and remove duplicates
    const uniqueSuggestions = [...new Set(suggestions)];
    const availableSuggestions = uniqueSuggestions.filter(suggestion => checkUsernameAvailability(suggestion));
    
    return availableSuggestions.slice(0, 6);
  };

  const generateAlternativeUsernames = (takenUsername: string, first: string, last: string): string[] => {
    const alternatives = [];
    const firstLower = first.toLowerCase();
    const lastLower = last.toLowerCase();
    
    // Add numbers to the taken username
    for (let i = 1; i <= 99; i++) {
      const alternative = takenUsername + i;
      if (checkUsernameAvailability(alternative)) {
        alternatives.push(alternative);
        if (alternatives.length >= 3) break;
      }
    }
    
    // Add more creative alternatives
    const moreAlternatives = [
      takenUsername + '_' + Math.floor(Math.random() * 100),
      firstLower + '_' + lastLower + Math.floor(Math.random() * 100),
      first.charAt(0).toLowerCase() + lastLower + Math.floor(Math.random() * 1000),
      firstLower + lastLower.slice(0, 3) + Math.floor(Math.random() * 100),
      takenUsername + 'x' + Math.floor(Math.random() * 100),
      'the' + takenUsername,
      takenUsername + 'official'
    ];
    
    for (const alt of moreAlternatives) {
      if (checkUsernameAvailability(alt) && alternatives.length < 6) {
        alternatives.push(alt);
      }
    }
    
    return alternatives.slice(0, 6);
  };

  const handleAuthenticate = async () => {
    if (!inviteCodeOrUsername.trim()) return;
    
    if (isNewUser) {
      if (!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!password.trim()) {
        toast({
          title: "Missing Password",
          description: "Please enter your password",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsAuthenticating(true);
    const success = onAuthenticate(
      inviteCodeOrUsername.trim(),
      isNewUser ? firstName.trim() : undefined,
      isNewUser ? lastName.trim() : undefined,
      isNewUser ? username.trim() : undefined,
      password.trim()
    );
    
    if (success) {
      toast({
        title: "Welcome to Yourel! 🎉",
        description: isNewUser ? "Your account has been created successfully." : "Welcome back!",
      });
      onClose();
    } else {
      toast({
        title: isNewUser ? "Registration Failed" : "Login Failed",
        description: isNewUser 
          ? "Please check your invite code and details." 
          : "Invalid username or password.",
        variant: "destructive",
      });
    }
    setIsAuthenticating(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setShowSuggestions(false);
  };

  const shareInvite = async () => {
    if (!inviteText) return;
    
    // Check if native sharing is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Yourel - Discover Amazing Projects',
          text: inviteText,
          url: window.location.origin
        });
        toast({
          title: "Shared!",
          description: "Invite shared successfully",
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        copyToClipboard();
      }
    } else {
      // Fallback to clipboard copy
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (inviteText) {
      navigator.clipboard.writeText(inviteText);
      toast({
        title: "Copied!",
        description: "Invite text copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {userInviteCode ? "Invite Friends" : "Join Yourel"}
          </DialogTitle>
        </DialogHeader>
        
        {!userInviteCode ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold mb-2">Yourel is Invite Only</h3>
              <p className="text-muted-foreground text-sm">
                {isNewUser ? "Create your account" : "Sign in to your account"}
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant={isNewUser ? "default" : "outline"}
                onClick={() => setIsNewUser(true)}
                className="flex-1"
              >
                New User
              </Button>
              <Button
                variant={!isNewUser ? "default" : "outline"}
                onClick={() => setIsNewUser(false)}
                className="flex-1"
              >
                Returning User
              </Button>
            </div>
            
            {isNewUser ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="YOUREL#1234"
                    value={inviteCodeOrUsername}
                    onChange={(e) => setInviteCodeOrUsername(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="Valya"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Patil"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="valya686"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      onFocus={() => setShowSuggestions(usernameSuggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      className={`${
                        usernameStatus === 'available' ? 'border-green-500' :
                        usernameStatus === 'taken' ? 'border-red-500' : ''
                      }`}
                    />
                    
                    {/* Username Status Indicator */}
                    {username.trim() && usernameStatus && (
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                        usernameStatus === 'available' ? 'text-green-600' :
                        usernameStatus === 'taken' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {usernameStatus === 'checking' && '...'}
                        {usernameStatus === 'available' && '✓ Available'}
                        {usernameStatus === 'taken' && '✗ Taken'}
                      </div>
                    )}
                    
                    {/* Username Suggestions */}
                    {showSuggestions && usernameSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-muted-foreground border-b">
                          {usernameStatus === 'taken' ? 'Try these alternatives:' : 'Suggested usernames:'}
                        </div>
                        {usernameSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between"
                          >
                            <span>{suggestion}</span>
                            <span className="text-xs text-green-600">✓</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Username taken message */}
                  {usernameStatus === 'taken' && (
                    <p className="text-xs text-red-600">
                      This username is already taken. Try one of the suggestions above.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={inviteCodeOrUsername}
                    onChange={(e) => setInviteCodeOrUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <Button 
              onClick={handleAuthenticate} 
              disabled={isAuthenticating || !inviteCodeOrUsername.trim() || !password.trim() || (isNewUser && usernameStatus === 'taken')}
              className="w-full"
            >
              {isAuthenticating ? "Authenticating..." : (isNewUser ? "Create Account" : "Sign In")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-2">
              <h3 className="text-lg font-semibold mb-2">Share Yourel</h3>
              <p className="text-muted-foreground text-sm">
                You have {5 - remainingInvites} invites remaining
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Your Invite Code</Label>
              <div className="flex gap-2">
                <Input value={userInviteCode} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(userInviteCode);
                    toast({ title: "Copied!", description: "Invite code copied" });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Share Message</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {inviteText}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={shareInvite}
                  className="flex-1"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Invite
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}