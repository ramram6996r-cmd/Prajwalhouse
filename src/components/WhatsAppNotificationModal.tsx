import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  CheckCircle2,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AppNotification } from '../types/index.js';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerNotification: AppNotification | null;
  tenantNotification: AppNotification | null;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  ownerNotification,
  tenantNotification,
}) => {
  const [copiedTenant, setCopiedTenant] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'tenant' | 'owner'>('both');

  if (!isOpen || (!ownerNotification && !tenantNotification)) return null;

  const copyText = (text: string, target: 'tenant' | 'owner') => {
    navigator.clipboard.writeText(text);
    if (target === 'tenant') {
      setCopiedTenant(true);
      setTimeout(() => setCopiedTenant(false), 2000);
    } else {
      setCopiedOwner(true);
      setTimeout(() => setCopiedOwner(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center mb-2 shadow-xs">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            Instant WhatsApp Confirmations Dispatched!
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            Both the <strong>House Owner</strong> and <strong>Tenant</strong> have received official WhatsApp walkthrough alerts.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-lg mt-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'both' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Side-by-Side (Both Guys)
            </button>
            <button
              onClick={() => setActiveTab('tenant')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'tenant' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tenant WhatsApp Only
            </button>
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'owner' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Owner WhatsApp Only
            </button>
          </div>
        </div>

        {/* Dual WhatsApp Screens Grid */}
        <div className={`grid gap-6 ${activeTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
          {/* SCREEN 1: TENANT WHATSAPP CONFIRMATION */}
          {(activeTab === 'both' || activeTab === 'tenant') && tenantNotification && (
            <div className="bg-neutral-900 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between border border-neutral-800">
              <div>
                {/* WhatsApp Chat Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                      ZH
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>ZenithHomes Verified</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </h4>
                      <span className="text-[10px] text-neutral-400">To Tenant ({tenantNotification.tenantName})</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    Delivered
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#0b241c] border border-emerald-900/60 rounded-xl p-3.5 text-xs space-y-2 text-neutral-200">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5 pb-1 border-b border-emerald-900/60">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Booking Confirmation #TXN-ZH</span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Hi <strong>{tenantNotification.tenantName}</strong>, your walkthrough for <strong>{tenantNotification.propertyTitle}</strong> is officially confirmed!
                  </p>

                  <div className="p-2 bg-black/40 rounded-lg space-y-1 text-[11px]">
                    <div>📅 <strong>Date:</strong> {tenantNotification.date}</div>
                    <div>⏰ <strong>Slot:</strong> {tenantNotification.timeSlot}</div>
                    <div>👤 <strong>House Owner:</strong> {tenantNotification.ownerName}</div>
                    <div>📞 <strong>Owner Mobile:</strong> {tenantNotification.ownerPhone}</div>
                    <div>📍 <strong>Address:</strong> {tenantNotification.exactAddress}</div>
                  </div>

                  <p className="text-[10px] text-neutral-400 italic">
                    Tap below to navigate via Google Maps or WhatsApp the owner directly!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col gap-2">
                <a
                  href={tenantNotification.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open Confirmation in WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex gap-2">
                  <a
                    href={`tel:${tenantNotification.ownerPhone}`}
                    className="flex-1 py-1.5 text-center text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Call Owner</span>
                  </a>
                  <button
                    onClick={() => copyText(tenantNotification.whatsappText, 'tenant')}
                    className="flex-1 py-1.5 text-center text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedTenant ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTenant ? 'Copied' : 'Copy Message'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: OWNER WHATSAPP NOTIFICATION */}
          {(activeTab === 'both' || activeTab === 'owner') && ownerNotification && (
            <div className="bg-neutral-900 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between border border-neutral-800">
              <div>
                {/* WhatsApp Chat Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs text-neutral-950">
                      ZH
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>ZenithHomes Owner Bot</span>
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      </h4>
                      <span className="text-[10px] text-neutral-400">To Owner ({ownerNotification.ownerName})</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                    Lead Verified
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#2a2108] border border-amber-900/60 rounded-xl p-3.5 text-xs space-y-2 text-neutral-200">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-amber-900/60">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>🔔 New Verified Tenant Walkthrough!</span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Hello <strong>{ownerNotification.ownerName}</strong>, tenant <strong>{ownerNotification.tenantName}</strong> has scheduled a walkthrough for your listing <strong>{ownerNotification.propertyTitle}</strong>!
                  </p>

                  <div className="p-2 bg-black/40 rounded-lg space-y-1 text-[11px]">
                    <div>👤 <strong>Tenant:</strong> {ownerNotification.tenantName}</div>
                    <div>📱 <strong>Tenant Mobile:</strong> {ownerNotification.tenantPhone}</div>
                    <div>📅 <strong>Date:</strong> {ownerNotification.date}</div>
                    <div>⏰ <strong>Slot:</strong> {ownerNotification.timeSlot}</div>
                    <div>✅ <strong>Status:</strong> ₹199 Token Paid & Verified Lead</div>
                  </div>

                  <p className="text-[10px] text-neutral-400 italic">
                    The tenant has agreed to visit. Please keep the flat accessible at the scheduled slot!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${ownerNotification.tenantPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(ownerNotification.tenantName)},%20I%20received%20your%20verified%20visit%20request%20for%20${encodeURIComponent(ownerNotification.propertyTitle)}%20on%20${ownerNotification.date}.%20Looking%20forward%20to%20meeting%20you!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply to Tenant on WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex gap-2">
                  <a
                    href={`tel:${ownerNotification.tenantPhone}`}
                    className="flex-1 py-1.5 text-center text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-amber-400" />
                    <span>Call Tenant</span>
                  </a>
                  <button
                    onClick={() => copyText(ownerNotification.whatsappText, 'owner')}
                    className="flex-1 py-1.5 text-center text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedOwner ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedOwner ? 'Copied' : 'Copy Message'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Real WhatsApp templates generated with instant click-to-chat links.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
