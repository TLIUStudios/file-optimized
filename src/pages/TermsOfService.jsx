import { FileText, AlertTriangle, CreditCard, Ban, Scale, Mail } from "lucide-react";
import SEOHead from "../components/SEOHead";

export default function TermsOfService() {
  return (
    <>
      <SEOHead 
        title="Terms of Service - File Optimized"
        description="Read the Terms of Service for File Optimized. Understand your rights and responsibilities when using our media compression and optimization platform."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: November 29, 2025
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Welcome to File Optimized. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
            </p>
          </section>

          {/* Acceptance */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <FileText className="w-6 h-6 text-emerald-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              By accessing or using File Optimized ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              File Optimized provides browser-based media optimization tools, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Image compression and format conversion</li>
              <li>Video compression and editing</li>
              <li>Audio compression and editing</li>
              <li>AI-powered image upscaling</li>
              <li>Batch file processing</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              All file processing occurs locally in your browser. We do not upload, store, or have access to your files.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              3. User Accounts
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              Some features may require you to create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your information if it changes</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          {/* Free vs Pro */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              4. Free and Pro Plans
            </h2>
            
            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Free Plan</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The free plan provides access to basic features with certain limitations, including file size limits and batch processing caps. Free users may see advertisements.
            </p>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Pro Plan</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The Pro plan offers enhanced features including higher file size limits, larger batch uploads, ad-free experience, and priority processing. Pro subscriptions are billed monthly or annually as selected at signup.
            </p>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Billing and Cancellation</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Pro subscriptions automatically renew unless cancelled</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds are provided for partial billing periods</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Ban className="w-6 h-6 text-emerald-600" />
              5. Acceptable Use
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              You agree not to use File Optimized to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-1">
              <li>Process illegal, harmful, or offensive content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to hack, exploit, or compromise our systems</li>
              <li>Use automated systems to abuse the service</li>
              <li>Circumvent any usage limits or restrictions</li>
              <li>Resell or redistribute the service without permission</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              6. Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              <strong>Your Content:</strong> You retain all rights to the files you process using File Optimized. We claim no ownership over your content.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              <strong>Our Content:</strong> The File Optimized website, brand, logo, and underlying technology are owned by TLIU Studios and protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without permission.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <AlertTriangle className="w-6 h-6 text-emerald-600" />
              7. Disclaimers and Limitations
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-6 border border-amber-200 dark:border-amber-800 mt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">"As Is" Service</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-0">
                File Optimized is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or meet your specific requirements.
              </p>
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">Limitation of Liability</h3>
            <p className="text-slate-600 dark:text-slate-400">
              To the maximum extent permitted by law, TLIU Studios and File Optimized shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or business opportunities.
            </p>

            <h3 className="font-semibold text-slate-900 dark:text-white mt-6 mb-3">File Processing</h3>
            <p className="text-slate-600 dark:text-slate-400">
              While we strive for optimal results, we cannot guarantee specific compression ratios or quality outcomes. Results may vary depending on the source file and selected settings. Always keep backups of your original files.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              8. Indemnification
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              You agree to indemnify and hold harmless TLIU Studios, its affiliates, and employees from any claims, damages, or expenses arising from your use of the service or violation of these terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Scale className="w-6 h-6 text-emerald-600" />
              9. Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of the service shall be resolved through appropriate legal channels.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              10. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes by posting on our website or sending an email to registered users. Your continued use of File Optimized after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              11. Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              We may terminate or suspend your access to File Optimized immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white mt-0">
              <Mail className="w-6 h-6 text-emerald-600" />
              12. Contact Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 mb-0">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2 mb-0">
              <strong>TLIU Studios</strong><br />
              Website: <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">www.tliu.co</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}