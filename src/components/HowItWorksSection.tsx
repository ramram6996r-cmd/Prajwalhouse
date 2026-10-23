import React from 'react';
import { ShieldCheck, Lock, Unlock, Cpu, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onStartBrowsing: () => void;
  onPostHouse: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onStartBrowsing,
  onPostHouse,
}) => {
  return (
    <section className="py-16 bg-white border-y border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The AI Middleman Revolution</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Why ZenithHomes Outperforms Traditional Brokerage & Classifieds
          </h2>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            Eliminating both greedy broker commissions and unsolicited spam calls through an intelligent Groq-powered confidential mediator.
          </p>
        </div>

        {/* 4-Step Narrative Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                01. OWNER POSTING
              </span>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Confidential House Listing
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Owners upload property specifications, photos, and rent. The exact flat number and owner phone number are securely encrypted under our AI Privacy Shield.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero spam broker calls</span>
            </div>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                02. AI MEDIATION
              </span>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                24/7 Groq Concierge
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tenants ask anything: deposit, society bylaws, maintenance, parking, pet policy, or move-in dates. Groq LLaMA models respond with instant, verified clarity.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-amber-800 font-medium flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              <span>No awkward interrogation</span>
            </div>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                03. HIGH INTENT
              </span>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                ₹199 Token Visit Pass
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                When a tenant chooses to inspect the home, they purchase a ₹199 Visit Pass. This filters casual time-wasters and unlocks genuine high-intent walkthroughs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Replaces ₹50k+ broker fees</span>
            </div>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                04. DIRECT CONNECT
              </span>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Instant Owner Unlock
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The owner's direct mobile, WhatsApp, and exact Google Maps coordinates are revealed immediately to the tenant. Both parties meet directly.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct deal execution</span>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-6 text-center sm:text-left">
            Comparing the Alternatives
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                  <th className="pb-3 font-medium">Feature</th>
                  <th className="pb-3 font-medium text-red-400">Traditional Brokers</th>
                  <th className="pb-3 font-medium text-amber-400">Classified Portals</th>
                  <th className="pb-3 font-bold text-emerald-400">ZenithHomes AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr>
                  <td className="py-3 font-semibold text-neutral-300">Brokerage Fee</td>
                  <td className="py-3 text-neutral-400">1 to 2 months rent (₹40,000 – ₹1,20,000)</td>
                  <td className="py-3 text-neutral-400">Hidden agent cuts</td>
                  <td className="py-3 font-bold text-emerald-300">₹0 Brokerage (Flat ₹199 Visit Pass)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-neutral-300">Owner Phone Privacy</td>
                  <td className="py-3 text-neutral-400">Sold to 20+ telecallers</td>
                  <td className="py-3 text-neutral-400">Scraped by spam bots</td>
                  <td className="py-3 font-bold text-emerald-300">100% Shielded by Groq AI Concierge</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-neutral-300">Property Q&A</td>
                  <td className="py-3 text-neutral-400">Brokers give false promises</td>
                  <td className="py-3 text-neutral-400">Outdated descriptions</td>
                  <td className="py-3 font-bold text-emerald-300">24/7 Verified AI Concierge response</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-neutral-300">Lead Quality for Owners</td>
                  <td className="py-3 text-neutral-400">Random people arriving unannounced</td>
                  <td className="py-3 text-neutral-400">Endless ghost callers</td>
                  <td className="py-3 font-bold text-emerald-300">100% High-intent ₹199 verified appointments</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              Ready to experience transparent zero-brokerage real estate?
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onStartBrowsing}
                className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Browse Properties
              </button>
              <button
                onClick={onPostHouse}
                className="px-4 py-2 text-xs font-semibold text-amber-400 border border-amber-400/40 hover:bg-amber-400/10 rounded-lg transition-colors"
              >
                List Your House Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
