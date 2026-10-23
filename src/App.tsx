import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  Home,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Cpu,
  RefreshCw,
  X,
  FileText,
  Truck,
  Paintbrush,
  CreditCard,
  User,
  Star,
  MapPin
} from 'lucide-react';
import { Navbar } from './components/Navbar.js';
import { PropertyCard } from './components/PropertyCard.js';
import { PropertyDetailModal } from './components/PropertyDetailModal.js';
import { AiConciergeModal } from './components/AiConciergeModal.js';
import { VisitPassModal } from './components/VisitPassModal.js';
import { GroqSettingsModal } from './components/GroqSettingsModal.js';
import { AuthModal } from './components/AuthModal.js';
import { OwnerPortalView } from './components/OwnerPortalView.js';
import { MyVisitsView } from './components/MyVisitsView.js';
import { HowItWorksSection } from './components/HowItWorksSection.js';
import { Footer } from './components/Footer.js';
import { WhatsAppNotificationModal } from './components/WhatsAppNotificationModal.js';
import { Property, UserProfile, VisitBooking, AppNotification } from './types/index.js';

export default function App() {
  // Navigation & View state
  const [activeView, setActiveView] = useState<'home' | 'owner' | 'visits' | 'how-it-works'>('home');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('zenith_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default to null so user can test the "need to login before viewing property" flow out of the box!
    return null;
  });

  // Groq API Configuration
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    return localStorage.getItem('zenith_groq_api_key') || '';
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    return localStorage.getItem('zenith_groq_model') || 'llama-3.3-70b-versatile';
  });
  const [serverHasGroqKey, setServerHasGroqKey] = useState<boolean>(false);

  // Properties & Visits state
  const [properties, setProperties] = useState<Property[]>([]);
  const [userVisits, setUserVisits] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [searchTab, setSearchTab] = useState<'rent' | 'buy' | 'commercial'>('rent');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<number>(250000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'area_high'>('recommended');

  // Modals state
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<Property | null>(null);
  const [selectedPropertyForChat, setSelectedPropertyForChat] = useState<Property | null>(null);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<Property | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authCustomMessage, setAuthCustomMessage] = useState<string>('');
  const [authInitialRole, setAuthInitialRole] = useState<'tenant' | 'owner'>('tenant');
  const [isGroqModalOpen, setIsGroqModalOpen] = useState<boolean>(false);

  // WhatsApp Notification Modals state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [activeOwnerNotification, setActiveOwnerNotification] = useState<AppNotification | null>(null);
  const [activeTenantNotification, setActiveTenantNotification] = useState<AppNotification | null>(null);
  const [userNotifications, setUserNotifications] = useState<AppNotification[]>([]);

  // Pending property to open immediately after login
  const [pendingProperty, setPendingProperty] = useState<Property | null>(null);

  // Save user changes
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('zenith_user', JSON.stringify(user));
    if (user.role === 'owner') {
      setActiveView('owner');
      setPendingProperty(null);
    } else if (pendingProperty) {
      setSelectedPropertyForDetails(pendingProperty);
      setPendingProperty(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('zenith_user');
  };

  // Instant 1-click Demo Login
  const handleQuickDemoLogin = (demoRole: 'tenant' | 'owner') => {
    if (demoRole === 'tenant') {
      const demoTenant: UserProfile = {
        id: 'tenant-demo',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98450 11223',
        role: 'tenant'
      };
      handleLogin(demoTenant);
    } else {
      const demoOwner: UserProfile = {
        id: 'owner-1',
        name: 'Col. Vikramaditya Rathore',
        email: 'vikram.rathore.homes@gmail.com',
        phone: '+91 98451 88234',
        role: 'owner'
      };
      handleLogin(demoOwner);
      setActiveView('owner');
    }
  };

  const handleSaveGroqKey = (key: string, model: string) => {
    setGroqApiKey(key);
    setGroqModel(model);
    localStorage.setItem('zenith_groq_api_key', key);
    localStorage.setItem('zenith_groq_model', model);
  };

  // Fetch properties and user visits
  const fetchData = async () => {
    setLoading(true);
    try {
      fetch('/api/config/ai-status')
        .then(res => res.json())
        .then(cfg => {
          setServerHasGroqKey(cfg.hasServerGroqKey);
        })
        .catch(() => {});

      const userIdParam = currentUser?.id ? `?userId=${currentUser.id}` : '';
      const propRes = await fetch(`/api/properties${userIdParam}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperties(propData);
      }

      if (currentUser?.id) {
        const visitRes = await fetch(`/api/visits/user/${currentUser.id}`);
        if (visitRes.ok) {
          const visitData = await visitRes.json();
          setUserVisits(visitData || []);
        }

        const notifRes = await fetch(`/api/notifications/${currentUser.id}`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setUserNotifications(notifData || []);
          if (notifData && notifData.length > 0 && !activeOwnerNotification && !activeTenantNotification) {
            if (currentUser.role === 'owner') {
              setActiveOwnerNotification(notifData[0]);
            } else {
              setActiveTenantNotification(notifData[0]);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.id]);

  const handleVisitUnlocked = (booking: VisitBooking) => {
    setUserVisits(prev => [booking, ...prev]);
    fetchData();
  };

  const isPropertyUnlocked = (propertyId: string) => {
    return userVisits.some(
      v => v.propertyId === propertyId && v.paymentStatus === 'paid'
    );
  };

  // Trigger login requirement before inspecting/chatting
  const triggerLoginRequirement = (reason?: string) => {
    setAuthCustomMessage(reason || 'Please log in to view complete property information and chat with the AI Concierge.');
    setAuthInitialRole('tenant');
    setIsAuthModalOpen(true);
  };

  // Property card click handler: If logged in -> open unified details & AI chat! If not -> save pending and prompt login!
  const handlePropertyCardClick = (property: Property) => {
    if (!currentUser) {
      setPendingProperty(property);
      triggerLoginRequirement(`Sign in to view details and chat with the AI Concierge for "${property.title}"`);
    } else {
      setSelectedPropertyForDetails(property);
    }
  };

  // Filter & Sort
  const filteredProperties = properties
    .filter(prop => {
      if (selectedCity !== 'All' && prop.city !== selectedCity) return false;
      if (selectedBhk !== 'All' && prop.propertyType !== selectedBhk) return false;
      if (selectedFurnishing !== 'All' && prop.furnishing !== selectedFurnishing) return false;
      if (prop.monthlyRent > maxBudget) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchLocality = prop.locality.toLowerCase().includes(q);
        const matchCity = prop.city.toLowerCase().includes(q);
        const matchAmenities = prop.amenities.some(a => a.toLowerCase().includes(q));
        if (!matchTitle && !matchLocality && !matchCity && !matchAmenities) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.monthlyRent - b.monthlyRent;
      if (sortBy === 'price_high') return b.monthlyRent - a.monthlyRent;
      if (sortBy === 'area_high') return b.carpetAreaSqFt - a.carpetAreaSqFt;
      return 0; // recommended
    });

  const popularLocalities = [
    'Indiranagar',
    'HSR Layout',
    'Bandra West',
    'DLF Cyber City',
    'Financial District',
    'Koramangala'
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(role) => {
          setAuthCustomMessage('');
          setAuthInitialRole(role || 'tenant');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenGroqSettings={() => setIsGroqModalOpen(true)}
        onOpenAddListing={() => {
          if (!currentUser) {
            setAuthCustomMessage('Please sign in as a House Owner to list your property free');
            setAuthInitialRole('owner');
            setIsAuthModalOpen(true);
          } else {
            setActiveView('owner');
          }
        }}
        activeView={activeView}
        setActiveView={setActiveView}
        visitsCount={userVisits.length}
        hasGroqKey={Boolean(groqApiKey || serverHasGroqKey)}
        onQuickDemoLogin={handleQuickDemoLogin}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        notificationCount={userNotifications.length}
      />

      {/* Main Body Routing */}
      <main className="flex-1">
        {activeView === 'owner' ? (
          <OwnerPortalView
            currentUser={currentUser}
            onOpenAuth={(role) => {
              setAuthCustomMessage('Log in as House Owner to manage your properties and view verified visit leads.');
              setAuthInitialRole(role || 'owner');
              setIsAuthModalOpen(true);
            }}
            onPropertyCreated={(newProp) => {
              setProperties(prev => [newProp, ...prev]);
              setActiveView('owner');
            }}
            onOpenPropertyDetails={(prop) => setSelectedPropertyForDetails(prop)}
            onShowWhatsAppModal={(ownerNotif, tenantNotif) => {
              setActiveOwnerNotification(ownerNotif);
              if (tenantNotif) setActiveTenantNotification(tenantNotif);
              setIsWhatsAppModalOpen(true);
            }}
          />
        ) : activeView === 'visits' ? (
          <MyVisitsView
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthCustomMessage('Sign in to view your booked visit passes');
              setIsAuthModalOpen(true);
            }}
            onExploreHomes={() => setActiveView('home')}
          />
        ) : activeView === 'how-it-works' ? (
          <HowItWorksSection
            onStartBrowsing={() => setActiveView('home')}
            onPostHouse={() => {
              if (!currentUser) {
                setAuthCustomMessage('Log in as House Owner to post your property free');
                setAuthInitialRole('owner');
                setIsAuthModalOpen(true);
              } else {
                setActiveView('owner');
              }
            }}
          />
        ) : (
          /* HOME VIEW */
          <div>
            {/* HERO SECTION - NOBROKER STYLE */}
            <section className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
              <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-8">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-neutral-800 px-3 py-1 rounded-md border border-neutral-700 mb-3 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>India's Leading Zero Brokerage Portal with Groq AI Shield</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                    Direct Owner Homes. Zero Brokerage.
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto">
                    Verified house owners connect with genuine tenants. Our AI Concierge answers all questions 24/7. Owner contacts unlock only with a ₹199 Visit Pass.
                  </p>

                  {/* Demo Logins Notification Banner if not logged in */}
                  {!currentUser && (
                    <div className="mt-4 p-3 bg-neutral-800/90 border border-neutral-700/80 rounded-xl inline-flex flex-col sm:flex-row items-center gap-3 text-xs text-neutral-300">
                      <span className="flex items-center gap-1.5 font-medium text-amber-300">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Login required to inspect properties & chat with AI:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickDemoLogin('tenant')}
                          className="px-3 py-1 bg-white text-neutral-900 hover:bg-neutral-100 rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Demo Tenant Login
                        </button>
                        <button
                          onClick={() => handleQuickDemoLogin('owner')}
                          className="px-3 py-1 bg-amber-400 text-neutral-950 hover:bg-amber-300 rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Demo Owner Login
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NOBROKER STYLE SEARCH BOX */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-5 text-neutral-900 border border-neutral-200">
                  {/* Rent / Buy / Commercial Toggle Tabs */}
                  <div className="flex items-center gap-1 border-b border-neutral-200 pb-3 mb-4">
                    <button
                      onClick={() => setSearchTab('rent')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        searchTab === 'rent'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Rent
                    </button>
                    <button
                      onClick={() => setSearchTab('buy')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        searchTab === 'buy'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setSearchTab('commercial')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        searchTab === 'commercial'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Commercial
                    </button>
                  </div>

                  {/* Primary Search Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
                    {/* City Dropdown */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Select City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-medium"
                      >
                        <option value="All">All Metro Cities</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Gurugram">Gurugram</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                      </select>
                    </div>

                    {/* Search Locality Input */}
                    <div className="sm:col-span-6 relative">
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Search Locality or Landmark
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g. Indiranagar, HSR, Manyata, Bandra..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    {/* Configuration / BHK */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Configuration
                      </label>
                      <select
                        value={selectedBhk}
                        onChange={(e) => setSelectedBhk(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-medium"
                      >
                        <option value="All">Any BHK</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="Studio">Studio</option>
                      </select>
                    </div>
                  </div>

                  {/* Popular Localities Chips & Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      <span className="text-[11px] font-medium text-neutral-400 shrink-0">Popular:</span>
                      {popularLocalities.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setSearchQuery(loc)}
                          className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                            searchQuery === loc
                              ? 'bg-neutral-900 text-white font-semibold'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-[11px] text-neutral-600 font-medium">
                        Max Rent: <strong className="text-neutral-900">₹{maxBudget.toLocaleString('en-IN')}/mo</strong>
                      </div>
                      <input
                        type="range"
                        min={20000}
                        max={250000}
                        step={5000}
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-24 accent-neutral-900 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Trust Badges Bar */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto text-xs text-neutral-300">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>0% Brokerage Guarantee</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>100% Genuine House Owners</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>AI Privacy Shield Protection</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>₹199 Token Visit Pass</span>
                  </div>
                </div>
              </div>
            </section>

            {/* POPULAR ESSENTIAL REAL ESTATE SERVICES STRIP (NOBROKER SIGNATURE FEATURE) */}
            <section className="bg-white border-b border-neutral-200 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-colors flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-800">Rental Agreement</h4>
                      <p className="text-[11px] text-neutral-500">Delivered in 2 hours</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-colors flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-800">Packers & Movers</h4>
                      <p className="text-[11px] text-neutral-500">Up to 30% discount</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-colors flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Paintbrush className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-blue-800">Painting & Cleaning</h4>
                      <p className="text-[11px] text-neutral-500">Sanitized move-in</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-colors flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-purple-800">Pay Rent via Card</h4>
                      <p className="text-[11px] text-neutral-500">Earn rewards & cashbacks</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PROPERTIES LISTINGS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Verified House Owner Listings
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Showing {filteredProperties.length} homes with 100% zero brokerage & AI Privacy Shield
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Rent: Low to High</option>
                    <option value="price_high">Rent: High to Low</option>
                    <option value="area_high">Carpet Area: High to Low</option>
                  </select>

                  {(selectedCity !== 'All' || selectedBhk !== 'All' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCity('All');
                        setSelectedBhk('All');
                        setSearchQuery('');
                        setMaxBudget(250000);
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-xs text-neutral-500">
                  <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading verified properties...</span>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="py-16 text-center bg-white border border-neutral-200 rounded-xl p-8">
                  <Building className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-neutral-800">
                    No properties match your filter
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Try expanding the budget slider or selecting "All Metro Cities" to see more verified homes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      isUnlocked={isPropertyUnlocked(prop.id)}
                      currentUser={currentUser}
                      onOpenDetails={() => handlePropertyCardClick(prop)}
                      onOpenChat={() => handlePropertyCardClick(prop)}
                      onScheduleVisit={(property) => {
                        if (!currentUser) {
                          setPendingProperty(property);
                          triggerLoginRequirement(`Sign in to schedule a visit for "${property.title}"`);
                        } else {
                          setSelectedPropertyForVisit(property);
                        }
                      }}
                      onRequireLogin={() => {
                        setPendingProperty(prop);
                        triggerLoginRequirement(`Sign in to view details and chat with the AI Concierge for "${prop.title}"`);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Testimonials Proof Section */}
            <section className="bg-neutral-100/70 border-t border-neutral-200 py-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h3 className="text-xl font-bold text-neutral-900">
                    Loved by Owners & Tenants Across India
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Direct transparency without 15 to 30 days brokerage cuts
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      "I listed my 3 BHK in Sobha City. Usually, local brokers flood my phone with 50 spam calls a day. Here, the AI handled all repetitive inquiries and only 3 genuine tenants paid the ₹199 token and came to visit!"
                    </p>
                    <div className="text-xs pt-2 border-t border-neutral-100">
                      <strong className="text-neutral-900 block">Col. Vikramaditya Rathore</strong>
                      <span className="text-neutral-500 text-[11px]">House Owner · Bengaluru</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      "I asked the AI Concierge 10 specific questions at 1 AM about pet policy and deposit refund. It answered instantly with verified owner rules. Paid ₹199, got the owner's WhatsApp, and moved in 4 days later!"
                    </p>
                    <div className="text-xs pt-2 border-t border-neutral-100">
                      <strong className="text-neutral-900 block">Priya Sundaram</strong>
                      <span className="text-neutral-500 text-[11px]">Tenant · Indiranagar</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      "Saved over ₹55,000 in brokerage on my Bandra 2 BHK lease. The ₹199 visit pass is the fairest system in real estate. The AI middleman should be standard across all housing platforms."
                    </p>
                    <div className="text-xs pt-2 border-t border-neutral-100">
                      <strong className="text-neutral-900 block">Rohan Mehta</strong>
                      <span className="text-neutral-500 text-[11px]">Product Lead · Mumbai</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Deep dive into how it works */}
            <HowItWorksSection
              onStartBrowsing={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
              onPostHouse={() => {
                if (!currentUser) {
                  setAuthCustomMessage('Log in as House Owner to post your property free');
                  setAuthInitialRole('owner');
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('owner');
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(view) => setActiveView(view)} />

      {/* MODALS */}

      {/* Property Details Modal (Unified Details + AI Concierge Hub) */}
      <PropertyDetailModal
        isOpen={Boolean(selectedPropertyForDetails)}
        onClose={() => setSelectedPropertyForDetails(null)}
        property={selectedPropertyForDetails}
        isUnlocked={selectedPropertyForDetails ? isPropertyUnlocked(selectedPropertyForDetails.id) : false}
        currentUser={currentUser}
        groqApiKey={groqApiKey}
        groqModel={groqModel}
        onScheduleVisit={(property) => {
          setSelectedPropertyForDetails(null);
          setSelectedPropertyForVisit(property);
        }}
        onOpenAuth={() => {
          setAuthCustomMessage('Please sign in to chat with the AI Concierge');
          setIsAuthModalOpen(true);
        }}
      />

      {/* AI Concierge Chat Modal (Primary Interactive Hub) */}
      <AiConciergeModal
        isOpen={Boolean(selectedPropertyForChat)}
        onClose={() => setSelectedPropertyForChat(null)}
        property={selectedPropertyForChat}
        isUnlocked={selectedPropertyForChat ? isPropertyUnlocked(selectedPropertyForChat.id) : false}
        currentUser={currentUser}
        groqApiKey={groqApiKey}
        groqModel={groqModel}
        onOpenVisitCheckout={(property) => {
          setSelectedPropertyForChat(null);
          setSelectedPropertyForVisit(property);
        }}
        onOpenAuth={() => {
          setAuthCustomMessage('Please sign in to chat with the AI Concierge');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Visit Pass ₹199 Payment Checkout Modal */}
      <VisitPassModal
        isOpen={Boolean(selectedPropertyForVisit)}
        onClose={() => setSelectedPropertyForVisit(null)}
        property={selectedPropertyForVisit}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthCustomMessage('Please sign in to purchase a ₹199 Visit Pass');
          setIsAuthModalOpen(true);
        }}
        onVisitUnlocked={handleVisitUnlocked}
        onShowWhatsAppConfirmations={(ownerNotif, tenantNotif) => {
          setActiveOwnerNotification(ownerNotif);
          setActiveTenantNotification(tenantNotif);
          setIsWhatsAppModalOpen(true);
        }}
      />

      {/* WhatsApp Walkthrough Confirmation Modal (Both Guys) */}
      <WhatsAppNotificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        ownerNotification={activeOwnerNotification}
        tenantNotification={activeTenantNotification}
      />

      {/* Groq API Key & Model Settings Modal */}
      <GroqSettingsModal
        isOpen={isGroqModalOpen}
        onClose={() => setIsGroqModalOpen(false)}
        groqApiKey={groqApiKey}
        onSaveGroqApiKey={handleSaveGroqKey}
        groqModel={groqModel}
        serverHasGroqKey={serverHasGroqKey}
      />

      {/* Auth Modal (Dual Login: Tenant vs Owner with 1-Click Demo Logins) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        initialRole={authInitialRole}
        customMessage={authCustomMessage}
      />
    </div>
  );
}
