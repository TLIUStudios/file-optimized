
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
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ProUpgradeModal from "../components/ProUpgradeModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [processingPortal, setProcessingPortal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
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
      // Refresh user data
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

  const handleUpgrade = async () => {
    try {
      setProcessingCheckout(true);
      toast.info('Creating checkout session...', { id: 'checkout' });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please try again')), 15000)
      );

      const checkoutPromise = base44.functions.invoke('createCheckoutSession');

      const response = await Promise.race([checkoutPromise, timeoutPromise]);
      const { data } = response;
      
      console.log('Checkout response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        toast.dismiss('checkout');
        toast.success('Redirecting to Stripe...');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from Stripe');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.dismiss('checkout');
      
      let errorMessage = 'Failed to start checkout. Please try again.';
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 5000 });
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

          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`p-6 ${isPro ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isPro ? (
                    <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <User className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isPro ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                </div>
                {isPro ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Free</Badge>
                )}
              </div>

              {isPro ? (
                <div className="space-y-3">
                  {planExpires && !isExpired && (
                    <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
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

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>500MB file upload limit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>30 files batch processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Advanced animation effects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Priority processing</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleManageSubscription}
                    disabled={processingPortal}
                    className="w-full mt-4"
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>• 50MB file upload limit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>• 9 files batch processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>• Basic animation effects</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowProModal(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to Pro
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
        </div>

        {/* Right Column - Benefits */}
        <div className="space-y-6">
          {!isPro && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                <div className="text-center mb-4">
                  <Crown className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unlock Pro Features</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Get more power for your media workflow
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                    <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">500MB Files</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">10x larger than free</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">30 Files Batch</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">3x more files at once</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                    <Film className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Advanced Effects</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Pan, rotate, slide & more</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                    <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Priority Queue</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Faster processing</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">$10/month</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Cancel anytime</p>
                  <Button
                    onClick={() => setShowProModal(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

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
                  <a href="mailto:support@imagecrush.com">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://docs.imagecrush.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Documentation
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
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          onUpgrade={handleUpgrade}
          processing={processingCheckout}
        />
      )}
    </div>
  );
}
