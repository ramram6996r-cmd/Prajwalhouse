import React, { useState, useEffect, useRef } from 'react';
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
import { initialProperties } from './data/seedData.js';

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

  // Properties & Visits state (preloaded with 20 verified direct owner properties across India)
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [userVisits, setUserVisits] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Ref to scroll to listings when Search button is clicked
  const listingsSectionRef = useRef<HTMLElement>(null);
  const [isSearchingVisual, setIsSearchingVisual] = useState<boolean>(false);

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingVisual(true);
    setTimeout(() => {
      setIsSearchingVisual(false);
      listingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

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

  // Helper: Normalize city names for Indian real estate searches (e.g. Bangalore -> Bengaluru, Gurgaon -> Gurugram)
  const normalizeCityName = (cityStr: string) => {
    const c = (cityStr || '').trim().toLowerCase();
    if (c === 'all' || c === 'all cities' || c === 'all metro cities') return 'all';
    if (c.includes('bengaluru') || c.includes('bangalore') || c === 'blr') return 'bengaluru';
    if (c.includes('mumbai') || c.includes('bombay')) return 'mumbai';
    if (c.includes('gurugram') || c.includes('gurgaon') || c === 'ggn' || c.includes('delhi')) return 'gurugram';
    if (c.includes('hyderabad') || c === 'hyd' || c.includes('cyberabad')) return 'hyderabad';
    if (c.includes('pune') || c.includes('poona')) return 'pune';
    return c;
  };

  // Fetch properties and user visits
  const fetchData = async () => {
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
        if (Array.isArray(propData) && propData.length > 0) {
          setProperties(propData);
        }
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
      console.warn('Network fetch delayed or error, active properties in memory:', err);
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

  // Filter & Sort with intelligent multi-field and alias matching
  const filteredProperties = properties
    .filter(prop => {
      // 1. City Filter with aliases
      const normSelected = normalizeCityName(selectedCity);
      const normPropCity = normalizeCityName(prop.city);
      if (normSelected !== 'all' && normPropCity !== normSelected) {
        return false;
      }

      // 2. BHK Filter (flexible string and number comparison)
      if (selectedBhk !== 'All') {
        const isStudio = selectedBhk.toLowerCase().includes('studio');
        if (isStudio) {
          if (!prop.propertyType.toLowerCase().includes('studio')) return false;
        } else {
          const targetNum = parseInt(selectedBhk);
          const typeMatch = prop.propertyType.toLowerCase().includes(selectedBhk.toLowerCase());
          const numMatch = !isNaN(targetNum) && prop.bhk === targetNum;
          if (!typeMatch && !numMatch) return false;
        }
      }

      // 3. Furnishing Filter
      if (selectedFurnishing !== 'All' && prop.furnishing !== selectedFurnishing) {
        return false;
      }

      // 4. Budget Filter
      if (prop.monthlyRent && prop.monthlyRent > maxBudget) {
        return false;
      }

      // 5. Search Query Filter with smart tokens
      if (searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();
        const normQ = normalizeCityName(rawQ);

        // General real estate keywords should not eliminate listings
        const isGenericTerm = ['flat', 'apartment', 'house', 'home', 'rent', 'property', 'properties', 'room', 'rooms', 'bhk'].includes(rawQ);
        if (isGenericTerm) return true;

        const cityAliasMatch = normQ !== 'all' && normPropCity === normQ;
        const matchTitle = prop.title.toLowerCase().includes(rawQ);
        const matchLocality = prop.locality.toLowerCase().includes(rawQ);
        const matchCity = prop.city.toLowerCase().includes(rawQ) || cityAliasMatch;
        const matchType = prop.propertyType.toLowerCase().includes(rawQ) ||
          (rawQ.includes('bhk') && rawQ.includes(String(prop.bhk))) ||
          (rawQ.replace(/\s+/g, '').includes(`${prop.bhk}bhk`));
        const matchFurnishing = prop.furnishing?.toLowerCase().includes(rawQ);
        const matchAmenities = prop.amenities?.some(a => a.toLowerCase().includes(rawQ));
        const matchDescription = prop.description?.toLowerCase().includes(rawQ);
        const matchTagline = prop.tagline?.toLowerCase().includes(rawQ);

        if (!matchTitle && !matchLocality && !matchCity && !matchType && !matchFurnishing && !matchAmenities && !matchDescription && !matchTagline) {
          return false;
        }
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
    'Koramangala',
    'Whitefield',
    'Bandra West',
    'Powai',
    'Worli',
    'Financial District',
    'DLF Cyber City',
    'Koregaon Park'
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

                  {/* Primary Search Inputs Grid with Prominent Search Button */}
                  <form onSubmit={handleExecuteSearch} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* City Dropdown */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Select City
                        </label>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-medium shadow-2xs h-[38px]"
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
                      <div className="sm:col-span-4 relative">
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Locality or Landmark
                        </label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g. Indiranagar, Bandra, Powai, HSR..."
                            className="w-full pl-9 pr-8 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white shadow-2xs h-[38px]"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                              title="Clear search"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Configuration / BHK */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Configuration
                        </label>
                        <select
                          value={selectedBhk}
                          onChange={(e) => setSelectedBhk(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white font-medium shadow-2xs h-[38px]"
                        >
                          <option value="All">Any BHK</option>
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="4 BHK">4 BHK</option>
                          <option value="Studio">Studio</option>
                        </select>
                      </div>

                      {/* PROMINENT SEARCH ACTION BUTTON */}
                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          className="w-full py-2 px-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-sm cursor-pointer h-[38px]"
                        >
                          <Search className="w-4 h-4 stroke-[2.5]" />
                          <span>Search Properties</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Popular Localities Chips & Filters Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        <span className="text-[11px] font-medium text-neutral-400 shrink-0">Popular:</span>
                        {popularLocalities.map((loc) => (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => {
                              setSearchQuery(loc);
                              handleExecuteSearch();
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                              searchQuery.toLowerCase().includes(loc.toLowerCase())
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
                  </form>
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
            <section
              id="properties-listings"
              ref={listingsSectionRef}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20"
            >
              {/* Listings Header & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-200">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <span>Verified House Owner Listings</span>
                    {isSearchingVisual && (
                      <span className="text-xs bg-amber-100 text-amber-900 font-normal px-2 py-0.5 rounded animate-pulse">
                        Updating results...
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Showing <strong className="text-neutral-900">{filteredProperties.length}</strong> of {properties.length} homes with 100% zero brokerage & AI Privacy Shield
                  </p>
                </div>

                {/* Inline Refinement Search Bar with Search Button */}
                <form
                  onSubmit={handleExecuteSearch}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search locality, street, or project..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        title="Clear"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Search</span>
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white font-medium shrink-0 cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Rent: Low to High</option>
                    <option value="price_high">Rent: High to Low</option>
                    <option value="area_high">Carpet Area: High to Low</option>
                  </select>
                </form>
              </div>

              {/* City & BHK Quick Filter Tabs Strip */}
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200 mb-6 space-y-3 shadow-2xs">
                {/* City Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>City:</span>
                  </span>
                  {['All', 'Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad', 'Pune'].map((c) => {
                    const count = c === 'All'
                      ? properties.length
                      : properties.filter(p => normalizeCityName(p.city) === normalizeCityName(c)).length;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCity(c)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                          selectedCity === c
                            ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        <span>{c === 'All' ? 'All Cities' : c}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          selectedCity === c ? 'bg-neutral-800 text-amber-300 font-bold' : 'bg-neutral-200/90 text-neutral-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* BHK Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
                    <Home className="w-3 h-3 text-neutral-500" />
                    <span>BHK:</span>
                  </span>
                  {['All', '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBhk(b)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        selectedBhk === b
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {b === 'All' ? 'All BHK' : b}
                    </button>
                  ))}
                </div>

                {/* Active Applied Filters Strip with 1-Click Clear */}
                {(selectedCity !== 'All' || selectedBhk !== 'All' || searchQuery.trim() || maxBudget < 250000 || selectedFurnishing !== 'All') && (
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-neutral-100 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-500">Applied Filters:</span>
                    {selectedCity !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCity('All')}
                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded cursor-pointer"
                      >
                        City: {selectedCity} <X className="w-3 h-3 text-neutral-500" />
                      </button>
                    )}
                    {selectedBhk !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedBhk('All')}
                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Type: {selectedBhk} <X className="w-3 h-3 text-neutral-500" />
                      </button>
                    )}
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Keyword: "{searchQuery}" <X className="w-3 h-3 text-neutral-500" />
                      </button>
                    )}
                    {maxBudget < 250000 && (
                      <button
                        type="button"
                        onClick={() => setMaxBudget(250000)}
                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Max Rent: ₹{maxBudget.toLocaleString('en-IN')} <X className="w-3 h-3 text-neutral-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity('All');
                        setSelectedBhk('All');
                        setSelectedFurnishing('All');
                        setSearchQuery('');
                        setMaxBudget(250000);
                      }}
                      className="text-[11px] font-semibold text-amber-800 hover:underline ml-2 cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {loading && properties.length === 0 ? (
                <div className="py-20 text-center text-xs text-neutral-500">
                  <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading verified properties...</span>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="space-y-8">
                  <div className="py-10 text-center bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
                    <Building className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-neutral-900">
                      No exact matches for your selected criteria
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                      {selectedCity !== 'All' ? `No listings in ${selectedCity} match the current price/BHK filter. ` : ''}
                      Click below to reset filters and explore all verified direct-owner listings.
                    </p>
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity('All');
                          setSelectedBhk('All');
                          setSelectedFurnishing('All');
                          setSearchQuery('');
                          setMaxBudget(250000);
                        }}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Show All Verified Properties ({properties.length} Homes)</span>
                      </button>
                    </div>
                  </div>

                  {/* Fallback Display of Recommended Homes so properties are ALWAYS visible */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>All Verified Properties ({properties.length} Available)</span>
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Browse our full catalog across Bengaluru, Mumbai, Gurugram, Hyderabad, and Pune
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        100% Zero Brokerage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.map((prop) => (
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
                  </div>
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
