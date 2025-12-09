import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, Crown, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function LoginPromptModal({ isOpen, onClose, onLogin, context = "general", userPlan = "free" }) {
  const isPro = userPlan === 'pro';
  const [billingFrequency, setBillingFrequency] = useState('monthly');
  
  const isAnnual = billingFrequency === 'annual';
  const proPrice = isAnnual ? '$100 USD' : '$10 USD';
  const proPeriod = isAnnual ? '/yr' : '/mo';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] p-0 overflow-y-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 [&>button]:hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-4 sm:p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative">
            <div className="pr-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <LogIn className="w-6 h-6 sm:w-7 sm:h-7" />
                Sign In to Continue
              </h2>
              <p className="text-emerald-100 mt-1 text-xs sm:text-sm">
                {context === "upgrade" 
                  ? "Create an account or sign in to upgrade to Pro"
                  : "Unlock your potential with an account."}
              </p>
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
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Benefits Section */}
          <div className="space-y-2 sm:space-y-3">
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

            {/* Plan Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Free Plan Card */}
              <div className="p-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
                {!isPro && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] whitespace-nowrap px-2">
                    Current Plan
                  </Badge>
                )}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 text-center">Free Plan</h3>
                <div className="text-center mb-2 sm:mb-3">
                  <p className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-400">$0</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Limited Options
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>50MB file limit</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>9 files batch</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Standard speed</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>No Watermark</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Displays Ads</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                    <span>No cloud storage</span>
                  </div>
                  </div>
                  </div>

                  {/* Pro Plan Card */}
              <div className="p-3 rounded-lg border-2 border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden">
                {isPro && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] whitespace-nowrap px-2">
                    Current Plan
                  </Badge>
                )}
                {!isPro && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST</div>
                )}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 text-center flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                  Pro Plan
                </h3>
                <div className="text-center mb-2 sm:mb-3">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-500">
                    {proPrice}<span className="text-xs sm:text-sm">{proPeriod}</span>
                  </p>
                  <div className="min-h-[16px] sm:min-h-[20px] mt-0.5">
                    {isAnnual && (
                      <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Save $20/year vs monthly
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>500MB files</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>30 files batch</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Priority speed</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No Watermark</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>No Ads</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Google Drive sync</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-900 dark:text-white font-medium">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Support TLIU projects</span>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-11 sm:h-12 text-sm sm:text-base shadow-lg"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Sign In or Create Account
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm h-9 sm:h-10"
            >
              Continue as Guest (Free Plan)
            </Button>
            
            <p className="text-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              🔒 100% Secure • No credit card required • Free account
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}