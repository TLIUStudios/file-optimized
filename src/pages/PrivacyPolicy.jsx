import { Shield, Lock, Eye, Server, Cookie, Mail } from "lucide-react";
import SEOHead from "../components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - File Optimized"
        description="Read our privacy policy to understand how File Optimized handles your data. We prioritize your privacy with client-side processing and minimal data collection."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: November 29, 2025
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-0 mb-2">Our Privacy Commitment</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-0">
                  At File Optimized, privacy isn't just a feature—it's our foundation. Your files are processed entirely in your browser and never uploaded to our servers. We believe you should have complete control over your data.
                </p>
              </div>
            </div>
          </section>

          {/* File Processing */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Lock className="w-6 h-6 text-emerald-600" />
              How We Handle Your Files
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 mt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Client-Side Processing</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                All file compression, conversion, and optimization happens directly in your web browser using JavaScript and WebAssembly technologies. This means:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Your files never leave your device during processing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  We cannot see, access, or store your media files
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Processing works even without an internet connection (after initial page load)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  No file data is transmitted to any server
                </li>
              </ul>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Eye className="w-6 h-6 text-emerald-600" />
              Information We Collect
            </h2>
            
            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Account Information (Optional)</h3>
            <p className="text-slate-600 dark:text-slate-400">
              If you choose to create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Payment Information (Pro Users)</h3>
            <p className="text-slate-600 dark:text-slate-400">
              For Pro subscriptions, payment processing is handled securely by Stripe. We do not store your credit card numbers or banking information. We only receive confirmation of successful payments and subscription status.
            </p>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Usage Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400">
              We collect anonymous usage statistics to improve our service, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Page views and feature usage (anonymized)</li>
              <li>Browser type and device information</li>
              <li>General geographic location (country/region level)</li>
              <li>Error reports to fix bugs</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Cookie className="w-6 h-6 text-emerald-600" />
              Cookies & Local Storage
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We use cookies and local storage for:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li><strong>Essential cookies:</strong> To keep you logged in and remember your preferences</li>
              <li><strong>Analytics cookies:</strong> To understand how visitors use our site (can be disabled)</li>
              <li><strong>Local storage:</strong> To save your theme preference and processing settings</li>
            </ul>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Server className="w-6 h-6 text-emerald-600" />
              Third-Party Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Google Analytics:</strong> For anonymous usage statistics</li>
              <li><strong>Google AdSense:</strong> For displaying advertisements to free users</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              Each of these services has their own privacy policy governing their use of your data.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Security</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We implement industry-standard security measures to protect your account information:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>All data transmission is encrypted using HTTPS/TLS</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication for all systems</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Disable non-essential cookies</li>
            </ul>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Children's Privacy</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              File Optimized is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Changes to This Policy</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting a notice on our website or sending you an email. Your continued use of File Optimized after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mt-0">
              <Mail className="w-6 h-6 text-emerald-600" />
              Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 mb-0">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2 mb-0">
              <strong>TLIU Studios</strong><br />
              Website: <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">www.tliu.co</a><br />
              Support & Feedback: <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">support.tliu.co</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}