import { useEffect, useState, lazy, Suspense } from "react";
import { Moon, Sun, User, LogIn, LogOut } from "lucide-react";
import AnimatedMediaIcon from "./components/AnimatedMediaIcon";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { DiscordIcon, GoogleIcon, FacebookIcon, YouTubeIcon, TikTokIcon, InstagramIcon, XIcon } from "./components/SocialIcons";
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
import GoogleAds from "./components/GoogleAds";

const LoginPromptModal = lazy(() => import("./components/LoginPromptModal"));

const SnowEffect = lazy(() => import("./components/themes/SnowEffect"));
const FireworksEffect = lazy(() => import("./components/themes/FireworksEffect"));
const HalloweenEffect = lazy(() => import("./components/themes/HalloweenEffect"));
const HeartsEffect = lazy(() => import("./components/themes/HeartsEffect"));
const SakuraEffect = lazy(() => import("./components/themes/SakuraEffect"));
const AutumnEffect = lazy(() => import("./components/themes/AutumnEffect"));
const ConfettiEffect = lazy(() => import("./components/themes/ConfettiEffect"));
const BubblesEffect = lazy(() => import("./components/themes/BubblesEffect"));

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
  const [userTheme, setUserTheme] = useState('none');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Add AdSense meta tag for verification
  useEffect(() => {
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      meta.content = 'ca-pub-9768118657510940';
      document.head.appendChild(meta);
    }
    
    // Load AdSense script only once
    if (!window.adsenseLoaded && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9768118657510940';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => { window.adsenseLoaded = true; };
      document.head.appendChild(script);
    }
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
          setUserTheme(currentUser?.theme || 'none');
        } else {
          setUser(null);
          setUserPlan('free');
          setUserTheme('none');
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

    const handleThemeChange = (event) => {
      setUserTheme(event.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 pb-safe">
      <Toaster position="top-center" richColors />
      
      {/* Theme Effects */}
      {userTheme === 'snow' && (
        <Suspense fallback={null}>
          <SnowEffect />
        </Suspense>
      )}
      {userTheme === 'fireworks' && (
        <Suspense fallback={null}>
          <FireworksEffect />
        </Suspense>
      )}
      {userTheme === 'halloween' && (
        <Suspense fallback={null}>
          <HalloweenEffect />
        </Suspense>
      )}
      {userTheme === 'hearts' && (
        <Suspense fallback={null}>
          <HeartsEffect />
        </Suspense>
      )}
      {userTheme === 'sakura' && (
        <Suspense fallback={null}>
          <SakuraEffect />
        </Suspense>
      )}
      {userTheme === 'autumn' && (
        <Suspense fallback={null}>
          <AutumnEffect />
        </Suspense>
      )}
      {userTheme === 'confetti' && (
        <Suspense fallback={null}>
          <ConfettiEffect />
        </Suspense>
      )}
      {userTheme === 'bubbles' && (
        <Suspense fallback={null}>
          <BubblesEffect />
        </Suspense>
      )}
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
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg safe-top">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <AnimatedMediaIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-xl font-bold text-slate-900 dark:text-white truncate">File Optimized</h1>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">Compress, Upscale, & Convert</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {!authLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3">
                        <User className="w-4 h-4" />
                        <span className="hidden md:inline text-sm">{user.full_name || user.email}</span>
                        {isPro ? (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold">
                            PRO
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
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
                    className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 text-sm"
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
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 sm:h-10 sm:w-10"
                >
                {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
                ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                )}
                </Button>
                </div>
        </div>
      </header>
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {children}
        
        {/* Show Google Ads only for Free users */}
        {!authLoading && (!isAuthenticated || userPlan === 'free') && (
          <div className="mt-12">
            <GoogleAds adSlot="1234567890" />
          </div>
        )}
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 text-center space-y-3 sm:space-y-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69100dedd17537e37249237a/cd98bb516_image.png" 
            alt="TLIU Studios Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
            loading="lazy"
          />

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 flex-wrap">
            <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-[#5865F2] dark:hover:text-[#5865F2] transition-colors" aria-label="Discord">
              <DiscordIcon />
            </a>
            <a href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x65e4dd3088ab3acb:0x47b7719db967d156!12e1?source=g.page.m.kd._&laa=lu-desktop-review-solicitation" target="_blank" rel="noopener noreferrer" className="transition-colors group" aria-label="Google Reviews">
              <GoogleIcon />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61577274854116&sk=reviews" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-[#1877F2] dark:hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://www.youtube.com/@TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-[#FF0000] dark:hover:text-[#FF0000] transition-colors" aria-label="YouTube">
              <YouTubeIcon />
            </a>
            <a href="https://www.tiktok.com/@TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-[#00f2ea] dark:hover:text-[#00f2ea] transition-colors" aria-label="TikTok">
              <TikTokIcon />
            </a>
            <a href="https://www.instagram.com/TLIUStudios/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-[#E4405F] dark:hover:text-[#E4405F] transition-colors" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://x.com/TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" aria-label="X (Twitter)">
              <XIcon />
            </a>
          </div>
          
          <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mx-auto" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            © <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">TLIU Studios</a> 2025, All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <Suspense fallback={null}>
          <LoginPromptModal
            isOpen={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            onLogin={handleLoginConfirm}
            context="general"
          />
        </Suspense>
      )}
    </div>
  );
}