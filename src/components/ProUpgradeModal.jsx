import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles, Film, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProUpgradeModal({ isOpen, onClose, onUpgrade, processing = false, error = null }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-7 h-7" />
                  Upgrade to Pro
                </DialogTitle>
              </DialogHeader>
              <p className="text-amber-100 mt-1 text-sm">Unlock powerful features for professional workflows</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1">
              Special Offer
            </Badge>
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

          {/* Comparison Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Free Plan */}
            <div className="p-4 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center">Free Plan</h3>
              <p className="text-2xl font-bold text-center text-slate-600 dark:text-slate-400 mb-3">$0</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>50MB file limit</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>9 files batch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Standard speed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Basic animations</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="p-4 rounded-lg border-2 border-amber-500 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-amber-600" />
                Pro Plan
              </h3>
              <p className="text-2xl font-bold text-center text-amber-600 dark:text-amber-500 mb-3">$10<span className="text-sm">/mo</span></p>
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
                  <span>Priority speed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-900 dark:text-white font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Advanced effects</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onUpgrade}
              disabled={processing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12 text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating checkout...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Upgrade to Pro Now
                </>
              )}
            </Button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              🔒 Secure payment via Stripe • Cancel anytime • 14-day money-back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}