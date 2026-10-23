import React from 'react';
import { ShieldCheck, Sparkles, Lock, Unlock, MapPin, ArrowRight, User } from 'lucide-react';
import { Property, UserProfile } from '../types/index.js';

interface PropertyCardProps {
  property: Property;
  isUnlocked: boolean;
  currentUser: UserProfile | null;
  onOpenDetails: (property: Property) => void;
  onOpenChat: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
  onRequireLogin: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isUnlocked,
  currentUser,
  onOpenDetails,
  onOpenChat,
  onScheduleVisit,
  onRequireLogin,
}) => {
  const handlePrimaryClick = () => {
    if (!currentUser) {
      onRequireLogin();
    } else {
      onOpenChat(property);
    }
  };

  const handleVisitClick = () => {
    if (!currentUser) {
      onRequireLogin();
    } else {
      onScheduleVisit(property);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col transition-all hover:border-neutral-400 group shadow-xs">
      {/* Property Image Container */}
      <div
        onClick={handlePrimaryClick}
        className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden cursor-pointer"
      >
        <img
          src={property.images[0]}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Minimal verified badge - clean hairline */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-neutral-900 border border-neutral-200/80 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Direct Owner Listing</span>
        </div>

        {/* Status Lock Indicator */}
        <div className="absolute top-3 right-3">
          {isUnlocked ? (
            <div className="bg-emerald-900/90 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-xs">
              <Unlock className="w-3 h-3 text-emerald-300" />
              <span>Visit Pass Active</span>
            </div>
          ) : (
            <div className="bg-neutral-900/85 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-xs">
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Owner Shield Active</span>
            </div>
          )}
        </div>

        {/* Quick price tag at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none drop-shadow-md">
          <div className="bg-neutral-950/85 backdrop-blur-xs px-3 py-1.5 rounded-lg">
            <span className="text-base font-bold tabular-nums">
              ₹{property.monthlyRent.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-neutral-300"> / month</span>
          </div>
          <div className="bg-neutral-950/85 backdrop-blur-xs px-2.5 py-1.5 rounded-lg text-[11px] text-neutral-200">
            Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Unboxed Clean Metadata */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-800">{property.propertyType}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{property.carpetAreaSqFt} sq.ft</span>
            <span aria-hidden="true">·</span>
            <span>{property.floor}</span>
            <span aria-hidden="true">·</span>
            <span>{property.furnishing}</span>
          </div>

          <h3
            onClick={handlePrimaryClick}
            className="text-base font-bold text-neutral-900 hover:text-neutral-700 cursor-pointer line-clamp-1 transition-colors"
          >
            {property.title}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-1 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{property.locality}, {property.city}</span>
          </p>

          {/* Privacy Protection Banner on Card */}
          <div className="mt-3.5 p-2.5 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs">
            {isUnlocked ? (
              <div className="space-y-1 text-emerald-950">
                <div className="font-semibold flex items-center gap-1 text-[11px] text-emerald-800">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Owner Contact & Address Unlocked:</span>
                </div>
                <div className="text-[11px] truncate">
                  <strong>{property.ownerName}:</strong> {property.confidentialOwnerPhone}
                </div>
                <div className="text-[11px] text-neutral-600 truncate">
                  {property.confidentialExactAddress}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-neutral-600">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-medium text-neutral-800">Owner contact & exact flat # confidential.</span>
                  <span className="text-neutral-500 block">
                    AI Concierge answers all questions. Unlocks with ₹199 Visit Pass.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center gap-2">
          {currentUser ? (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="flex-1 py-2 px-3 text-xs font-semibold text-neutral-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chat with AI Concierge</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequireLogin}
              className="flex-1 py-2 px-3 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Login to View & Chat</span>
            </button>
          )}

          {isUnlocked ? (
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="py-2 px-3.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>View Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVisitClick}
              className="py-2 px-3.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap cursor-pointer"
            >
              <span>Visit (₹199)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
