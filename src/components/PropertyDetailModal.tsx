import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  Home,
  Info,
  Send,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Property, ChatMessage, UserProfile } from '../types/index.js';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  isUnlocked: boolean;
  currentUser: UserProfile | null;
  groqApiKey: string;
  groqModel: string;
  onScheduleVisit: (property: Property) => void;
  onOpenAuth: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  isUnlocked,
  currentUser,
  groqApiKey,
  groqModel,
  onScheduleVisit,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string>('Groq LLaMA 3.3');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opening with a property
  useEffect(() => {
    if (isOpen && property) {
      const initialGreeting: ChatMessage = {
        id: 'msg-init',
        sender: 'agent',
        text: isUnlocked
          ? `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! Your ₹199 Visit Pass is active for ${property.title}.\n\n• Verified Owner: ${property.ownerName}\n• Direct Phone / WhatsApp: ${property.confidentialOwnerPhone}\n• Exact Flat Address: ${property.confidentialExactAddress}\n\nAsk me anything about society guidelines, parking bay, or tap Call/WhatsApp below to reach the owner!`
          : `Hello! I am your AI Property Concierge mediating directly on behalf of ${property.ownerName} for ${property.title} in ${property.locality}.\n\n• Monthly Rent: ₹${property.monthlyRent.toLocaleString('en-IN')}\n• Security Deposit: ₹${property.securityDeposit.toLocaleString('en-IN')}\n• Brokerage: ₹0 Free\n• Tenant Preference: ${property.houseRules.tenantPreference}\n\nTo safeguard our owner from unsolicited commercial broker spam, their personal mobile number and exact door address remain confidential until you schedule an in-person walkthrough with a ₹199 Visit Pass. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestVisitPass: !isUnlocked,
        unlockedDetails: isUnlocked
          ? {
              ownerName: property.ownerName,
              ownerPhone: property.confidentialOwnerPhone,
              exactAddress: property.confidentialExactAddress
            }
          : undefined
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, property?.id, isUnlocked]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  if (!isOpen || !property) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const formattedForApi = updatedHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          messages: formattedForApi,
          groqApiKey: groqApiKey || undefined,
          groqModel: groqModel || 'llama-3.3-70b-versatile',
          userId: currentUser?.id
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get response from AI agent');
      }

      const data = await res.json();
      setActiveEngine(data.engine || 'Groq LLaMA 3.3');

      const agentReplyMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestVisitPass: data.suggestVisitPass || (!isUnlocked && text.toLowerCase().includes('visit'))
      };

      setMessages(prev => [...prev, agentReplyMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `For ${property.title}, monthly rent is ₹${property.monthlyRent.toLocaleString('en-IN')}, deposit is ₹${property.securityDeposit.toLocaleString('en-IN')}, and tenant preference is ${property.houseRules.tenantPreference}. You can unlock direct owner contact anytime with a ₹199 Visit Pass!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestVisitPass: !isUnlocked
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Is the rent or deposit negotiable?',
    'Are bachelors / working professionals allowed?',
    'Are pets allowed in this society?',
    'Give me the owner phone number & exact address',
    'I want to schedule an in-person visit'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-5xl w-full h-[92vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0">
              ZH
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">
                {property.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-neutral-300">
                <span>{property.locality}, {property.city}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  ₹{property.monthlyRent.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher Tabs (For mobile & split toggle) */}
            <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'details' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Property Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'chat' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Concierge</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Body (Split layout on desktop: Left specs, Right AI Chat) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-neutral-50/50">
          {/* LEFT COLUMN: PROPERTY DETAILS (Hidden on mobile if activeTab === 'chat') */}
          <div
            className={`w-full md:w-7/12 overflow-y-auto p-5 space-y-5 bg-white border-r border-neutral-200 ${
              activeTab === 'chat' ? 'hidden md:block' : 'block'
            }`}
          >
            {/* Photo Gallery Banner */}
            <div className="relative aspect-16/9 w-full bg-neutral-100 rounded-xl overflow-hidden shadow-xs">
              <img
                src={property.images[0]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 text-neutral-900 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Direct Owner Listing</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <div className="bg-neutral-950/85 px-3 py-1.5 rounded-lg font-bold tabular-nums">
                  ₹{property.monthlyRent.toLocaleString('en-IN')}/mo
                </div>
                <div className="bg-neutral-950/85 px-2.5 py-1.5 rounded-lg text-[11px]">
                  Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Quick Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-600 pb-3 border-b border-neutral-100">
              <span className="font-bold text-neutral-900">{property.propertyType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-neutral-800 tabular-nums">{property.carpetAreaSqFt} sq.ft</span>
              <span aria-hidden="true">·</span>
              <span>{property.floor}</span>
              <span aria-hidden="true">·</span>
              <span>{property.furnishing}</span>
              <span aria-hidden="true">·</span>
              <span>{property.bathrooms} Baths</span>
              <span aria-hidden="true">·</span>
              <span>{property.balconies} Balconies</span>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Monthly Rent</span>
                <span className="font-bold text-neutral-900 tabular-nums">₹{property.monthlyRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Security Deposit</span>
                <span className="font-bold text-neutral-900 tabular-nums">₹{property.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Maintenance</span>
                <span className="font-bold text-neutral-900 tabular-nums">₹{property.maintenanceCharges.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block">Brokerage Fee</span>
                <span className="font-bold text-emerald-700">₹0 Free</span>
              </div>
            </div>

            {/* Privacy Shield & Owner Details Box */}
            <div className="p-4 rounded-xl border bg-neutral-50 border-neutral-200">
              {isUnlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>Owner Contact & Address Unlocked</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Visit Pass Active</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Owner Name:</span>
                      <strong className="text-neutral-900">{property.ownerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Phone Number:</span>
                      <strong className="text-neutral-900 font-mono">{property.confidentialOwnerPhone}</strong>
                    </div>
                    <div className="pt-1 border-t border-neutral-100">
                      <span className="text-neutral-500 block mb-0.5">Exact Flat Address:</span>
                      <span className="font-medium text-neutral-800">{property.confidentialExactAddress}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${property.confidentialOwnerPhone}`}
                      className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Owner</span>
                    </a>
                    <a
                      href={`https://wa.me/${property.confidentialOwnerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>WhatsApp Owner</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        Owner Privacy Shield Active
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Our AI Concierge answers all questions about rent, deposit, and society rules. When you decide to inspect the property in person, unlock the owner's direct mobile number and exact GPS location for just ₹199.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onScheduleVisit(property)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Schedule Walkthrough & Unlock Owner (₹199)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1.5">
                About this Property
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* House Rules */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                House Terms & Owner Conditions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Tenant Preference</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.tenantPreference}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Diet / Cooking</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.foodPreference}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Pet Policy</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.petPolicy}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Lock-in Period</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.lockInPeriod}</span>
                </div>
              </div>
            </div>

            {/* Society Amenities */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                Society Amenities
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-neutral-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE AI CONCIERGE CHAT */}
          <div
            className={`w-full md:w-5/12 flex flex-col bg-neutral-50 ${
              activeTab === 'details' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* AI Agent Sub-header */}
            <div className="p-3 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <Cpu className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                    AI Concierge Mediator
                  </h4>
                  <span className="text-[10px] text-neutral-500">
                    {activeEngine}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                24/7 Verified
              </span>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neutral-900 text-white rounded-tr-xs'
                        : 'bg-white border border-neutral-200 text-neutral-800 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Unlocked Details inside chat */}
                    {msg.unlockedDetails && (
                      <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Owner Unlocked: {msg.unlockedDetails.ownerName}</span>
                        </div>
                        <div>Phone: <strong>{msg.unlockedDetails.ownerPhone}</strong></div>
                        <div className="text-[11px] text-neutral-600">{msg.unlockedDetails.exactAddress}</div>
                      </div>
                    )}

                    {/* Suggest Visit Pass */}
                    {msg.suggestVisitPass && !isUnlocked && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => onScheduleVisit(property)}
                          className="w-full py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span>Schedule Visit & Unlock Details (₹199)</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-400 mt-0.5 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-white border border-neutral-200 rounded-xl w-20 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-1.5 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2 py-1 text-[10px] text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 border border-neutral-200/60 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about rent, deposit, or schedule visit..."
                  className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
