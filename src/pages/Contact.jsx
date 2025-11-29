import { Mail, MessageSquare, HelpCircle, Bug, Lightbulb, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { DiscordIcon } from "../components/SocialIcons";
import SEOHead from "../components/SEOHead";

export default function Contact() {
  return (
    <>
      <SEOHead 
        title="Contact Us - File Optimized | Support & Feedback"
        description="Get in touch with the File Optimized team. Submit bug reports, feature requests, or general inquiries through our support portal or Discord community."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Support Portal */}
          <a 
            href="https://support.tliu.co/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg"
          >
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
              <HelpCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              Support Portal
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Visit our dedicated support portal for help articles, FAQs, and to submit support tickets.
            </p>
            <span className="text-emerald-600 font-medium">support.tliu.co →</span>
          </a>

          {/* Discord */}
          <a 
            href="https://discord.gg/gRJesCUYz9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-[#5865F2] dark:hover:border-[#5865F2] transition-all hover:shadow-lg"
          >
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors">
              <DiscordIcon className="w-7 h-7 text-[#5865F2]" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              Discord Community
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Join our Discord server to chat with the community, get real-time help, and stay updated.
            </p>
            <span className="text-[#5865F2] font-medium">Join Discord →</span>
          </a>
        </div>

        {/* Contact Types */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            How Can We Help?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <a 
              href="https://support.tliu.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl p-5 border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow"
            >
              <Bug className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Report a Bug</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Found something not working? Let us know so we can fix it quickly.
              </p>
            </a>

            <a 
              href="https://support.tliu.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl p-5 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow"
            >
              <Lightbulb className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Feature Request</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Have an idea to make File Optimized better? We'd love to hear it!
              </p>
            </a>

            <a 
              href="https://support.tliu.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
            >
              <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">General Inquiry</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Questions about features, pricing, or anything else? Ask away!
              </p>
            </a>
          </div>
        </section>

        {/* Company Info */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-600" />
            Company Information
          </h2>
          <div className="space-y-3 text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-white">Company:</strong> TLIU Studios
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Website:</strong>{" "}
              <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                www.tliu.co
              </a>
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Support Portal:</strong>{" "}
              <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                support.tliu.co
              </a>
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Discord:</strong>{" "}
              <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                discord.gg/gRJesCUYz9
              </a>
            </p>
          </div>
        </section>

        {/* Response Time */}
        <section className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We typically respond to support requests within 24-48 hours during business days.
            <br />
            For urgent issues, please join our Discord for faster assistance.
          </p>
        </section>

        {/* Quick Links */}
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
            Helpful Resources
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to={createPageUrl('HowItWorks')} 
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              How It Works
            </Link>
            <Link 
              to={createPageUrl('PrivacyPolicy')} 
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to={createPageUrl('TermsOfService')} 
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to={createPageUrl('About')} 
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              About Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}