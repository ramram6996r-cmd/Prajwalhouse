import React from 'react';
import {
  ShieldCheck,
  Cpu,
  User,
  Home,
  Calendar,
  Sparkles,
  LogOut,
  UserCheck,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { UserProfile } from '../types/index.js';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (defaultRole?: 'tenant' | 'owner') => void;
  onLogout: () => void;
  onOpenGroqSettings: () => void;
  onOpenAddListing: () => void;
  activeView: 'home' | 'owner' | 'visits' | 'how-it-works';
  setActiveView: (view: 'home' | 'owner' | 'visits' | 'how-it-works') => void;
  visitsCount: number;
  hasGroqKey: boolean;
  onQuickDemoLogin: (role: 'tenant' | 'owner') => void;
  onOpenWhatsAppModal?: () => void;
  notificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGroqSettings,
  onOpenAddListing,
  activeView,
  setActiveView,
  visitsCount,
  hasGroqKey,
  onQuickDemoLogin,
  onOpenWhatsAppModal,
  notificationCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="text-left group flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold tracking-tighter text-lg shadow-xs">
                Z<span className="text-amber-400">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap">
                  ZenithHomes<span className="text-amber-600">.ai</span>
                </span>
                <span className="text-[10px] text-neutral-500 tracking-tight whitespace-nowrap -mt-0.5">
                  Zero Brokerage & AI Concierge
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => setActiveView('home')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap ${
                activeView === 'home' ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
              }`}
            >
              Browse Properties
            </button>
            <button
              onClick={() => setActiveView('how-it-works')}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap ${
                activeView === 'how-it-works' ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
              }`}
            >
              How AI Concierge Works
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth('owner');
                } else {
                  setActiveView('owner');
                }
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeView === 'owner' ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
              }`}
            >
              <Home className="w-3.5 h-3.5 text-neutral-500" />
              <span>Owner Portal</span>
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveView('visits')}
                className={`hover:text-neutral-900 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'visits' ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>My Visits</span>
                {visitsCount > 0 && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-neutral-900 text-white rounded-full font-mono">
                    {visitsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & Demo Login Cluster */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Groq Engine Key Config Button */}
            <button
              onClick={onOpenGroqSettings}
              title="Configure Groq API Key & Model"
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                hasGroqKey
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Groq AI</span>
              {hasGroqKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            {/* WhatsApp Notifications Alert Button */}
            {onOpenWhatsAppModal && (
              <button
                onClick={onOpenWhatsAppModal}
                title="View WhatsApp Walkthrough Alerts (Both Guys)"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden lg:inline">WhatsApp Alerts</span>
                {notificationCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                )}
              </button>
            )}

            {/* If Logged In */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-neutral-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 capitalize leading-tight">
                    {currentUser.role === 'owner' ? 'House Owner' : 'Tenant'}
                  </span>
                </div>

                {/* Switch Role Quick Button */}
                <button
                  onClick={() => onQuickDemoLogin(currentUser.role === 'tenant' ? 'owner' : 'tenant')}
                  title={`Switch to ${currentUser.role === 'tenant' ? 'Owner' : 'Tenant'} account`}
                  className="px-2.5 py-1.5 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <span>Switch to {currentUser.role === 'tenant' ? 'Owner' : 'Tenant'}</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* If NOT Logged In: Prominent Login Options + Demo Logins */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onQuickDemoLogin('tenant')}
                  className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
                  title="Instant 1-Click Login as Tenant (Aarav Sharma)"
                >
                  Demo Tenant
                </button>
                <button
                  onClick={() => onQuickDemoLogin('owner')}
                  className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
                  title="Instant 1-Click Login as House Owner (Col. Vikramaditya)"
                >
                  Demo Owner
                </button>
                <button
                  onClick={() => onOpenAuth()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
