import { Bug, ExternalLink, MessageCircle, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEOHead from "../components/SEOHead";

const commonIssues = [
  {
    issue: "Processing is slow",
    solution: "Processing speed depends on your device. Try closing other browser tabs, use a desktop instead of mobile, or process fewer files at once."
  },
  {
    issue: "File size increased after compression",
    solution: "Some files are already optimized. Try a different format (WebP often works best) or lower the quality setting."
  },
  {
    issue: "Video processing fails",
    solution: "Ensure your browser supports WebCodecs (Chrome 94+, Edge 94+). Try a shorter video or lower resolution."
  },
  {
    issue: "Page not loading properly",
    solution: "Clear your browser cache, disable extensions, or try a different browser (Chrome recommended)."
  },
  {
    issue: "Download not working",
    solution: "Check if your browser is blocking downloads. Try right-clicking the download button and selecting 'Save As'."
  }
];

export default function ReportBug() {
  return (
    <>
      <SEOHead 
        title="Report a Bug - File Optimized"
        description="Found an issue with File Optimized? Report bugs and get help through our support portal."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bug className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Report a Bug
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Found something not working right? We're here to help!
          </p>
        </div>

        {/* Support Portal CTA */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Submit a Support Ticket
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                The fastest way to get help is through our support portal. Submit a detailed bug report and our team will investigate and respond as soon as possible.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Track your ticket status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Attach screenshots or files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Get email updates on progress
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Go to Support Portal
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Common Issues */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Common Issues & Solutions
          </h2>
          <div className="space-y-4">
            {commonIssues.map((item, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.issue}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.solution}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Other Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <MessageCircle className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Discord Community</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Join our Discord for real-time help from the community and developers.
            </p>
            <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Join Discord
              </Button>
            </a>
          </Card>

          <Card className="p-6">
            <Mail className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Prefer email? You can also reach us directly for support inquiries.
            </p>
            <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Contact Support
              </Button>
            </a>
          </Card>
        </div>

        {/* Tips for Bug Reports */}
        <Card className="p-6 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Tips for a Good Bug Report</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <li>• <strong>Describe the issue clearly</strong> - What happened vs what you expected</li>
            <li>• <strong>Steps to reproduce</strong> - How can we recreate the problem?</li>
            <li>• <strong>Browser & device info</strong> - Chrome/Firefox/Safari? Desktop/Mobile?</li>
            <li>• <strong>Screenshots or screen recordings</strong> - Visual proof helps a lot</li>
            <li>• <strong>File details</strong> - What type/size of file caused the issue?</li>
          </ul>
        </Card>
      </div>
    </>
  );
}