import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ProUpgradeModal from "../components/ProUpgradeModal";
import LoginPromptModal from "../components/LoginPromptModal";

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
      const toastId = toast.loading('Creating checkout session...', { duration: Infinity });
      
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
            transition={{ delay: 0.2 }}
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
                  <p className="text-2xl font-bold text-center text-slate-600 dark:text-slate-400 mb-3">$0</p>
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
                  </div>
                </div>

                {/* Pro Plan */}
                <div className={`p-4 rounded-lg border-2 ${isPro ? 'border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' : 'border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'} relative overflow-hidden`}>
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
                <Button
                  onClick={() => setShowProModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro - {billingFrequency === 'annual' ? '$100 USD/yr' : '$10 USD/mo'}
                </Button>
              )}
            </Card>
          </motion.div>

          {/* Billing History */}
          {isPro && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
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

          {/* Theme Effects Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Need Help?</h3>
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

          {/* Our Other Apps Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Our Other Apps</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.tliu.co/royalty-free-assets/photos" target="_blank" rel="noopener noreferrer">
                    <Package className="w-4 h-4 mr-2" />
                    Royalty Free Assets
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Shop Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
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
        </div>
      </div>

      {/* Pro Upgrade Modal */}
      {showProModal && (
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
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLoginFromPrompt}
        context="upgrade"
        userPlan={user?.plan || 'free'}
      />
    </div>
  );
}