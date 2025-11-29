import { Accessibility as AccessibilityIcon, Check, Eye, Keyboard, Monitor, Volume2 } from "lucide-react";
import SEOHead from "../components/SEOHead";

export default function Accessibility() {
  return (
    <>
      <SEOHead 
        title="Accessibility Statement - File Optimized"
        description="File Optimized is committed to making our media optimization tool accessible to everyone. Learn about our accessibility features and standards."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AccessibilityIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Our commitment to making File Optimized accessible to everyone
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Our Commitment
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              TLIU Studios is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-600" />
              Accessibility Features
            </h2>
            <ul className="space-y-3">
              {[
                "High contrast mode support through system preferences",
                "Keyboard navigation throughout the application",
                "Screen reader compatible interface",
                "Resizable text up to 200% without loss of functionality",
                "Alt text for all meaningful images",
                "Clear and consistent navigation",
                "Dark mode for reduced eye strain",
                "Focus indicators for interactive elements",
                "Responsive design for all screen sizes"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-emerald-600" />
              Keyboard Navigation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              File Optimized can be fully navigated using a keyboard:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>Tab:</strong> Move between interactive elements</li>
              <li><strong>Enter/Space:</strong> Activate buttons and links</li>
              <li><strong>Escape:</strong> Close dialogs and modals</li>
              <li><strong>Arrow keys:</strong> Navigate within menus and sliders</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Standards Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Feedback
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We welcome your feedback on the accessibility of File Optimized. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>Support Portal:</strong> <a href="https://support.tliu.co/" className="text-emerald-600 hover:underline">support.tliu.co</a></li>
              <li><strong>Discord:</strong> <a href="https://discord.gg/gRJesCUYz9" className="text-emerald-600 hover:underline">Join our community</a></li>
            </ul>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-4">
              Last updated: November 2025
            </p>
          </section>
        </div>
      </div>
    </>
  );
}