import { useState, useEffect, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "../components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Crown,
  Calendar,
  CreditCard,
  Settings,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Film,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  Package,
  ShoppingBag,
  HardDrive,
  TrendingDown,
  Trophy,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Box,
  Image
} from "lucide-react";
import { ACHIEVEMENTS, GLOBAL_ACHIEVEMENTS } from "../components/AchievementNotification";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProUpgradeModal = lazy(() => import("../components/ProUpgradeModal"));
const LoginPromptModal = lazy(() => import("../components/LoginPromptModal"));

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [processingPortal, setProcessingPortal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('none');
  const [savingTheme, setSavingTheme] = useState(false);
  const [billingFrequency, setBillingFrequency] = useState('monthly');
  const [achievementPage, setAchievementPage] = useState(0);
  const [achievementFilter, setAchievementFilter] = useState('personal'); // 'personal' or 'global'
  const [achievementStatusFilter, setAchievementStatusFilter] = useState('all'); // 'all', 'completed', 'uncompleted'
  const [checkingAchievements, setCheckingAchievements] = useState(false);

  // Load achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.list('-unlocked_at', 1000),
    enabled: !!user,
  });

  // Load global achievements
  const { data: globalAchievements = [] } = useQuery({
    queryKey: ['globalAchievements'],
    queryFn: () => base44.entities.GlobalAchievement.list('-created_date', 100),
    refetchInterval: 60000, // Refresh every minute
  });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setSelectedTheme(currentUser?.theme || 'none');
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Check for success/canceled in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    if (params.get('success') === 'true') {
      toast.success('🎉 Welcome to Pro! Your subscription is now active.');
      // Reload user data after a short delay to ensure subscription status is updated
      setTimeout(async () => {
        const updatedUser = await base44.auth.me();
        setUser(updatedUser);
      }, 2000);
    }
    if (params.get('canceled') === 'true') {
      toast.info('Checkout canceled. You can upgrade anytime!');
    }
  }, []);

  // Load billing history
  const { data: billingHistory = [], isLoading: billingLoading } = useQuery({
    queryKey: ['billingHistory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.BillingHistory.filter(
        { user_id: user.id },
        '-paid_at',
        50
      );
    },
    enabled: !!user?.id && user?.plan === 'pro',
  });

  // Load compression stats
  const { data: compressionStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['compressionStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.CompressionStat.filter(
        { created_by: user.email },
        '-created_date',
        10000
      );
    },
    enabled: !!user?.email,
  });

  // Calculate savings by time period
  const calculateSavings = (timeframe) => {
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // all time
        startDate = new Date(0);
    }

    const filtered = compressionStats.filter(stat => 
      new Date(stat.created_date) >= startDate
    );

    const totalSavings = filtered.reduce((sum, stat) => {
      const saved = stat.original_size - stat.compressed_size;
      return sum + Math.max(0, saved); // Only count positive savings
    }, 0);

    return {
      savings: totalSavings,
      count: filtered.length
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const handleUpgrade = async (billingFrequency = 'monthly') => {
    console.log('🚀 Upgrade clicked from Profile');
    console.log('📅 Billing frequency:', billingFrequency);

    setUpgradeError(null);

    try {
      // Try to get the user - this is more reliable than isAuthenticated()
      let currentUser;
      try {
        currentUser = await base44.auth.me();
      } catch (error) {
        console.log('❌ User not logged in (auth.me() failed)');
        setShowProModal(false);
        setShowLoginPrompt(true);
        return;
      }

      if (!currentUser) {
        console.log('❌ No user found');
        setShowProModal(false);
        setShowLoginPrompt(true);
        return;
      }

      console.log('✅ User authenticated:', currentUser.email);

      // Only set processing state AFTER confirming user is authenticated
      setProcessingCheckout(true);
      const toastId = toast.loading(`Creating checkout session for ${billingFrequency} plan...`, { duration: Infinity });

      console.log('Calling createCheckoutSession with billing frequency:', billingFrequency);
      const response = await base44.functions.invoke('createCheckoutSession', { billingFrequency });
      
      console.log('Response:', response);
      
      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      const { data } = response;

      // Additional check from backend response (backup)
      if (data.requiresAuth) {
        toast.dismiss(toastId);
        setShowProModal(false);
        setProcessingCheckout(false);
        setShowLoginPrompt(true);
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to:', data.url);
      toast.dismiss(toastId);
      toast.success('Redirecting to Stripe checkout...');
      
      // Close modal
      setShowProModal(false);
      
      // Redirect at top level to break out of iframe
      setTimeout(() => {
        if (window.top) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      }, 300);

    } catch (error) {
      console.error('Upgrade failed:', error);
      
      // If it's an authentication error, show login prompt instead of error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('❌ Authentication error - showing login prompt');
        setShowProModal(false);
        setShowLoginPrompt(true);
        setProcessingCheckout(false);
        return;
      }
      
      const errorMessage = error.message || 'Failed to start checkout';
      setUpgradeError(errorMessage);
      toast.error(errorMessage, { duration: 8000 });
      setProcessingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setProcessingPortal(true);
      toast.info('Opening billing portal...');

      const { data } = await base44.functions.invoke('createPortalSession');

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setProcessingPortal(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handleThemeChange = async (theme) => {
    setSavingTheme(true);
    setSelectedTheme(theme);
    try {
      await base44.auth.updateMe({ theme });
      setUser(prev => ({ ...prev, theme }));
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
      toast.success('Theme updated!');
    } catch (error) {
      toast.error('Failed to update theme');
      setSelectedTheme(user?.theme || 'none');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLoginFromPrompt = () => {
    setShowLoginPrompt(false);
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleCheckAchievements = async () => {
    setCheckingAchievements(true);
    try {
      const response = await base44.functions.invoke('checkPersonalAchievements');
      const newAchievements = response.data?.new_achievements || [];
      
      if (newAchievements.length > 0) {
        toast.success(`Found ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`);
        
        // Show notifications for each achievement with delays
        for (let i = 0; i < newAchievements.length; i++) {
          setTimeout(() => {
            const achievement = ACHIEVEMENTS[newAchievements[i]];
            if (achievement) {
              toast.success(`🏆 ${achievement.name} - ${achievement.description}`, {
                duration: 3000
              });
            }
          }, i * 800); // Stagger notifications
        }
        
        // Refresh achievements list
        setTimeout(() => {
          window.location.reload();
        }, newAchievements.length * 800 + 500);
      } else {
        toast.info('You\'re all caught up! Keep compressing to unlock more.');
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      toast.error('Failed to check achievements');
    } finally {
      setCheckingAchievements(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to view your profile</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
        </Card>
      </div>
    );
  }

  const isPro = user.plan === 'pro';
  const planExpires = user.plan_expires ? new Date(user.plan_expires) : null;
  const isExpired = planExpires && planExpires < new Date();
  const daysRemaining = planExpires ? Math.ceil((planExpires - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <>
      <SEOHead 
        title="Profile & Settings - File Optimized"
        description="Manage your File Optimized account, subscription, and preferences. Upgrade to Pro for enhanced features."
      />
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and subscription</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log Out
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info & Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.full_name || 'User'}</h2>
                    {isPro && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Plan Comparison Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Plan</h3>
              
              {/* Billing Frequency Toggle */}
              <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4">
                <button
                  onClick={() => setBillingFrequency('monthly')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingFrequency === 'monthly'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingFrequency('annual')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                    billingFrequency === 'annual'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Annual
                  <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                    Save 17%
                  </Badge>
                </button>
              </div>

              {/* Plan Comparison Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Free Plan */}
              <div className={`p-4 rounded-lg border-2 ${!isPro ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'} relative`}>
                {!isPro && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white">
                    Current Plan
                  </Badge>
                )}
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center">Free Plan</h4>
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">$0</p>
                  <div className="h-4 mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Limited Options
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>50MB file limit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>9 files batch</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Standard processing speed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>No Watermark</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Displays Ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>No cloud storage</span>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className={`p-4 rounded-lg border-2 ${isPro ? 'border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' : 'border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'} relative`}>
                {isPro && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white">
                    Current Plan
                  </Badge>
                )}
                {!isPro && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST</div>
                )}
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Pro Plan
                </h4>
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                    {billingFrequency === 'annual' ? '$100 USD' : '$10 USD'}
                    <span className="text-sm">{billingFrequency === 'annual' ? '/yr' : '/mo'}</span>
                  </p>
                  <div className="h-4 mt-1">
                    {billingFrequency === 'annual' && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Save $20/year vs monthly
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>500MB files</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>30 files batch</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Priority processing speed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No Watermark</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No Ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Save to Google Drive</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Supports future TLIU projects</span>
                  </div>
                </div>
              </div>
              </div>

              {/* Pro subscription details */}
              {isPro && (
                <div className="space-y-3 mb-4">
                  {planExpires && !isExpired && (
                    <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Renews on</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {planExpires.toLocaleDateString()}
                        </span>
                      </div>
                      {daysRemaining !== null && daysRemaining <= 7 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                        </p>
                      )}
                    </div>
                  )}

                  {isExpired && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Your Pro plan has expired. Renew to restore benefits.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {isPro ? (
                <Button
                  onClick={handleManageSubscription}
                  disabled={processingPortal}
                  className="w-full"
                  variant="outline"
                >
                  {processingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-lg opacity-75 blur-lg animate-pulse" style={{ animationDuration: '2s' }}></div>
                  <Button
                    onClick={() => setShowProModal(true)}
                    className="relative w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white overflow-hidden group"
                  >
                    <div className="absolute inset-0">
                      <div className="absolute top-2 left-[15%] w-2 h-2 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute top-3 left-[35%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
                      <div className="absolute top-2 left-[55%] w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.6s' }} />
                      <div className="absolute top-3 left-[75%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.2s' }} />
                      <div className="absolute top-2 left-[85%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '1.9s', animationDelay: '0.8s' }} />
                      <div className="absolute bottom-2 left-[20%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.4s' }} />
                      <div className="absolute bottom-3 left-[45%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.5s' }} />
                      <div className="absolute bottom-2 left-[70%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.7s' }} />
                    </div>
                    <span className="relative z-10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro - {billingFrequency === 'annual' ? '$100 USD/yr' : '$10 USD/mo'}
                    </span>
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Billing History */}
          {isPro && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Billing History</h3>
                </div>

                {billingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : billingHistory.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                    No billing history yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {billingHistory.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              ${bill.amount.toFixed(2)} {bill.currency.toUpperCase()}
                            </p>
                            <Badge
                              variant="outline"
                              className={bill.status === 'paid' ? 'border-green-500 text-green-700 dark:text-green-400' : ''}
                            >
                              {bill.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(bill.paid_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {bill.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(bill.invoice_pdf, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Cloud Storage */}
          {isPro && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cloud Storage</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Connect cloud storage services to save optimized files directly.
                </p>
                <div className="space-y-2">
                  <Button disabled className="w-full justify-start" variant="outline">
                    <svg className="w-4 h-4 mr-2 opacity-40 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="flex-1 min-w-0 whitespace-nowrap">Google Drive</span>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap ml-2">Coming Soon</Badge>
                  </Button>
                  <Button disabled className="w-full justify-start" variant="outline">
                    <svg className="w-4 h-4 mr-2 opacity-40 flex-shrink-0" viewBox="0 0 24 24" fill="#0061FF">
                      <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452 0 13.274zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/>
                    </svg>
                    <span className="flex-1 min-w-0 whitespace-nowrap">Dropbox</span>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap ml-2">Coming Soon</Badge>
                  </Button>
                  <Button disabled className="w-full justify-start" variant="outline">
                    <svg className="w-4 h-4 mr-2 opacity-40 flex-shrink-0" viewBox="0 0 24 24" fill="#0078D4">
                      <path d="M13.977 5.998c2.382 0 4.438 1.382 5.414 3.386a4.746 4.746 0 013.608 4.599c0 2.626-2.131 4.756-4.757 4.756H5.758C2.579 18.739 0 16.16 0 12.98c0-2.812 2.018-5.157 4.688-5.659a6.99 6.99 0 016.289-1.323z"/>
                    </svg>
                    <span className="flex-1 min-w-0 whitespace-nowrap">OneDrive</span>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap ml-2">Coming Soon</Badge>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Space Saved Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                </div>
              ) : compressionStats.length === 0 ? (
                <div className="text-center py-3">
                  <TrendingDown className="w-8 h-8 text-emerald-600/50 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Start compressing to track your savings!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Your Space Saved</h3>
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(calculateSavings('alltime').savings)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      across {calculateSavings('alltime').count} files
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: '1day', label: 'Today' },
                      { key: '1week', label: 'Week' },
                      { key: '1month', label: 'Month' }
                    ].map(({ key, label }) => {
                      const { savings } = calculateSavings(key);
                      return (
                        <div key={key} className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatFileSize(savings)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Achievements Section with Filter & Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Achievements</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckAchievements}
                    disabled={checkingAchievements}
                    className="h-7 text-xs"
                  >
                    {checkingAchievements ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-3 h-3 mr-1" />
                    )}
                    Check
                  </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ml-auto">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                    <button
                      onClick={() => { setAchievementFilter('personal'); setAchievementPage(0); }}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition-all",
                        achievementFilter === 'personal'
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      Personal ({achievements.length}/{Object.keys(ACHIEVEMENTS).length})
                    </button>
                    <button
                      onClick={() => { setAchievementFilter('global'); setAchievementPage(0); }}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition-all",
                        achievementFilter === 'global'
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      Global ({globalAchievements.filter(g => g.completed).length}/{Object.keys(GLOBAL_ACHIEVEMENTS).length})
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                    <button
                      onClick={() => { setAchievementStatusFilter('all'); setAchievementPage(0); }}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition-all",
                        achievementStatusFilter === 'all'
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setAchievementStatusFilter('completed'); setAchievementPage(0); }}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition-all",
                        achievementStatusFilter === 'completed'
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => { setAchievementStatusFilter('uncompleted'); setAchievementPage(0); }}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium transition-all",
                        achievementStatusFilter === 'uncompleted'
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      Uncompleted
                    </button>
                  </div>
                </div>
                </div>

              {achievementFilter === 'personal' ? (
                <>
                  {/* Personal Achievements */}
                  <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(ACHIEVEMENTS)
                        .filter(([id, achievement]) => {
                          const unlocked = achievements.find(a => a.achievement_id === id);
                          if (achievementStatusFilter === 'completed') return !!unlocked;
                          if (achievementStatusFilter === 'uncompleted') return !unlocked;
                          return true;
                        })
                        .slice(achievementPage * 12, (achievementPage + 1) * 12)
                        .map(([id, achievement]) => {
                        const unlocked = achievements.find(a => a.achievement_id === id);
                        
                        return (
                          <div
                            key={id}
                            className={`relative p-3 rounded-lg border-2 transition-all ${
                              unlocked
                                ? `bg-gradient-to-br ${achievement.color} border-transparent shadow-lg`
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-40 grayscale'
                            }`}
                          >
                            {unlocked && (
                              <div className="absolute top-1 right-1">
                                <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                                  <Trophy className="w-2.5 h-2.5 text-amber-500" />
                                </div>
                              </div>
                            )}

                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl mb-2 ${
                              unlocked ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-200 dark:bg-slate-800'
                            }`}>
                              {achievement.icon}
                            </div>

                            <h4 className={`font-bold text-xs mb-0.5 line-clamp-1 ${
                              unlocked ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`}>
                              {achievement.name}
                            </h4>
                            
                            <p className={`text-[10px] leading-tight line-clamp-2 ${
                              unlocked ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {achievement.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation Controls */}
                    {(() => {
                      const filteredAchievements = Object.entries(ACHIEVEMENTS).filter(([id]) => {
                        const unlocked = achievements.find(a => a.achievement_id === id);
                        if (achievementStatusFilter === 'completed') return !!unlocked;
                        if (achievementStatusFilter === 'uncompleted') return !unlocked;
                        return true;
                      });
                      const totalPages = Math.ceil(filteredAchievements.length / 12);

                      return filteredAchievements.length > 12 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAchievementPage(prev => Math.max(0, prev - 1))}
                            disabled={achievementPage === 0}
                            className="h-8 w-8"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setAchievementPage(i)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  achievementPage === i
                                    ? "bg-emerald-600 w-6"
                                    : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                )}
                              />
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAchievementPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={achievementPage >= totalPages - 1}
                            className="h-8 w-8"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                      {achievementStatusFilter === 'completed' 
                        ? `${achievements.length} unlocked`
                        : achievementStatusFilter === 'uncompleted'
                        ? `${Object.keys(ACHIEVEMENTS).length - achievements.length} to unlock`
                        : `${Object.keys(ACHIEVEMENTS).length - achievements.length} more to unlock!`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Global Achievements */}
                  <div className="relative">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
                      🌍 Work together with all users to unlock these milestones!
                    </p>

                    <div className="space-y-3">
                      {Object.entries(GLOBAL_ACHIEVEMENTS)
                        .filter(([id, achievement]) => {
                          const globalData = globalAchievements.find(g => g.achievement_id === id);
                          const completed = globalData?.completed || false;
                          if (achievementStatusFilter === 'completed') return completed;
                          if (achievementStatusFilter === 'uncompleted') return !completed;
                          return true;
                        })
                        .slice(achievementPage * 6, (achievementPage + 1) * 6)
                        .map(([id, achievement]) => {
                        const globalData = globalAchievements.find(g => g.achievement_id === id);
                        const progress = globalData?.current_progress || 0;
                        const goal = achievement.goal;
                        const completed = globalData?.completed || false;
                        const percentage = Math.min(100, (progress / goal) * 100);
                        
                        const formatBytes = (bytes) => {
                          if (bytes < 1024) return bytes + ' B';
                          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
                          if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                          if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
                          return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
                        };
                        
                        return (
                          <div
                            key={id}
                            className={`relative p-4 rounded-lg border-2 transition-all ${
                              completed
                                ? `bg-gradient-to-r ${achievement.color} border-transparent shadow-lg`
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                                completed ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800'
                              }`}>
                                {achievement.icon}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`font-bold text-sm ${
                                    completed ? 'text-white' : 'text-slate-900 dark:text-white'
                                  }`}>
                                    {achievement.name}
                                  </h4>
                                  {completed && (
                                    <Trophy className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                
                                <p className={`text-xs mb-2 ${
                                  completed ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                  {achievement.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                  <div className={`h-2 rounded-full overflow-hidden ${
                                    completed ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'
                                  }`}>
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        completed ? 'bg-white' : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className={`text-[10px] font-medium ${
                                      completed ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                      {id.includes('save') ? formatBytes(progress) : progress.toLocaleString()} / {id.includes('save') ? formatBytes(goal) : goal.toLocaleString()}
                                    </p>
                                    <p className={`text-[10px] font-bold ${
                                      completed ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                      {percentage.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation for Global Achievements */}
                    {(() => {
                      const filteredGlobalAchievements = Object.entries(GLOBAL_ACHIEVEMENTS).filter(([id]) => {
                        const globalData = globalAchievements.find(g => g.achievement_id === id);
                        const completed = globalData?.completed || false;
                        if (achievementStatusFilter === 'completed') return completed;
                        if (achievementStatusFilter === 'uncompleted') return !completed;
                        return true;
                      });
                      const totalPages = Math.ceil(filteredGlobalAchievements.length / 6);

                      return filteredGlobalAchievements.length > 6 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAchievementPage(prev => Math.max(0, prev - 1))}
                            disabled={achievementPage === 0}
                            className="h-8 w-8"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setAchievementPage(i)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  achievementPage === i
                                    ? "bg-amber-600 w-6"
                                    : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                )}
                              />
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAchievementPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={achievementPage >= totalPages - 1}
                            className="h-8 w-8"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Theme Effects Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Visual Theme</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add fun holiday effects to your interface</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('none')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'none'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">None</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Default</div>
                </button>

                <button
                  onClick={() => handleThemeChange('snow')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'snow'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">❄️</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Snow</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Winter</div>
                </button>

                <button
                  onClick={() => handleThemeChange('fireworks')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'fireworks'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🎆</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Fireworks</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">New Year</div>
                </button>

                <button
                  onClick={() => handleThemeChange('halloween')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'halloween'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🎃</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Halloween</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Spooky</div>
                </button>

                <button
                  onClick={() => handleThemeChange('hearts')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'hearts'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">💕</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Hearts</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Valentine's</div>
                </button>

                <button
                  onClick={() => handleThemeChange('sakura')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'sakura'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🌸</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Sakura</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Spring</div>
                </button>

                <button
                  onClick={() => handleThemeChange('autumn')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'autumn'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🍂</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Autumn</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Fall</div>
                </button>

                <button
                  onClick={() => handleThemeChange('confetti')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'confetti'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Confetti</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Party</div>
                </button>

                <button
                  onClick={() => handleThemeChange('bubbles')}
                  disabled={savingTheme}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    selectedTheme === 'bubbles'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="text-2xl mb-2">🫧</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Bubbles</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Playful</div>
                </button>
              </div>

              {savingTheme && (
                <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  Saving theme...
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Support */}
        <div className="space-y-6">
          {/* Support Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Support & Feedback</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Credits Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Credits</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Created by TLIU Studios
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x65e4dd3088ab3acb:0x47b7719db967d156!12e1?source=g.page.m.kd._&laa=lu-desktop-review-solicitation" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Leave a Google Review
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.facebook.com/profile.php?id=61577274854116&sk=reviews" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Leave a Facebook Review
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Social Media Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Social Media</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Discord
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.youtube.com/@TLIUStudios" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.tiktok.com/@TLIUStudios" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    TikTok
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://open.spotify.com/artist/6ABnEPhBJPnwZwoal3xyMM" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#1DB954" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Spotify
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://music.apple.com/us/artist/tliu-studios/1836817405" target="_blank" rel="noopener noreferrer">
                    <div className="w-5 h-5 mr-2 rounded bg-gradient-to-b from-[#FA233B] to-[#FB5C74] flex-shrink-0" style={{
                      WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 168 168\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'168\' height=\'168\' fill=\'white\'/%3E%3Cpath d=\'M79.5 21c-3.7 0-6.8 3-6.8 6.8v59c-2.5-2.5-6-4-10-4-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14V48.3l42-13.2v36.5c-2.5-2.5-6-4-10-4-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14V27.8c0-3.8-3-6.8-6.8-6.8H79.5z\' fill=\'black\'/%3E%3C/svg%3E")',
                      maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 168 168\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'168\' height=\'168\' fill=\'white\'/%3E%3Cpath d=\'M79.5 21c-3.7 0-6.8 3-6.8 6.8v59c-2.5-2.5-6-4-10-4-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14V48.3l42-13.2v36.5c-2.5-2.5-6-4-10-4-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14V27.8c0-3.8-3-6.8-6.8-6.8H79.5z\' fill=\'black\'/%3E%3C/svg%3E")',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain'
                    }} />
                    Apple Music
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://music.amazon.ca/artists/B0FPC89Q2D/tliu-studios" target="_blank" rel="noopener noreferrer">
                    <div className="w-5 h-5 mr-2 rounded bg-[#1DD3E0] flex-shrink-0" style={{
                      WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'white\'/%3E%3Ctext x=\'100\' y=\'90\' font-size=\'60\' font-weight=\'bold\' text-anchor=\'middle\' font-family=\'Arial, sans-serif\' fill=\'black\'%3Emusic%3C/text%3E%3Cpath d=\'M40 120 Q100 150 160 120\' stroke=\'black\' stroke-width=\'8\' fill=\'none\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M150 115 L160 120 L150 125\' fill=\'black\'/%3E%3C/svg%3E")',
                      maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'200\' height=\'200\' fill=\'white\'/%3E%3Ctext x=\'100\' y=\'90\' font-size=\'60\' font-weight=\'bold\' text-anchor=\'middle\' font-family=\'Arial, sans-serif\' fill=\'black\'%3Emusic%3C/text%3E%3Cpath d=\'M40 120 Q100 150 160 120\' stroke=\'black\' stroke-width=\'8\' fill=\'none\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M150 115 L160 120 L150 125\' fill=\'black\'/%3E%3C/svg%3E")',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain'
                    }} />
                    Amazon Music
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.facebook.com/profile.php?id=61577274854116" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.linkedin.com/company/tliustudios/" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.instagram.com/TLIUStudios/" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#E4405F" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://x.com/TLIUStudios" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Our Other Apps Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Our Other Apps</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.tliu.co/royalty-free-assets/photos" target="_blank" rel="noopener noreferrer">
                    <Image className="w-4 h-4 mr-2" />
                    Royalty Free Assets
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://filegenerated.com/" target="_blank" rel="noopener noreferrer">
                    <Box className="w-4 h-4 mr-2" />
                    File Generated
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Shop Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Shop</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://shop.tliu.co/" target="_blank" rel="noopener noreferrer">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    TLIU Store
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Donate Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Donate</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.tliu.co/donate" target="_blank" rel="noopener noreferrer">
                    <Star className="w-4 h-4 mr-2" />
                    Support Us
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Pro Upgrade Modal */}
      {showProModal && (
        <Suspense fallback={null}>
          <ProUpgradeModal
            key={`pro-modal-${Date.now()}`}
            isOpen={showProModal}
            onClose={() => {
              setShowProModal(false);
              setUpgradeError(null);
              setProcessingCheckout(false);
            }}
            onUpgrade={handleUpgrade}
            processing={processingCheckout}
            error={upgradeError}
            userPlan={user?.plan || 'free'}
          />
        </Suspense>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <Suspense fallback={null}>
          <LoginPromptModal
            isOpen={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            onLogin={handleLoginFromPrompt}
            context="upgrade"
            userPlan={user?.plan || 'free'}
          />
        </Suspense>
      )}
    </div>
    </>
  );
}