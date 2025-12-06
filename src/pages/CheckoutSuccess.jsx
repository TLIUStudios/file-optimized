import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { CheckCircle2, Sparkles, ArrowRight, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";
import SEOHead from "../components/SEOHead";
import { base44 } from "@/api/base44Client";

export default function CheckoutSuccess() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Trigger confetti celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
      });
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
      });
    }, 250);

    // Load user
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEOHead title="Welcome to Pro - File Optimized" />
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50 dark:from-emerald-950/20 dark:via-amber-950/20 dark:to-orange-950/20 opacity-50" />
          
          <div className="relative z-10">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            {/* Title with Pro Badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Welcome to Pro!
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg">
                <Crown className="w-4 h-4" />
                PRO
              </div>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              {user?.full_name && `${user.full_name}, your`} subscription is now active!
            </p>

            {/* Features unlocked */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Pro Features Unlocked
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>500MB file size limit</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>30 files batch upload</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Priority processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Advanced features</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Support future projects</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Link to={createPageUrl('Home')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Optimizing
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <Link to={createPageUrl('Profile')}>
                  View Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
              Questions? <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Contact Support</a>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}