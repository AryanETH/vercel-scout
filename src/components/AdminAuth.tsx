import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a small delay for security
    setTimeout(() => {
      if (password === "686") {
        // Store authentication in sessionStorage (expires when browser closes)
        sessionStorage.setItem("admin-authenticated", "true");
        onAuthenticated();
      } else {
        setError("Invalid password");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-muted-foreground mb-8">
            Enter the password to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password || isLoading}
              className="w-full glass-liquid-button bg-primary text-primary-foreground py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Access Admin Panel"}
            </button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            Authorized personnel only
          </div>
        </div>
      </div>
    </div>
  );
}