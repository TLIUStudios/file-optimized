import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Zap, Crown, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LoginPromptModal({ isOpen, onClose, onLogin, context = "general" }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
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
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Save Your Work</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Access your compressed files anytime, anywhere</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Track Your Usage</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Monitor your compression history and stats</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Upgrade to Pro</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Unlock 500MB files, 30 file batches, and advanced effects</p>
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