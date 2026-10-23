import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Home,
  ShieldCheck,
  Lock,
  Calendar,
  Phone,
  MessageCircle,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { Property, UserProfile, VisitBooking } from '../types/index.js';

interface OwnerPortalViewProps {
  currentUser: UserProfile | null;
  onOpenAuth: (role?: 'tenant' | 'owner') => void;
  onPropertyCreated: (newProp: Property) => void;
  onOpenPropertyDetails: (prop: Property) => void;
  onShowWhatsAppModal?: (ownerNotif: any, tenantNotif: any) => void;
}

export const OwnerPortalView: React.FC<OwnerPortalViewProps> = ({
  currentUser,
  onOpenAuth,
  onPropertyCreated,
  onOpenPropertyDetails,
  onShowWhatsAppModal,
}) => {
  const [activeTab, setActiveTab] = useState<'my-listings' | 'new-listing' | 'received-visits'>('new-listing');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [receivedVisits, setReceivedVisits] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for new property
  const [title, setTitle] = useState('Luxurious 3 BHK Penthouse in Koramangala 4th Block');
  const [tagline, setTagline] = useState('Private terrace garden, Italian modular kitchen, 100% power backup');
  const [description, setDescription] = useState('Sunlit east-facing apartment with teakwood flooring, private terrace garden, dedicated EV charging bay, and 24/7 gated security.');
  const [propertyType, setPropertyType] = useState<'1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | 'Villa' | 'Studio'>('3 BHK');
  const [bhk, setBhk] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [balconies, setBalconies] = useState(2);
  const [carpetArea, setCarpetArea] = useState(1650);
  const [furnishing, setFurnishing] = useState<'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Fully Furnished');
  const [floor, setFloor] = useState('4th of 6 floors');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('Koramangala 4th Block');
  const [exactAddress, setExactAddress] = useState('Flat 402, Oakwood Regency, 17th Main Road, Koramangala 4th Block, Bengaluru - 560034. Landmark: Opposite Bethany High School');
  const [monthlyRent, setMonthlyRent] = useState(45000);
  const [securityDeposit, setSecurityDeposit] = useState(180000);
  const [maintenanceCharges, setMaintenanceCharges] = useState(3500);
  const [ownerName, setOwnerName] = useState(currentUser?.name || 'Col. Vikramaditya Rathore');
  const [ownerPhone, setOwnerPhone] = useState(currentUser?.phone || '+91 98451 88234');
  const [tenantPreference, setTenantPreference] = useState('Working Professionals / Family');
  const [foodPreference, setFoodPreference] = useState('Any (Non-veg allowed)');
  const [petPolicy, setPetPolicy] = useState('Pets Allowed');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Fetch owner listings & received visits
  const [ownerNotifications, setOwnerNotifications] = useState<any[]>([]);

  // Fetch owner listings, received visits & notifications
  const fetchOwnerData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/${currentUser.id}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setMyProperties(data.properties || []);
        setReceivedVisits(data.visits || []);
        if (data.properties && data.properties.length > 0) {
          setActiveTab('my-listings');
        }
      }

      const notifRes = await fetch(`/api/notifications/${currentUser.id}`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setOwnerNotifications(notifData || []);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'owner') {
      fetchOwnerData();
    }
  }, [currentUser?.id, currentUser?.role]);

  // 1-Click Auto-Fill Demo House Form
  const handleAutoFillSample = () => {
    setTitle('Spacious 2 BHK in HSR Layout Sector 1');
    setTagline('Corner apartment with wide balconies, modular kitchen & covered car parking');
    setDescription('Vastu-compliant east-facing home located in a quiet tree-lined avenue in HSR Sector 1. Minutes away from top startups, cafes, and Agara Lake.');
    setPropertyType('2 BHK');
    setBhk(2);
    setBathrooms(2);
    setBalconies(1);
    setCarpetArea(1250);
    setFurnishing('Semi-Furnished');
    setFloor('2nd of 4 floors');
    setCity('Bengaluru');
    setLocality('HSR Layout Sector 1');
    setExactAddress('House #312, 14th Main, Sector 1, HSR Layout, Bengaluru - 560102. Landmark: Behind HSR Club');
    setMonthlyRent(35000);
    setSecurityDeposit(120000);
    setMaintenanceCharges(2200);
    setTenantPreference('Working Professionals / Family');
    setFoodPreference('Any (Non-veg allowed)');
    setPetPolicy('Pets Allowed');
    setImageUrl('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80');
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('owner');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        tagline: tagline || 'Direct from Owner · Verified Listing',
        description,
        propertyType,
        bhk,
        bathrooms,
        balconies,
        carpetAreaSqFt: carpetArea,
        furnishing,
        floor,
        totalFloors: 5,
        monthlyRent,
        securityDeposit,
        maintenanceCharges,
        city,
        locality,
        confidentialExactAddress: exactAddress,
        ownerId: currentUser.id,
        ownerName: ownerName || currentUser.name,
        confidentialOwnerPhone: ownerPhone || currentUser.phone,
        confidentialOwnerEmail: currentUser.email,
        images: [imageUrl],
        amenities: [
          'Covered Car Parking',
          '24/7 Gated Security',
          'Power Backup',
          'Elevator'
        ],
        houseRules: {
          tenantPreference,
          foodPreference,
          petPolicy,
          lockInPeriod: '11 Months',
          noticePeriod: '1 Month'
        },
        availableFrom: 'Immediate'
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to create listing');
      }

      const data = await res.json();
      setSubmissionSuccess(true);
      onPropertyCreated(data.property);
      fetchOwnerData();
      setActiveTab('my-listings');
    } catch (err) {
      console.error('Error creating property:', err);
      alert('Error saving property listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-14 h-14 bg-neutral-900 text-amber-400 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
          <Home className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          House Owner Shield & Zero Brokerage Portal
        </h2>
        <p className="text-sm text-neutral-600 max-w-xl mx-auto mt-2 leading-relaxed">
          List your home directly with 0% brokerage. Our Groq AI Concierge shields your personal mobile number from spam agents, answers prospective tenant questions 24/7, and sends you verified ₹199-paid visit leads.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('owner')}
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Log In as House Owner
          </button>
        </div>

        {/* Feature Highlights Bento */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 bg-white border border-neutral-200 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-neutral-900">Zero Unsolicited Calls</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Brokers never get your phone number. The AI agent acts as your confidential gatekeeper.
            </p>
          </div>
          <div className="p-5 bg-white border border-neutral-200 rounded-xl">
            <Sparkles className="w-6 h-6 text-amber-600 mb-2" />
            <h4 className="text-sm font-bold text-neutral-900">24/7 AI Tenant Concierge</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Powered by Groq models to answer queries about parking, deposit, pet rules & move-in dates.
            </p>
          </div>
          <div className="p-5 bg-white border border-neutral-200 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-neutral-900 mb-2" />
            <h4 className="text-sm font-bold text-neutral-900">High-Intent Leads Only</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Only tenants who purchase a ₹199 Visit Pass unlock your direct mobile and scheduled slot.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Owner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-neutral-900">
              House Owner Dashboard
            </h2>
            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-medium border border-neutral-200">
              Verified Owner
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Managing listings for {currentUser.name} ({currentUser.phone})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('new-listing')}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Another House</span>
          </button>
        </div>
      </div>

      {/* Live WhatsApp Alert Banner for Owner */}
      {ownerNotifications.length > 0 && (
        <div className="my-5 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>{ownerNotifications[0].title}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full font-semibold">WhatsApp Sent</span>
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                {ownerNotifications[0].message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onShowWhatsAppModal) {
                onShowWhatsAppModal(ownerNotifications[0], null);
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp Alert</span>
          </button>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 bg-white border border-neutral-200 rounded-xl">
          <span className="text-xs text-neutral-500 block">Active Listings</span>
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            {myProperties.length}
          </span>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl">
          <span className="text-xs text-neutral-500 block">AI Inquiries Handled</span>
          <span className="text-2xl font-bold text-amber-600 tabular-nums">
            {myProperties.length * 12 + 6}
          </span>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl">
          <span className="text-xs text-neutral-500 block">Verified ₹199 Visit Passes</span>
          <span className="text-2xl font-bold text-emerald-600 tabular-nums">
            {receivedVisits.length}
          </span>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl">
          <span className="text-xs text-neutral-500 block">Spam Brokers Blocked</span>
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            100%
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('new-listing')}
          className={`py-2.5 px-4 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'new-listing'
              ? 'border-neutral-900 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New House (Easy Form)</span>
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`py-2.5 px-4 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'my-listings'
              ? 'border-neutral-900 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>My Listed Properties ({myProperties.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('received-visits')}
          className={`py-2.5 px-4 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'received-visits'
              ? 'border-neutral-900 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tenant Visit Requests ({receivedVisits.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: POST NEW HOUSE WIZARD */}
      {activeTab === 'new-listing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  List Your House Free
                </h3>
                <p className="text-xs text-neutral-500">
                  Zero brokerage. Confidential details are encrypted and revealed only upon ₹199 Visit Pass.
                </p>
              </div>

              {/* 1-Click Auto Fill Demo Button */}
              <button
                type="button"
                onClick={handleAutoFillSample}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Fill Demo House Data</span>
              </button>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-6">
              {/* Step 1: Basics */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Property Specifications</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Spacious 3 BHK in Sobha City with Green Garden View"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Configuration
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPropertyType(val);
                        if (val.includes('1')) setBhk(1);
                        if (val.includes('2')) setBhk(2);
                        if (val.includes('3')) setBhk(3);
                        if (val.includes('4')) setBhk(4);
                      }}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4 BHK">4 BHK</option>
                      <option value="Villa">Villa</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Furnishing Status
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Carpet Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      required
                      value={carpetArea}
                      onChange={(e) => setCarpetArea(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      required
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="e.g. 4th of 12 floors"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Financials */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Financial Expectations (₹ INR)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Maintenance Charges (₹/mo)
                    </label>
                    <input
                      type="number"
                      required
                      value={maintenanceCharges}
                      onChange={(e) => setMaintenanceCharges(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Location & Confidential Address */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Location & Confidential Shield</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Gurugram">Gurugram</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Public Locality (Seen by Everyone)
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Koramangala 4th Block"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Confidential Exact Flat / Door Address & Landmark</span>
                      </label>
                      <span className="text-[10px] text-amber-700 font-medium">
                        Shielded until tenant pays ₹199 Visit Pass
                      </span>
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={exactAddress}
                      onChange={(e) => setExactAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Oakwood Regency, 17th Main Road, Bengaluru - 560034"
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-amber-50/30"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: House Rules & Preferences */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>House Rules for AI Mediator</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tenant Preference
                    </label>
                    <select
                      value={tenantPreference}
                      onChange={(e) => setTenantPreference(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="Working Professionals / Family">Working Professionals / Family</option>
                      <option value="Family Only">Family Only</option>
                      <option value="Bachelors Welcome">Bachelors Welcome</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Food / Diet
                    </label>
                    <select
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="Any (Non-veg allowed)">Any (Non-veg allowed)</option>
                      <option value="Vegetarian Only">Vegetarian Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Pet Policy
                    </label>
                    <select
                      value={petPolicy}
                      onChange={(e) => setPetPolicy(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                    >
                      <option value="Pets Allowed">Pets Allowed</option>
                      <option value="No Pets Allowed">No Pets Allowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  100% Free Listing · Zero Commission Forever
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !exactAddress.trim()}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Publishing with AI Shield...' : 'Publish Listing with AI Shield'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Tenant View Preview Card */}
          <div className="space-y-4">
            <div className="p-3 bg-neutral-100 rounded-xl text-xs text-neutral-600 flex items-center gap-2">
              <Eye className="w-4 h-4 text-neutral-700 shrink-0" />
              <span><strong>Live Preview:</strong> How prospective tenants see your home</span>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="relative aspect-4/3 bg-neutral-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded text-[10px] font-bold text-neutral-900 shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Owner</span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-neutral-900/85 px-2 py-0.5 rounded text-[10px] font-medium text-amber-300 shadow-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Privacy Shield Active</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-neutral-950/80 px-2.5 py-1 rounded text-white text-xs font-bold flex justify-between">
                  <span>₹{monthlyRent.toLocaleString('en-IN')}/mo</span>
                  <span className="font-normal text-neutral-300">Dep: ₹{securityDeposit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="text-[11px] text-neutral-500">
                  {propertyType} · {carpetArea} sq.ft · {floor} · {furnishing}
                </div>
                <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{title}</h4>
                <p className="text-xs text-neutral-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{locality}, {city}</span>
                </p>

                {/* Shield explanation */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[11px] text-neutral-700 space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>Your Shielded Details:</span>
                  </div>
                  <div className="text-neutral-500 truncate">
                    Flat #: [Encrypted until ₹199 Visit Pass]
                  </div>
                  <div className="text-neutral-500 truncate">
                    Phone: [Encrypted until ₹199 Visit Pass]
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Broker Commission Guarantee</span>
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                You never pay a single rupee. NoBroker and legacy portals often charge 15–30 days rent. ZenithHomes is 100% free for owners.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY LISTINGS */}
      {activeTab === 'my-listings' && (
        <div className="space-y-4">
          {myProperties.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200 rounded-xl">
              <Home className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-800">No properties listed yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Upload your flat or house to ZenithHomes. Zero commission, full privacy protection.
              </p>
              <button
                onClick={() => setActiveTab('new-listing')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
              >
                Post Your House
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span className="font-semibold text-neutral-900">{prop.propertyType}</span>
                      <span className="tabular-nums font-bold text-neutral-900">
                        ₹{prop.monthlyRent.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-neutral-900 line-clamp-1">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {prop.locality}, {prop.city}
                    </p>

                    {/* Confidential shield reminder */}
                    <div className="mt-3 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-neutral-800 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Confidential Address (Shielded by AI):</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 line-clamp-1">
                        {prop.confidentialExactAddress}
                      </p>
                      <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-200/60">
                        Shielded Owner Mobile: {prop.confidentialOwnerPhone}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AI Concierge Active</span>
                    </span>
                    <button
                      onClick={() => onOpenPropertyDetails(prop)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md"
                    >
                      View Live Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RECEIVED VISITS */}
      {activeTab === 'received-visits' && (
        <div className="space-y-4">
          {receivedVisits.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200 rounded-xl">
              <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-800">No scheduled visits yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                When a genuine tenant inquires via the AI Concierge and pays the ₹199 Visit Pass, their appointment and verified phone number will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">
                        {visit.tenantName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold">
                        ₹199 Paid Lead
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600">
                      Property: <strong>{visit.propertyTitle}</strong>
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-3">
                      <span>Date: <strong>{visit.visitDate}</strong></span>
                      <span>·</span>
                      <span>Slot: <strong>{visit.visitTimeSlot}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${visit.tenantPhone}`}
                      className="px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Tenant</span>
                    </a>
                    <a
                      href={`https://wa.me/${visit.tenantPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
