import React, { useState, useEffect } from 'react';
import { X, User, Home, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types/index.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  initialRole?: 'tenant' | 'owner';
  customMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialRole = 'tenant',
  customMessage,
}) => {
  const [role, setRole] = useState<'tenant' | 'owner'>(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleQuickLogin = (demoRole: 'tenant' | 'owner') => {
    if (demoRole === 'tenant') {
      onLogin({
        id: 'tenant-demo',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98450 11223',
        role: 'tenant'
      });
    } else {
      onLogin({
        id: 'owner-1',
        name: 'Col. Vikramaditya Rathore',
        email: 'vikram.rathore.homes@gmail.com',
        phone: '+91 98451 88234',
        role: 'owner'
      });
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (role === 'owner' ? 'Property Owner' : 'Verified Tenant');
    const finalEmail = email.trim() || `${role}@example.com`;
    const finalPhone = phone.trim() || '+91 98765 43210';

    onLogin({
      id: `${role}-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      role
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-lg mb-2 shadow-xs">
            ZH
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            {customMessage ? 'Sign in to Continue' : (isSignUp ? 'Create ZenithHomes Account' : 'Welcome to ZenithHomes AI')}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {customMessage || 'Zero Brokerage Marketplace · AI Concierge Mediation · Direct Owner Connect'}
          </p>
        </div>

        {/* 1-Click Instant Demo Login Strip (Front & Center) */}
        <div className="mb-5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant 1-Click Demo Login</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">No password needed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('tenant')}
              className="text-left p-2.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-lg transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-0.5">
                <User className="w-3.5 h-3.5 text-neutral-600" />
                <span>Demo Tenant</span>
              </div>
              <div className="text-[11px] text-neutral-500 truncate">
                Aarav (Chat & Buy Pass)
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('owner')}
              className="text-left p-2.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-lg transition-all group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-0.5">
                <Home className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Owner</span>
              </div>
              <div className="text-[11px] text-neutral-500 truncate">
                Col. Vikramaditya (Host)
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="grow border-t border-neutral-200"></div>
          <span className="shrink mx-3 text-[11px] text-neutral-400 uppercase font-mono">Or Custom Login</span>
          <div className="grow border-t border-neutral-200"></div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setRole('tenant')}
            className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              role === 'tenant'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>I am a Tenant / Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              role === 'owner'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>I am a House Owner</span>
          </button>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'owner' ? 'e.g. Ramesh Kumar' : 'e.g. Sneha Patel'}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Mobile Number (For OTP / WhatsApp)
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            {isSignUp ? `Create ${role === 'owner' ? 'Owner' : 'Tenant'} Account` : `Sign In as ${role === 'owner' ? 'House Owner' : 'Tenant'}`}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-neutral-600 hover:text-neutral-900 underline"
          >
            {isSignUp ? 'Already registered? Sign in with mobile' : 'New to ZenithHomes? Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
};
