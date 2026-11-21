import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  CreditCard,
  BadgeCheck,
  Landmark,
  Headphones,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LandingMarket } from '@/components/landing/LandingMarket';
import { Footer } from '@/components/layout/Footer';

const BENEFITS = [
  { Icon: ShieldCheck, title: 'Escrow protection', text: 'Your money is held safely until the card is verified and delivered.' },
  { Icon: Zap, title: 'Instant payouts', text: 'Get paid the moment your card passes verification — no waiting.' },
  { Icon: Lock, title: 'Bank-grade security', text: 'Encrypted vaults and continuous monitoring keep your account safe.' },
  { Icon: RefreshCw, title: 'Live trading rates', text: 'Transparent, market-driven rates updated in real time.' },
];

const STEPS = [
  { step: '01', title: 'Create your account', text: 'Sign up in seconds and verify your identity to start trading.' },
  { step: '02', title: 'Submit a card', text: 'Choose a brand, enter the value, and upload a clear photo of the card.' },
  { step: '03', title: 'Get paid instantly', text: 'Cards are verified in minutes and funds are released to your wallet.' },
];

const TRUST = [
  { Icon: Landmark, title: 'Licensed & compliant', text: 'We follow strict KYC and anti-fraud standards for every account.' },
  { Icon: Lock, title: 'Encrypted data', text: 'Sensitive information is encrypted at rest and in transit.' },
  { Icon: ShieldCheck, title: 'Escrow settlement', text: 'Funds are held in escrow and released only after verification.' },
  { Icon: Headphones, title: 'Human support', text: 'Real people on call to resolve disputes and answer questions.' },
];

const FAQ = [
  {
    q: 'How fast will I get paid?',
    a: 'Once your gift card passes verification, funds are released to your wallet immediately and you can withdraw to your bank account.',
  },
  {
    q: 'Which gift cards do you accept?',
    a: 'We trade a wide range of physical and digital gift cards across major brands. See the live catalogue above for current brands and rates.',
  },
  {
    q: 'How are my cards verified?',
    a: 'Our team validates each card against its issuer and checks for fraud before approving a payout. You can track the status in real time.',
  },
  {
    q: 'Are my details secure?',
    a: 'Yes. We encrypt data in transit and at rest, never store raw card images beyond verification, and require identity verification for withdrawals.',
  },
  {
    q: 'What are the fees?',
    a: 'There are no hidden fees. The rate you see is the payout you receive — competitive, market-driven rates with full transparency.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" aria-label="CARDSAFE home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-fade" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              The secure gift card marketplace
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Trade gift cards at <span className="gradient-text">market rates</span>, safely.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-500">
              Sell unused gift cards for instant cash, with escrow protection and
              bank-grade security at every step.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
              >
                Start trading <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-5 py-3 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-200"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Card visual */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative rounded-3xl border border-ink-200 bg-gradient-to-br from-surface to-ink-50 p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-ink-400">
                  Gift Card
                </span>
                <CreditCard className="h-5 w-5 text-brand-600" />
              </div>
              <div className="mt-10">
                <div className="h-2.5 w-16 rounded bg-slate-700" />
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-ink-900">$1,250.00</p>
                    <p className="mt-1 text-xs text-ink-400">Wallet balance</p>
                  </div>
                  <div className="h-9 w-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700" />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-ink-200 pt-4 text-xs text-ink-500">
                <span>•••• 4892</span>
                <span className="inline-flex items-center gap-1 text-brand-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Escrow protected
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 -z-10 h-40 w-40 rounded-full bg-brand-100 blur-3xl" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-ink-200 bg-surface/70">
        <div className="mx-auto grid max-w-6xl gap-px sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ink-900">How it works</h2>
          <p className="mt-2 text-ink-500">Three steps between you and your payout.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ step, title, text }) => (
            <div key={step} className="glass-card p-7">
              <span className="text-3xl font-bold text-brand-800">{step}</span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands + live rates (fetched from backend) */}
      <LandingMarket />

      {/* Trust / security */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ink-900">Built on trust</h2>
          <p className="mt-2 text-ink-500">
            Security and compliance are the foundation of every trade.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ Icon, title, text }) => (
            <div key={title} className="glass-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="border-t border-ink-200 bg-surface/70">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink-900">Frequently asked questions</h2>
            <p className="mt-2 text-ink-500">Everything you need to know before you trade.</p>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-ink-200 bg-surface/80 p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink-900">
                  {q}
                  <span className="ml-4 text-ink-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-surface to-ink-50 p-10 text-center sm:p-14">
          <div className="absolute inset-0 bg-radial-fade" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-ink-900">Ready to turn cards into cash?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-500">
              Join thousands of traders buying and selling gift cards on the safest marketplace.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
            >
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
