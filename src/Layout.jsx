import { useEffect, useState } from "react";
import { Moon, Sun, Image as ImageIcon, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginPromptModal from "./components/LoginPromptModal";
import GoogleAds from "./components/GoogleAds";

export default function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load Google AdSense script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9768118657510940';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setUserPlan(currentUser?.plan || 'free');
        } else {
          setUser(null);
          setUserPlan('free');
        }
      } catch (error) {
        console.log('Auth check:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const isPro = user?.plan === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      <style>{`
        :root {
          --primary: 142 76% 36%;
          --primary-foreground: 0 0% 100%;
          --accent: 142 76% 36%;
          --accent-foreground: 0 0% 100%;
        }
        
        .dark {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
          --card: 222 47% 15%;
          --card-foreground: 210 40% 98%;
          --popover: 222 47% 15%;
          --popover-foreground: 210 40% 98%;
          --muted: 217 33% 17%;
          --muted-foreground: 215 20% 65%;
          --border: 217 33% 17%;
          --input: 217 33% 17%;
          --ring: 142 76% 36%;
        }
      `}</style>
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">File Optimized</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compress, Upscale, & Convert</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {!authLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{user.full_name || user.email}</span>
                        {isPro ? (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5 font-bold">
                            PRO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            FREE
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <div className="mt-1">
                          {isPro ? (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                              PRO PLAN
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              FREE PLAN
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Profile')} className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Profile & Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    variant="ghost"
                    className="gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-300" />
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
        
        {/* Show Google Ads only for Free users */}
        {!authLoading && (!isAuthenticated || userPlan === 'free') && (
          <div className="mt-12">
            <GoogleAds adSlot="1234567890" />
          </div>
        )}
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center space-y-4">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">TLIU Studios</a> 2025, All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLoginConfirm}
        context="general"
      />
    </div>
  );
}