'use client';
import Link from 'next/link';
import { Building2, ArrowRight, CheckCircle, Zap, Shield, Clock, Star, ChevronRight } from 'lucide-react';

const features = [
  { icon: Zap, title: 'One-Click Submission', desc: 'Submit to all departments simultaneously with a single request' },
  { icon: Shield, title: 'Secure & Verified', desc: 'Aadhaar eKYC, DigiLocker integration, and end-to-end encryption' },
  { icon: Clock, title: 'Real-Time Tracking', desc: 'Monitor your request status across every department live' },
  { icon: CheckCircle, title: 'Zero Middlemen', desc: 'Direct digital workflow — no agents, no corruption, no delays' },
];

const departments = [
  { name: 'Property Tax', emoji: '🏛️', color: 'from-blue-500/20 to-blue-600/5' },
  { name: 'Electricity Board', emoji: '⚡', color: 'from-yellow-500/20 to-yellow-600/5' },
  { name: 'Water Supply', emoji: '💧', color: 'from-cyan-500/20 to-cyan-600/5' },
  { name: 'Gas Connection', emoji: '🔥', color: 'from-orange-500/20 to-orange-600/5' },
  { name: 'Land Records', emoji: '📋', color: 'from-green-500/20 to-green-600/5' },
];

const steps = [
  { n: '01', title: 'Register & Verify', desc: 'Create your account and complete Aadhaar KYC in minutes' },
  { n: '02', title: 'Upload Documents', desc: 'Upload sale deed and ID proof once — we do the rest' },
  { n: '03', title: 'Submit Request', desc: 'Select departments, pay fees, and submit your request' },
  { n: '04', title: 'Track & Receive', desc: 'Get real-time updates and your new ownership certificate' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[var(--navy-950)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CivicSync</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <Star size={14} className="text-yellow-400" />
          Government of India · Approved Digital Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Property Transfer,{' '}
          <span className="gradient-text">Unified.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop visiting 5 different offices. CivicSync digitizes and automates all post-purchase
          ownership transfers across every government department — in one seamless workflow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-gold text-base px-8 py-3">
            Start Free Transfer <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-3">
            Track Existing Request
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { val: '5 Depts', label: 'Covered' },
            { val: '72 hrs', label: 'Avg Resolution' },
            { val: '100%', label: 'Digital' },
          ].map(({ val, label }) => (
            <div key={label} className="glass p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{val}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-8 font-medium">Integrated Departments</p>
          <div className="flex flex-wrap justify-center gap-4">
            {departments.map(({ name, emoji, color }) => (
              <div key={name} className={`glass bg-gradient-to-br ${color} px-5 py-3 flex items-center gap-3`}>
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-medium text-white">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Why CivicSync?</h2>
        <p className="text-slate-400 text-center mb-12">Built for India's property owners, by India's digital infrastructure</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <Icon size={22} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[var(--navy-900)]/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-slate-400 text-center mb-12">Complete your property transfer in 4 simple steps</p>
          <div className="space-y-6">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="flex items-start gap-6 glass p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">{title}</h3>
                  <p className="text-slate-400">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={20} className="text-slate-600 ml-auto mt-3 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto glass p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to transfer ownership?</h2>
          <p className="text-slate-400 mb-8">Join thousands of Indian property owners who have digitized their transfer process.</p>
          <Link href="/register" className="btn-primary text-base px-10 py-3">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Building2 size={18} className="text-indigo-400" />
          <span className="font-bold text-white">CivicSync</span>
        </div>
        <p className="text-slate-500 text-sm">© 2025 CivicSync. A Government of India Digital Initiative.</p>
      </footer>
    </div>
  );
}
