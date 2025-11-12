import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles, Film, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProUpgradeModal({ isOpen, onClose, onUpgrade, processing = false }) {
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
          {/* Price */}
          <div className="text-center py-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Starting at</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$9</span>
              <span className="text-lg text-slate-600 dark:text-slate-400">/month</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Cancel anytime</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pro Features
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">500MB File Upload Limit</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">10x larger files than Free (50MB)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Batch Processing: 30 Files</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Process 3x more files at once (vs 9 files)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Priority Processing</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Faster compression with priority queue</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <Film className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Advanced Animation Effects</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Pan, rotate, slide, bounce, and more!</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onUpgrade}
              disabled={processing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12 text-base shadow-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
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