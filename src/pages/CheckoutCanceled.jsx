import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { XCircle, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEOHead from "../components/SEOHead";

export default function CheckoutCanceled() {
  return (
    <>
      <SEOHead title="Checkout Canceled - File Optimized" />
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Checkout Canceled
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            No worries! You can upgrade to Pro anytime you're ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
            >
              <Link to={createPageUrl('Home')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Link to={createPageUrl('Pricing')}>
                <Sparkles className="w-4 h-4 mr-2" />
                View Pricing Again
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}