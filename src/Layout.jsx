import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
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
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import GoogleAds from "./components/GoogleAds";
import ChatSupport from "./components/ChatSupport";
import BetaBanner from "./components/BetaBanner";

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
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
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
      script.onload = () => {window.adsenseLoaded = true;};
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
    setTheme((prev) => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginPrompt(false);
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = async () => {
    await base44.auth.logout(window.location.origin);
  };

  const isPro = user?.plan === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 pb-safe">
      <Toaster position="top-center" richColors />
      
      {/* Theme Effects */}
      {userTheme === 'snow' &&
      <Suspense fallback={null}>
          <SnowEffect />
        </Suspense>
      }
      {userTheme === 'fireworks' &&
      <Suspense fallback={null}>
          <FireworksEffect />
        </Suspense>
      }
      {userTheme === 'halloween' &&
      <Suspense fallback={null}>
          <HalloweenEffect />
        </Suspense>
      }
      {userTheme === 'hearts' &&
      <Suspense fallback={null}>
          <HeartsEffect />
        </Suspense>
      }
      {userTheme === 'sakura' &&
      <Suspense fallback={null}>
          <SakuraEffect />
        </Suspense>
      }
      {userTheme === 'autumn' &&
      <Suspense fallback={null}>
          <AutumnEffect />
        </Suspense>
      }
      {userTheme === 'confetti' &&
      <Suspense fallback={null}>
          <ConfettiEffect />
        </Suspense>
      }
      {userTheme === 'bubbles' &&
      <Suspense fallback={null}>
          <BubblesEffect />
        </Suspense>
      }
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
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
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
            {authLoading ?
            <Button variant="ghost" className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 text-sm opacity-50">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button> :
            isAuthenticated && user ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1.5 sm:gap-2 h-11 sm:h-10 px-3 sm:px-3 min-w-[44px] min-h-[44px] touch-manipulation">
                      <User className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline text-sm">{user.full_name || user.email}</span>
                    {isPro ?
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold">
                        PRO
                      </Badge> :

                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                        FREE
                      </Badge>
                  }
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
                      {isPro ?
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                          PRO PLAN
                        </Badge> :

                    <Badge variant="outline" className="text-xs">
                          FREE PLAN
                        </Badge>
                    }
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Profile')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' &&
                <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Admin')} className="cursor-pointer">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                }
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <Button
              onClick={handleLoginClick}
              variant="ghost"
              className="gap-1.5 sm:gap-2 h-11 sm:h-10 px-3 sm:px-3 text-sm min-w-[44px] min-h-[44px] touch-manipulation">

                <LogIn className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            }
                <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-11 w-11 sm:h-10 sm:w-10 min-w-[44px] min-h-[44px] touch-manipulation">

                {theme === 'light' ?
              <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" /> :

              <Sun className="w-5 h-5 text-slate-300" />
              }
                </Button>
                </div>
        </div>
      </header>

      <BetaBanner />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {children}
        
        {/* Show Google Ads only for Free users */}
        {!authLoading && (!isAuthenticated || userPlan === 'free') &&
        <div className="mt-12">
            <GoogleAds adSlot="1234567890" />
          </div>
        }
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          {/* Footer Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('Home')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">File Optimizer</Link></li>
                <li><Link to={createPageUrl('HowItWorks')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</Link></li>
                <li><Link to={createPageUrl('Features')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link to={createPageUrl('Pricing')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pricing</Link></li>
                <li><Link to={createPageUrl('Performance')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Performance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Resources</h4>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('About')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link to={createPageUrl('FAQ')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link to={createPageUrl('Blog')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Blog</Link></li>
                <li><Link to={createPageUrl('Tutorials')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Tutorials</Link></li>
                <li><Link to={createPageUrl('Glossary')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Glossary</Link></li>
                <li><Link to={createPageUrl('Comparisons')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Compare Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('TermsOfService')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link to={createPageUrl('PrivacyPolicy')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to={createPageUrl('Security')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Security</Link></li>
                <li><Link to={createPageUrl('Accessibility')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Accessibility</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Support</h4>
              <ul className="space-y-2">
                <li><a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Support Portal</a></li>
                <li><Link to={createPageUrl('ReportBug')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Report a Bug</Link></li>
                <li><Link to={createPageUrl('Contact')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Main Hub</Link></li>
                <li><a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Credits</h4>
              <ul className="space-y-2">
                <li><a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>Created by TLIU Studios</a></li>
                <li><a href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x65e4dd3088ab3acb:0x47b7719db967d156!12e1?source=g.page.m.kd._&laa=lu-desktop-review-solicitation" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Leave a Google Review</a></li>
                <li><a href="https://www.facebook.com/profile.php?id=61577274854116&sk=reviews" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>Leave a Facebook Review</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">More</h4>
              <ul className="space-y-2">
                <li><a href="https://www.tliu.co/royalty-free-assets/photos" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>Royalty Free Assets</a></li>
                <li><a href="https://filegenerated.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>File Generated</a></li>
                <li><a href="https://shop.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>TLIU Store</a></li>
                <li><a href="https://www.tliu.co/donate" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>Support Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center space-y-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69100dedd17537e37249237a/cd98bb516_image.png"
              alt="TLIU Studios Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 mx-auto"
              loading="lazy" />


            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 flex-wrap">
              <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Discord">
                <DiscordIcon />
              </a>
              <a href="https://www.youtube.com/@TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="YouTube">
                <YouTubeIcon />
              </a>
              <a href="https://www.tiktok.com/@TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href="https://open.spotify.com/artist/6ABnEPhBJPnwZwoal3xyMM" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Spotify">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
              <a href="https://music.apple.com/us/artist/tliu-studios/1836817405" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Apple Music">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.548-1.315.632-2.18 1.645-2.61 3.07a9.685 9.685 0 0 0-.2 1.316c-.024.386-.062.772-.062 1.158v11.787c0 .386.039.772.062 1.158.093 1.545.823 2.792 2.155 3.604.5.305 1.048.475 1.62.577.473.084.953.118 1.433.142.12.006.238.02.36.02h12.036c.11 0 .22-.015.33-.022.48-.025.96-.058 1.43-.142.59-.105 1.14-.276 1.65-.594 1.36-.844 2.09-2.092 2.18-3.682.02-.366.06-.732.06-1.098V6.124z"/>
                  <path fill="#fff" d="M10.538 17.477c-.742 0-1.39-.498-1.61-1.214a1.892 1.892 0 0 1 1.313-2.352c.205-.056.418-.084.63-.084.41 0 .814.121 1.155.349V8.538c0-.118.097-.215.215-.215h4.89c.118 0 .215.097.215.215v1.16c0 .118-.097.215-.215.215h-3.714v7.317c0 .742-.498 1.39-1.214 1.61-.205.056-.418.084-.63.084z"/>
                </svg>
              </a>
              <a href="https://music.amazon.ca/artists/B0FPC89Q2D/tliu-studios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Amazon Music">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 16.5c-.7 0-1.3.5-1.4 1.2-.1.8.4 1.5 1.2 1.6.7.1 1.4-.4 1.5-1.2.1-.7-.4-1.4-1.1-1.6h-.2zm13.5-6.2c-.1-.8-.5-1.5-1.1-2-.7-.6-1.6-1-2.6-1.1-1.8-.2-3.5.3-5 1.4-.1.1-.1.2-.1.3.1.1.1.2.2.2l1.3.9c.1.1.3.1.4 0 1-.8 2.2-1.2 3.5-1.1.7 0 1.4.2 1.9.7.5.4.8 1 .8 1.7v.3c-1.6.2-3.2.4-4.8.8-1.5.4-2.9 1.3-3.5 2.8-.6 1.3-.4 2.8.6 3.9.9 1 2.1 1.4 3.4 1.4 1.6 0 2.9-.5 4-1.6.5.6 1 1.1 1.6 1.5.1.1.3.1.4 0l.1-.1c.4-.4.9-.7 1.3-1.1.1-.1.2-.3.1-.4-.4-.5-.7-1-.7-1.6v-6.7zm-3.2 5.4c0 .9-.1 1.6-.5 2.3-.4.6-.9.9-1.6.9-.9 0-1.4-.7-1.4-1.5 0-1 .6-1.6 1.4-1.9.9-.3 1.7-.4 2.6-.5v.7h-.5zm3.7 5.8h-.1c-4.6 3.1-10.8 3.1-15.4 0-.2-.1-.4 0-.5.2-.1.2 0 .4.2.5 4.8 3.3 11.2 3.3 16 0 .2-.1.3-.3.2-.5-.1-.1-.2-.2-.4-.2z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61577274854116" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://www.linkedin.com/company/tliustudios/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/TLIUStudios/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://x.com/TLIUStudios" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-500 hover:text-white dark:hover:text-white transition-colors" aria-label="X (Twitter)">
                <XIcon />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              © <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">TLIU Studios</a> 2026, All Rights Reserved.

            </p>
          </div>
        </div>
      </footer>

      {/* Login Prompt Modal */}
      {showLoginPrompt &&
      <Suspense fallback={null}>
          <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onLogin={handleLoginConfirm}
          context="general" />

        </Suspense>
      }

      {/* AI Chat Support */}
      <ChatSupport />
      </div>);

}