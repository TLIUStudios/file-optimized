import { useState } from "react";
import { Check, X, Zap, Shield, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import SEOHead from "../components/SEOHead";

const features = [
  { name: "Image compression (JPEG, PNG, WebP, AVIF)", free: true, pro: true },
  { name: "GIF optimization", free: true, pro: true },
  { name: "Video compression (MP4)", free: true, pro: true },
  { name: "Audio compression (MP3, WAV)", free: true, pro: true },
  { name: "Format conversion", free: true, pro: true },
  { name: "AI-powered upscaling", free: true, pro: true },
  { name: "Video editor with captions", free: true, pro: true },
  { name: "Visual themes", free: true, pro: true },
  { name: "Maximum file size", free: "50 MB", pro: "500 MB" },
  { name: "Batch processing", free: "9 files", pro: "30 files" },
  { name: "Processing speed", free: "Standard", pro: "Priority" },
  { name: "No watermark", free: true, pro: true },
  { name: "Ad-free experience", free: false, pro: true },
  { name: "Supports future TLIU projects", free: false, pro: true },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const monthlyPrice = 15;
  const annualPrice = 150;
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        toast.info("Please sign in to upgrade to Pro");
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const response = await base44.functions.invoke('createCheckoutSession', {
        billingFrequency: isAnnual ? 'annual' : 'monthly'
      });

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Pricing - File Optimized | Free & Pro Plans"
        description="Choose the right plan for your needs. File Optimized offers a generous free plan and a Pro plan with higher limits, no ads, and premium features. Starting at $8.33/month."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={cn("text-sm font-medium", isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>
            Annual
          </span>
          <span className="ml-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
            Save {savingsPercent}% annually
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Free</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">For personal use</p>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500 dark:text-slate-400">/forever</span>
            </div>

            <Button 
              variant="outline" 
              className="w-full mb-8 h-12"
              onClick={() => window.location.href = '/'}
            >
              Get Started Free
            </Button>

            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  {feature.free ? (
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={cn(
                    "text-sm",
                    feature.free ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {feature.name}
                    {typeof feature.free === 'string' && (
                      <span className="ml-1 text-slate-500 dark:text-slate-400">({feature.free})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl border-2 border-emerald-500 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pro</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">For power users</p>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">
                ${isAnnual ? annualMonthly : monthlyPrice}
              </span>
              <span className="text-slate-500 dark:text-slate-400">/month</span>
              {isAnnual && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Billed annually (${annualPrice}/year)
                </p>
              )}
            </div>

            <Button 
              className="w-full mb-8 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Processing..." : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>

            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature.name}
                    {typeof feature.pro === 'string' && (
                      <span className="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">({feature.pro})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Pricing FAQ
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I try Pro before paying?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Our free plan includes all core features, so you can fully evaluate the tool before upgrading. Pro simply offers higher limits and removes ads.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Yes! You can cancel your Pro subscription at any time from your Profile page. You'll retain Pro access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do you offer refunds?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                We don't offer refunds for partial billing periods, but you can cancel anytime and won't be charged again. If you have issues, contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}