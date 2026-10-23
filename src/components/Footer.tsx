import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'owner' | 'visits' | 'how-it-works') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-12 text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                ZH
              </div>
              <span className="font-bold text-neutral-900 text-sm">
                ZenithHomes<span className="text-amber-600">.ai</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              India's premier zero-brokerage real estate platform featuring an intelligent AI Concierge middleman that safeguards owner privacy and connects verified tenants.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-neutral-900 transition-colors"
                >
                  Explore Verified Homes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-neutral-900 transition-colors"
                >
                  How AI Concierge Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('owner')}
                  className="hover:text-neutral-900 transition-colors"
                >
                  Post Property Free
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('visits')}
                  className="hover:text-neutral-900 transition-colors"
                >
                  Booked Visit Passes
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs uppercase tracking-wider">
              Zero Brokerage Hubs
            </h4>
            <ul className="space-y-2">
              <li>Bengaluru (Indiranagar, HSR Layout, Koramangala, Whitefield)</li>
              <li>Mumbai (Bandra West, Powai, Andheri, Juhu)</li>
              <li>Gurugram (Golf Course Road, Cyber City, DLF Phase 5)</li>
              <li>Hyderabad (Gachibowli, Financial District, Hitec City)</li>
              <li>Pune (Kalyani Nagar, Koregaon Park, Baner)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs uppercase tracking-wider">
              Privacy & Security
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              We never sell or disclose owner contact numbers to third-party telemarketing agents or commercial brokers.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Spam Protection Guaranteed</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
          <div>
            © {new Date().getFullYear()} ZenithHomes Technologies Inc. Zero Brokerage Guarantee.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-600 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-neutral-600 cursor-pointer">Owner Protection Policy</span>
            <span className="hover:text-neutral-600 cursor-pointer">₹199 Pass Refund Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
