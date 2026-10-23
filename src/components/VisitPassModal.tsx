import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Copy,
  Check,
  Send,
  Sparkles
} from 'lucide-react';
import { Property, UserProfile, VisitBooking, AppNotification } from '../types/index.js';

interface VisitPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onVisitUnlocked: (booking: VisitBooking) => void;
  onShowWhatsAppConfirmations?: (ownerNotif: AppNotification, tenantNotif: AppNotification) => void;
}

export const VisitPassModal: React.FC<VisitPassModalProps> = ({
  isOpen,
  onClose,
  property,
  currentUser,
  onOpenAuth,
  onVisitUnlocked,
  onShowWhatsAppConfirmations,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('Morning (10:00 AM - 12:00 PM)');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<VisitBooking | null>(null);
  const [receivedNotifications, setReceivedNotifications] = useState<{ owner: AppNotification; tenant: AppNotification } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !property) return null;

  const handlePayAndUnlock = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/visits/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone,
          userEmail: currentUser.email,
          visitDate: selectedDate,
          visitTimeSlot: timeSlot,
          paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const data = await response.json();
      setConfirmedBooking(data.booking);
      if (data.notifications) {
        setReceivedNotifications(data.notifications);
      }
      onVisitUnlocked(data.booking);
    } catch (err) {
      console.error('Error unlocking visit:', err);
      alert('Payment processing error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBooking ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Unlock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                  Zenith ₹199 Visit Pass
                </h3>
                <p className="text-xs text-neutral-500">
                  Instant Owner Mobile & Exact GPS Address Unlock
                </p>
              </div>
            </div>

            {/* Property Summary Strip */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-4">
              <div className="text-xs font-semibold text-neutral-900 line-clamp-1">
                {property.title}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                <span>{property.locality}, {property.city}</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-neutral-900 tabular-nums">
                  ₹{property.monthlyRent.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>

            {/* Dual WhatsApp Notification Guarantee notice */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-900 flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Instant Dual WhatsApp Notification:</strong> Upon checkout, BOTH you and the house owner ({property.ownerName}) immediately receive official WhatsApp confirmations with each other's contact and walkthrough slot!
              </div>
            </div>

            {/* Slot & Date Selection */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Preferred Walkthrough Date</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Preferred Time Slot</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    'Morning (10 AM - 12 PM)',
                    'Afternoon (2 PM - 4 PM)',
                    'Evening (5 PM - 7 PM)'
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-2.5 py-2 text-[11px] font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        timeSlot === slot
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {slot.split(' ')[0]}
                      <span className="block text-[10px] opacity-80">{slot.split('(')[1].replace(')', '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
                <span>Select Payment Method (₹199 Token Fee)</span>
                <span className="text-[11px] text-emerald-600 font-normal">100% Secure & Zero Brokerage</span>
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Simulated VPA / UPI ID:</span>
                    <span className="text-[10px] text-neutral-400 font-mono">GPay / PhonePe</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-mono"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-2">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Demo Ready)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-mono text-neutral-600"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-1/2 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md text-neutral-600"
                    />
                    <input
                      type="text"
                      disabled
                      value="CVV: 888"
                      className="w-1/2 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md text-neutral-600"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
                  <select className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-neutral-100/70 rounded-xl mb-5 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Zenith Verified Visit Pass</span>
                <span className="tabular-nums">₹199.00</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Brokerage Commission (Normal agents charge ₹30k+)</span>
                <span className="text-emerald-700 font-semibold">₹0.00 Free</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900 text-sm">
                <span>Total Amount Due</span>
                <span className="tabular-nums">₹199.00</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePayAndUnlock}
              disabled={isProcessing}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Secure Payment & Notifying Owner...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Pay ₹199 & Notify Owner on WhatsApp</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* SUCCESS SCREEN - OWNER DETAILS REVEALED & WHATSAPP SENT */
          <div className="text-center py-2 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Walkthrough Confirmed & Owner Notified!
              </h3>
              <p className="text-xs text-neutral-500">
                Receipt ID: <span className="font-mono font-medium">{confirmedBooking.paymentTransactionId}</span>
              </p>
            </div>

            {/* DUAL NOTIFICATION CALLOUT */}
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp Walkthrough Alerts Sent to Both Parties!</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                • <strong>Owner ({confirmedBooking.unlockedOwnerName}):</strong> Alerted via WhatsApp with your name ({confirmedBooking.tenantName}), phone, and appointment slot.<br />
                • <strong>Tenant (You):</strong> Confirmed with owner's direct mobile, exact door address, and Google Maps pin.
              </p>

              {receivedNotifications && (
                <button
                  type="button"
                  onClick={() => {
                    if (onShowWhatsAppConfirmations) {
                      onShowWhatsAppConfirmations(receivedNotifications.owner, receivedNotifications.tenant);
                    }
                  }}
                  className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>View WhatsApp Messages for Both Guys</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Revealed Owner Details Box */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Verified House Owner Contact:</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Slot: {confirmedBooking.visitDate}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-neutral-500">Property Owner Name</div>
                <div className="text-sm font-bold text-neutral-900">
                  {confirmedBooking.unlockedOwnerName}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-neutral-500">Owner Direct Mobile</div>
                <div className="text-base font-bold text-neutral-900 font-mono flex items-center justify-between">
                  <span>{confirmedBooking.unlockedOwnerPhone}</span>
                  <button
                    onClick={() => copyToClipboard(confirmedBooking.unlockedOwnerPhone)}
                    className="p-1 text-neutral-500 hover:text-neutral-900 rounded-md transition-colors"
                    title="Copy phone"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${confirmedBooking.unlockedOwnerPhone}`}
                  className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Call Owner</span>
                </a>
                <a
                  href={`https://wa.me/${confirmedBooking.unlockedOwnerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(confirmedBooking.unlockedOwnerName)},%20I%20have%20booked%20an%20official%20visit%20via%20ZenithHomes%20for%20${encodeURIComponent(confirmedBooking.propertyTitle)}%20on%20${confirmedBooking.visitDate}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <div className="text-[11px] text-neutral-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Exact Door & GPS Address:</span>
                </div>
                <p className="text-xs text-neutral-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-neutral-200">
                  {confirmedBooking.unlockedAddress}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(confirmedBooking.unlockedAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1 justify-end"
                >
                  <span>Open in Google Maps Navigation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Done & Return to Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
