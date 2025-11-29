import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";
import SEOHead from "../components/SEOHead";

const securityFeatures = [
  {
    icon: Lock,
    title: "Client-Side Processing",
    description: "All file compression and conversion happens directly in your browser. Your files never leave your device or touch our servers.",
    details: [
      "Files processed using JavaScript and WebAssembly",
      "No server uploads required",
      "Works even when offline",
      "Zero data transmission risk"
    ]
  },
  {
    icon: Eye,
    title: "Privacy by Design",
    description: "We cannot see, access, or store your files. Our architecture makes it technically impossible for us to view your content.",
    details: [
      "No file storage on our servers",
      "No file logging or tracking",
      "No third-party file access",
      "Complete user data control"
    ]
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Our website and authentication systems use industry-standard security measures to protect your account.",
    details: [
      "HTTPS/TLS encryption everywhere",
      "Secure authentication via OAuth",
      "Regular security audits",
      "DDoS protection"
    ]
  },
  {
    icon: Shield,
    title: "Data Protection",
    description: "Any account data you provide is protected with enterprise-grade security and encryption.",
    details: [
      "Encrypted data at rest",
      "Secure payment processing via Stripe",
      "GDPR compliant practices",
      "Minimal data collection policy"
    ]
  }
];

export default function Security() {
  return (
    <>
      <SEOHead 
        title="Security - File Optimized | Your Privacy Protected"
        description="Learn how File Optimized protects your privacy and security. 100% client-side processing means your files never leave your device. Enterprise-grade security for your peace of mind."
      />
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Security & Privacy
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your files never leave your device. That's not just a promise—it's how we built the technology.
          </p>
        </div>

        {/* Key Differentiator */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 mb-12 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Why We're Different
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Most online file tools upload your files to their servers for processing. This creates privacy risks and requires you to trust third parties with your sensitive data.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">File Optimized is different.</strong> We use modern browser technologies (JavaScript, WebAssembly, Web Workers) to process everything locally on your device. Your files stay on your computer—we never see them, store them, or have access to them.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Technical Details */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Technical Security Measures</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Transport Security</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• TLS 1.3 encryption</li>
                <li>• HSTS enabled</li>
                <li>• Secure headers configured</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Application Security</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Content Security Policy</li>
                <li>• XSS protection</li>
                <li>• CSRF protection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Payment Security</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Stripe PCI compliance</li>
                <li>• No card data stored</li>
                <li>• Secure checkout flow</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Security Concerns?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                If you discover a security vulnerability, please report it responsibly through our{" "}
                <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  support portal
                </a>
                . We take all reports seriously and will respond promptly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}