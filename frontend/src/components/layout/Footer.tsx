import Link from 'next/link';
import { ShieldCheck, Lock, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
import { LogoMark } from '@/components/ui/Logo';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Explore Gift Cards', href: '/#market' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Trading Rates', href: '/#rates' },
  { label: 'FAQs', href: '/#faqs' },
];

const ACCOUNT_LINKS = [
  { label: 'Login', href: '/login' },
  { label: 'Create Account', href: '/register' },
  { label: 'Dashboard', href: '/dashboard' },
];

const SUPPORT_LINKS = [
  { label: 'Contact Us', href: '#' },
  { label: 'Help Center', href: '#' },
  { label: 'FAQs', href: '/#faqs' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms and Conditions', href: '#' },
];

const SOCIALS = [
  { Icon: Twitter, label: 'X (Twitter)' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Github, label: 'GitHub' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-bold tracking-tight text-white">
                CARD<span className="text-brand-400">SAFE</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              The secure marketplace for buying and selling gift cards — escrow
              protection, instant payouts and bank-grade security at every step.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-brand-500 hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            © {year} CARDSAFE. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Escrow protected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-400" /> 256-bit encrypted
            </span>
            <a href="#" className="transition-colors hover:text-brand-400">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-brand-400">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
