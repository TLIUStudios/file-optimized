import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, Crown, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LoginPromptModal({ isOpen, onClose, onLogin, context = "general" }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <LogIn className="w-7 h-7" />
                Sign In to Continue
              </h2>
              <p className="text-emerald-100 text-sm">
                {context === "upgrade" 
                  ? "Create an account or sign in to upgrade to Pro"
                  : "Unlock your full potential with a free account"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Benefits Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Why Sign In?
            </h3>
            
            {/* Plan Comparison Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Free Plan Card */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/30 border-2 border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Free Plan</p>
                </div>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-3 text-center">$0</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">50MB file limit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">9 files batch</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">Standard processing speed</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">Displays Ads</p>
                  </div>
                </div>
              </div>

              {/* Pro Plan Card */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-500 dark:border-amber-600 relative">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST</div>
                <div className="flex items-center gap-1 mb-2 justify-center">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Pro Plan</p>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-3 text-center">$10<span className="text-sm">/mo</span></p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-900 dark:text-white font-medium">500MB files</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-900 dark:text-white font-medium">30 files batch</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-900 dark:text-white font-medium">Priority processing speed</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-900 dark:text-white font-medium">No Ads</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-900 dark:text-white font-medium">Supports future TLIU projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              🔒 <strong>100% Secure</strong> - Your data stays private. We never store or share your files.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold h-12 text-base shadow-lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In or Create Account
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Continue as Guest (Free Plan)
            </Button>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            No credit card required • Free account • Takes 30 seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}