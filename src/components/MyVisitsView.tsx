import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Unlock,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Home
} from 'lucide-react';
import { VisitBooking, UserProfile } from '../types/index.js';

interface MyVisitsViewProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onExploreHomes: () => void;
}

export const MyVisitsView: React.FC<MyVisitsViewProps> = ({
  currentUser,
  onOpenAuth,
  onExploreHomes,
}) => {
  const [visits, setVisits] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`/api/visits/user/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setVisits(data || []))
      .catch(err => console.error('Error fetching visits:', err))
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 bg-neutral-100 rounded-xl mx-auto flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-neutral-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">
          Sign In to View Your Booked Visits
        </h3>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          All your ₹199 Visit Passes, unlocked owner phone numbers, and exact addresses are stored in your account.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            My Booked Visits & Unlocked Contacts
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified direct connections with genuine house owners ({visits.length} active passes)
          </p>
        </div>
        <button
          onClick={onExploreHomes}
          className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Explore More Homes</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-neutral-500">
          Loading your visit passes...
        </div>
      ) : visits.length === 0 ? (
        <div className="py-16 text-center bg-white border border-neutral-200 rounded-2xl my-6 p-8">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-neutral-900">
            No active visit passes
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Browse our verified homes, chat with the AI Concierge, and unlock an in-person walkthrough for just ₹199 with zero brokerage fee.
          </p>
          <button
            onClick={onExploreHomes}
            className="mt-5 px-5 py-2.5 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800"
          >
            Explore Verified Homes
          </button>
        </div>
      ) : (
        <div className="space-y-4 my-6">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white border border-emerald-300 rounded-2xl p-5 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Visit Pass Verified
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-neutral-400">
                      {visit.paymentTransactionId}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>₹199 Paid</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900">
                    {visit.propertyTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1 font-semibold text-neutral-900">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{visit.visitDate}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-neutral-700">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{visit.visitTimeSlot}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-500">{visit.propertyLocality}</span>
                  </div>

                  {/* Unlocked Owner Details Card */}
                  <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Verified House Owner
                        </div>
                        <div className="text-sm font-bold text-neutral-900">
                          {visit.unlockedOwnerName}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Direct Mobile Number
                        </div>
                        <div className="text-sm font-bold text-neutral-900 font-mono flex items-center gap-1">
                          <span>{visit.unlockedOwnerPhone}</span>
                          <button
                            onClick={() => copyText(visit.unlockedOwnerPhone, visit.id)}
                            className="p-1 hover:bg-emerald-100 rounded text-neutral-500"
                            title="Copy number"
                          >
                            {copiedId === visit.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/80">
                      <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider mb-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>Exact Address & Navigation:</span>
                      </div>
                      <div className="text-xs text-neutral-800 font-medium bg-white p-2.5 rounded-lg border border-emerald-200">
                        {visit.unlockedAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                  <a
                    href={`tel:${visit.unlockedOwnerPhone}`}
                    className="flex-1 lg:flex-none py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Owner</span>
                  </a>
                  <a
                    href={`https://wa.me/${visit.unlockedOwnerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 lg:flex-none py-2.5 px-4 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.unlockedAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 lg:flex-none py-2 px-3 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
