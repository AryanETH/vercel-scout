import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, AtSign, Ticket, X } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be 20 characters or less').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores');
const inviteCodeSchema = z.string().min(4, 'Please enter a valid invite code');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, isLoading } = useSupabaseAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Can be email or username
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Username suggestions
  const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Generate username suggestions from full name
  const generateUsernameSuggestions = (fullName: string): string[] => {
    if (!fullName.trim()) return [];
    
    const cleaned = fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    
    if (parts.length === 0) return [];
    
    const suggestions: string[] = [];
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    
    // Different username formats
    suggestions.push(firstName); // john
    if (lastName) {
      suggestions.push(`${firstName}${lastName.charAt(0)}`); // johnk
      suggestions.push(`${firstName}_${lastName}`); // john_kumar
      suggestions.push(`${firstName}${lastName}`); // johnkumar
      suggestions.push(`${firstName.charAt(0)}${lastName}`); // jkumar
    }
    
    // Add some with numbers
    suggestions.push(`${firstName}${Math.floor(Math.random() * 100)}`);
    
    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 4);
  };

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    setUsernameAvailable(!data);
    setCheckingUsername(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signupUsername) {
        checkUsername(signupUsername);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [signupUsername]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle username field focus - show suggestions
  const handleUsernameFocus = () => {
    if (signupFullName && !signupUsername) {
      const suggestions = generateUsernameSuggestions(signupFullName);
      setUsernameSuggestions(suggestions);
      setShowUsernameSuggestions(suggestions.length > 0);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSignupUsername(suggestion);
    setShowUsernameSuggestions(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginIdentifier.trim()) {
      toast.error('Please enter your email or username');
      return;
    }
    
    try {
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    let email = loginIdentifier;
    
    // Check if it's a username (no @ symbol)
    if (!loginIdentifier.includes('@')) {
      // Look up email by username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', loginIdentifier.toLowerCase())
        .maybeSingle();
      
      if (!profileData?.email) {
        toast.error('Username not found');
        setIsSubmitting(false);
        return;
      }
      
      email = profileData.email;
    }
    
    const { error } = await signIn(email, loginPassword);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email/username or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      inviteCodeSchema.parse(inviteCode);
      if (signupUsername) {
        usernameSchema.parse(signupUsername);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    if (signupUsername && usernameAvailable === false) {
      toast.error('Username is already taken');
      return;
    }

    if (!inviteCode.toUpperCase().startsWith('YOUREL')) {
      toast.error('Invalid invite code format');
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await signUp(
      signupEmail, 
      signupPassword,
      signupFullName, 
      signupUsername.toLowerCase()
    );
    
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created! Welcome to Yourel.');
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </Button>
      
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome to Yourel</CardTitle>
          <CardDescription>
            Sign in or create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-identifier">Email or Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-identifier"
                      type="text"
                      placeholder="email or username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden bg-background/20 backdrop-blur-md border border-white/30 text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-transparent hover:text-white hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_24px_rgba(119,77,226,0.4)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#338CEA] before:to-[#774DE2] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 [&>*]:relative [&>*]:z-10" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="YOUREL#1234"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Yourel is invite only. Ask a friend for an invite code.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Sahil Kumar"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupUsername}
                      onChange={(e) => {
                        setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                        setShowUsernameSuggestions(false);
                      }}
                      onFocus={handleUsernameFocus}
                      onBlur={() => setTimeout(() => setShowUsernameSuggestions(false), 200)}
                      className="pl-10 pr-10"
                    />
                    {signupUsername.length >= 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : usernameAvailable ? (
                          <span className="text-green-500 text-xs">✓</span>
                        ) : usernameAvailable === false ? (
                          <span className="text-red-500 text-xs">✗</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  
                  {/* Username Suggestions */}
                  {showUsernameSuggestions && usernameSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {usernameSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur from firing
                            handleSelectSuggestion(suggestion);
                          }}
                          className="px-3 py-1 text-xs rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          @{suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {signupUsername && (
                    <p className="text-xs text-muted-foreground">
                      Your profile: {window.location.origin}/u/{signupUsername}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 6 characters
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden bg-background/20 backdrop-blur-md border border-white/30 text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-transparent hover:text-white hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_24px_rgba(119,77,226,0.4)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#338CEA] before:to-[#774DE2] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 [&>*]:relative [&>*]:z-10" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
