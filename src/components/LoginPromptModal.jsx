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
      <DialogContent className="sm:max-w-[480px] max-w-[95vw] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 [&>button]:hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-3 sm:p-4 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative">
            <div className="pr-8">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1.5">
                <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                Sign In to Continue
              </h2>
              <p className="text-emerald-100 mt-0.5 text-[11px] sm:text-xs">
                {context === "upgrade" 
                  ? "Create an account or sign in to upgrade"
                  : "Unlock your potential with an account."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2">
          {/* Benefits Section */}
          <div className="space-y-2">
            {/* Billing Frequency Toggle */}
            <div className="flex items-center justify-center gap-1.5 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <button
                onClick={() => setBillingFrequency('monthly')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  billingFrequency === 'monthly'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingFrequency('annual')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative ${
                  billingFrequency === 'annual'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Annual
                <Badge className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] px-1 py-0">
                  -17%
                </Badge>
              </button>
            </div>

            {/* Plan Comparison Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Free Plan Card */}
              <div className="p-2 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 text-center">Free</h3>
                <div className="text-center mb-1.5">
                  <p className="text-lg font-bold text-slate-600 dark:text-slate-400">$0</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-700 dark:text-slate-300">
                    <Check className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                    <span>50MB limit</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-700 dark:text-slate-300">
                    <Check className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                    <span>9 files batch</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-700 dark:text-slate-300">
                    <Check className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                    <span>With Ads</span>
                  </div>
                  </div>
                  </div>

                  {/* Pro Plan Card */}
              <div className="p-2 rounded-lg border-2 border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 relative">
                {!isPro && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl-lg font-bold">BEST</div>
                )}
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 text-center flex items-center justify-center gap-0.5">
                  <Zap className="w-3 h-3 text-amber-600" />
                  Pro
                </h3>
                <div className="text-center mb-1.5">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-500">
                    {proPrice.replace(' USD', '')}<span className="text-[10px]">{proPeriod}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-900 dark:text-white font-medium">
                    <Check className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                    <span>500MB files</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-900 dark:text-white font-medium">
                    <Check className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                    <span>30 files batch</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-900 dark:text-white font-medium">
                    <Check className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                    <span>No Ads</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-900 dark:text-white font-medium">
                    <Check className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                    <span>Google Drive</span>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            <Button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-10 text-sm shadow-lg"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In or Create Account
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-8"
            >
              Continue as Guest (Free)
            </Button>
            
            <p className="text-center text-[9px] text-slate-500 dark:text-slate-400 pt-0.5">
              🔒 100% Secure • No credit card • Free account
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}