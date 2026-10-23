import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  Calendar,
  Phone,
  MapPin,
  Cpu,
  Clock,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Info,
  CheckCircle,
  Home
} from 'lucide-react';
import { Property, ChatMessage, UserProfile } from '../types/index.js';

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  isUnlocked: boolean;
  currentUser: UserProfile | null;
  groqApiKey: string;
  groqModel: string;
  onOpenVisitCheckout: (property: Property) => void;
  onOpenAuth: () => void;
}

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({
  isOpen,
  onClose,
  property,
  isUnlocked,
  currentUser,
  groqApiKey,
  groqModel,
  onOpenVisitCheckout,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'details'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string>('Groq LLaMA 3.3');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when opening with a property
  useEffect(() => {
    if (isOpen && property) {
      setActiveTab('chat');
      const initialGreeting: ChatMessage = {
        id: 'msg-1',
        sender: 'agent',
        text: isUnlocked
          ? `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! Your ₹199 Visit Pass is active for ${property.title}.\n\n• Verified Owner: ${property.ownerName}\n• Direct Phone / WhatsApp: ${property.confidentialOwnerPhone}\n• Exact Flat Address: ${property.confidentialExactAddress}\n\nI can answer any additional society or neighborhood questions, or you can call the owner directly!`
          : `Hello! I am your AI Property Concierge representing ${property.ownerName} for ${property.title} in ${property.locality}.\n\nI have complete verified details on this home: rent is ₹${property.monthlyRent.toLocaleString('en-IN')}/mo with zero brokerage, deposit is ₹${property.securityDeposit.toLocaleString('en-IN')}, and tenant preference is "${property.houseRules.tenantPreference}".\n\nTo safeguard our owner from unsolicited broker spam, their personal phone number and exact flat address remain confidential until you schedule an official walkthrough via a ₹199 Visit Pass. How can I help you?`,
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
        text: `For ${property.title}, monthly rent is ₹${property.monthlyRent.toLocaleString('en-IN')}, deposit is ₹${property.securityDeposit.toLocaleString('en-IN')}, and tenant preference is ${property.houseRules.tenantPreference}. To visit the flat in person and unlock the owner's phone number, please book our ₹199 Visit Pass!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestVisitPass: !isUnlocked
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const dynamicPrompts = [
    'Is the rent or deposit negotiable?',
    'Are bachelors / working professionals allowed?',
    'Are pets allowed in this society?',
    'Can I have the owner phone number & exact address?',
    'I want to schedule an in-person visit'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full h-[90vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Zenith AI Concierge
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span>{activeEngine}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-300 truncate max-w-sm">
                Mediating for: {property.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 text-xs">
                <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Visit Pass Active</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Owner Shield Active</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs: [Chat with AI] & [Property Overview] */}
        <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Concierge Dialogue
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Property Details & Specs
            </button>
          </div>

          {!isUnlocked && (
            <button
              onClick={() => onOpenVisitCheckout(property)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <span>Unlock Visit Pass (₹199)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* TAB 1: CHAT VIEW */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neutral-900 text-white rounded-tr-xs'
                        : 'bg-white border border-neutral-200 text-neutral-800 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* If details are unlocked, render clear contact card */}
                    {msg.unlockedDetails && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <Unlock className="w-4 h-4 text-emerald-600" />
                          <span>Verified Owner Details:</span>
                        </div>
                        <div className="text-neutral-800 text-xs">
                          <strong>Owner:</strong> {msg.unlockedDetails.ownerName}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${msg.unlockedDetails.ownerPhone}`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {msg.unlockedDetails.ownerPhone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${msg.unlockedDetails.ownerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <div className="text-neutral-700 text-xs pt-1 border-t border-emerald-200/60">
                          <strong>Exact Address:</strong> {msg.unlockedDetails.exactAddress}
                        </div>
                      </div>
                    )}

                    {/* If visit pass is suggested and not unlocked */}
                    {msg.suggestVisitPass && !isUnlocked && (
                      <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ready to inspect the property in person?</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mb-2.5">
                          Book an official walkthrough slot. We immediately reveal the owner's direct mobile number, WhatsApp link, and exact GPS location!
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenVisitCheckout(property)}
                          className="w-full py-2 px-3 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Schedule Visit & Unlock Details (₹199)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-2xl w-28 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {dynamicPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 text-[11px] text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 border border-neutral-200/60 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
              {!currentUser ? (
                <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-neutral-700">
                    Please sign in to chat with the AI Concierge and save your visit history.
                  </span>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3 py-1 bg-neutral-900 text-white rounded-md font-semibold text-xs hover:bg-neutral-800"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
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
                    placeholder="Ask about rent, deposit, rules, or schedule a visit..."
                    className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTY OVERVIEW */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-neutral-100">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-neutral-950/80 text-white px-3 py-1 rounded-md text-xs font-bold tabular-nums">
                ₹{property.monthlyRent.toLocaleString('en-IN')}/mo · Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 pb-3 border-b border-neutral-100">
              <span className="font-semibold text-neutral-900">{property.propertyType}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{property.carpetAreaSqFt} sq.ft</span>
              <span aria-hidden="true">·</span>
              <span>{property.floor}</span>
              <span aria-hidden="true">·</span>
              <span>{property.furnishing}</span>
              <span aria-hidden="true">·</span>
              <span>{property.locality}, {property.city}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 mb-1">About this Home</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{property.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 mb-2">House Rules & Conditions</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-neutral-500 block text-[11px]">Tenant Preference</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.tenantPreference}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-neutral-500 block text-[11px]">Diet / Food</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.foodPreference}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-neutral-500 block text-[11px]">Pet Policy</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.petPolicy}</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200/60">
                  <span className="text-neutral-500 block text-[11px]">Lease Lock-in</span>
                  <span className="font-medium text-neutral-800">{property.houseRules.lockInPeriod}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 mb-2">Amenities</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {property.amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-neutral-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('chat')}
                className="px-4 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Return to AI Chat
              </button>
              {!isUnlocked && (
                <button
                  onClick={() => onOpenVisitCheckout(property)}
                  className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Schedule Visit (₹199)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
