import { Mail, MessageCircle, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const contacts = [
  {
    icon: Mail,
    title: "Email Us",
    desc: "Send us an email and we'll get back to you as soon as possible.",
    link: "mailto:Office@TLIU.co",
    linkLabel: "Office@TLIU.co",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: MessageCircle,
    title: "Discord Community",
    desc: "Join our Discord server to chat with the team and community.",
    link: "https://discord.gg/gRJesCUYz9",
    linkLabel: "Join our Discord",
    color: "from-indigo-500 to-violet-600",
  },
  {
    icon: HeadphonesIcon,
    title: "Support Portal",
    desc: "Browse help articles, guides, and submit a support ticket.",
    link: "https://support.tliu.co/",
    linkLabel: "Visit Support Portal",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function ContactUs() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Contact Us</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Have a question or need help? Reach out through any of the channels below.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {contacts.map((c, i) => (
          <motion.a
            key={c.title}
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
              <c.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{c.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{c.desc}</p>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
              {c.linkLabel}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}