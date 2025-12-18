import { useState } from "react";
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
  const { toast } = useToast();

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
      
      if (password.length !== 6 || !/^\d+$/.test(password)) {
        toast({
          title: "Invalid Password",
          description: "Password must be exactly 6 digits",
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

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    toast({
      title: "Password Generated",
      description: `Your password is: ${newPassword}. Please save it!`,
    });
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
      <DialogContent className="sm:max-w-md">
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
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">6-Digit Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      placeholder="123456"
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPassword(value);
                      }}
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                    >
                      Generate
                    </Button>
                  </div>
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
                    placeholder="Enter your 6-digit password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <Button 
              onClick={handleAuthenticate} 
              disabled={isAuthenticating || !inviteCodeOrUsername.trim() || !password.trim()}
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