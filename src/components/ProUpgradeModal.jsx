import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function ProUpgradeModal({ isOpen, onClose, onUpgrade, processing = false, error = null, userPlan = 'free' }) {
  const isPro = userPlan === 'pro';
  const [billingFrequency, setBillingFrequency] = useState('monthly');
  
  const isAnnual = billingFrequency === 'annual';
  const price = isAnnual ? '$100 USD' : '$10 USD';
  const period = isAnnual ? '/yr' : '/mo';
  const savings = isAnnual ? '17% OFF' : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 [&>button]:hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative">
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-7 h-7" />
                  Upgrade to Pro
                </DialogTitle>
              </DialogHeader>
              <p className="text-amber-100 mt-1 text-sm">Unlock powerful features for professional workflows</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Frequency Toggle */}
          <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
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

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Free Plan */}
            <div className="p-3 sm:p-4 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 relative">
              {!isPro && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] sm:text-xs whitespace-nowrap">
                  Current Plan
                </Badge>
              )}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center">Free Plan</h3>
              <p className="text-2xl font-bold text-center text-slate-600 dark:text-slate-400 mb-3">$0</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>50MB file limit</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>9 files batch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Standard processing speed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>No Watermark</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Displays Ads</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="p-3 sm:p-4 rounded-lg border-2 border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden">
              {isPro && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] sm:text-xs whitespace-nowrap">
                  Current Plan
                </Badge>
              )}
              {!isPro && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST</div>
              )}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-amber-600" />
                Pro Plan
              </h3>
              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                  {price}<span className="text-sm">{period}</span>
                </p>
                <div className="h-4 mt-1">
                  {isAnnual && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Save $20/year vs monthly
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>500MB files</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>30 files batch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Priority processing speed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>No Watermark</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>No Ads</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Supports future TLIU projects</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-lg opacity-75 blur-lg animate-pulse" style={{ animationDuration: '2s' }}></div>
              <Button
                onClick={() => onUpgrade(billingFrequency)}
                disabled={processing}
                className="relative w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12 text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
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
                <span className="relative z-10">
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline-block" />
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2 inline-block" />
                      Upgrade to Pro Now
                    </>
                  )}
                </span>
              </Button>
            </div>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              🔒 Secure payment via Stripe • Payments are final • Cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}