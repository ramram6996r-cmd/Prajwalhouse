import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initialProperties } from './server/data/seedData.js';
import { Property, VisitBooking } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent storage directories
const DATA_DIR = path.join(__dirname, 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Initialize data if not exists
if (!fs.existsSync(PROPERTIES_FILE)) {
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(initialProperties, null, 2), 'utf-8');
}

if (!fs.existsSync(VISITS_FILE)) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function getNotifications(): any[] {
  try {
    const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading notifications:', err);
    return [];
  }
}

function saveNotifications(notifications: any[]) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
}

function getProperties(): Property[] {
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading properties:', err);
    return initialProperties;
  }
}

function saveProperties(properties: Property[]) {
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
}

function getVisits(): VisitBooking[] {
  try {
    const raw = fs.readFileSync(VISITS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading visits:', err);
    return [];
  }
}

function saveVisits(visits: VisitBooking[]) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2), 'utf-8');
}

function isPropertyUnlockedForUser(propertyId: string, userId?: string): boolean {
  if (!userId) return false;
  const properties = getProperties();
  const prop = properties.find(p => p.id === propertyId);
  if (prop && prop.ownerId === userId) return true;

  const visits = getVisits();
  return visits.some(
    v => v.propertyId === propertyId && v.tenantId === userId && v.paymentStatus === 'paid'
  );
}

function maskProperty(property: Property, isUnlocked: boolean): Partial<Property> {
  if (isUnlocked) {
    return property;
  }
  return {
    ...property,
    confidentialExactAddress: `[Locked] Near ${property.locality} (Unlocked upon ₹199 Visit Pass)`,
    confidentialOwnerPhone: `+91 98*** ***** [Locked until Visit Booking]`,
    confidentialOwnerEmail: `owner.***@zenithhomes.internal`
  };
}

// ---------------- REST API ----------------

// Get status of AI keys
app.get('/api/config/ai-status', (_req: Request, res: Response) => {
  res.json({
    hasServerGroqKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0),
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    supportedGroqModels: [
      { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B Versatile (Fast & Smart)' },
      { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant (Ultra Fast)' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k Context)' }
    ]
  });
});

// List all properties
app.get('/api/properties', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const properties = getProperties();
  const sanitized = properties.map(p => maskProperty(p, isPropertyUnlockedForUser(p.id, userId)));
  res.json(sanitized);
});

// Get single property
app.get('/api/properties/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.query.userId as string | undefined;
  const properties = getProperties();
  const property = properties.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const isUnlocked = isPropertyUnlockedForUser(id, userId);
  return res.json({
    property: maskProperty(property, isUnlocked),
    isUnlocked
  });
});

// House Owner: create new property listing
app.post('/api/properties', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.title || !body.monthlyRent || !body.confidentialExactAddress || !body.confidentialOwnerPhone) {
    return res.status(400).json({ error: 'Missing required listing information' });
  }

  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    title: body.title,
    tagline: body.tagline || 'Direct from Owner · Verified Listing',
    description: body.description || '',
    propertyType: body.propertyType || '2 BHK',
    bhk: Number(body.bhk) || 2,
    bathrooms: Number(body.bathrooms) || 2,
    balconies: Number(body.balconies) || 1,
    carpetAreaSqFt: Number(body.carpetAreaSqFt) || 1000,
    furnishing: body.furnishing || 'Semi-Furnished',
    floor: body.floor || '1st floor',
    totalFloors: Number(body.totalFloors) || 4,
    monthlyRent: Number(body.monthlyRent),
    securityDeposit: Number(body.securityDeposit) || Number(body.monthlyRent) * 3,
    maintenanceCharges: Number(body.maintenanceCharges) || 0,
    city: body.city || 'Bengaluru',
    locality: body.locality || 'City Center',
    confidentialExactAddress: body.confidentialExactAddress,
    googleMapsCoordinates: body.googleMapsCoordinates || { lat: 12.9716, lng: 77.5946 },
    ownerId: body.ownerId || 'owner-custom',
    ownerName: body.ownerName || 'Verified Property Owner',
    confidentialOwnerPhone: body.confidentialOwnerPhone,
    confidentialOwnerEmail: body.confidentialOwnerEmail || 'owner@example.com',
    images: body.images && body.images.length > 0 ? body.images : [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: body.amenities || ['Covered Car Parking', '24/7 Security'],
    houseRules: body.houseRules || {
      tenantPreference: 'Any',
      foodPreference: 'Any',
      petPolicy: 'Discuss with Owner',
      lockInPeriod: '6 Months',
      noticePeriod: '1 Month'
    },
    availableFrom: body.availableFrom || 'Immediate',
    verified: true,
    createdAt: new Date().toISOString()
  };

  const properties = getProperties();
  properties.unshift(newProperty);
  saveProperties(properties);

  res.status(201).json({ success: true, property: newProperty });
});

// Tenant: Unlock ₹199 Visit Pass & Reveal Owner details
app.post('/api/visits/unlock', (req: Request, res: Response) => {
  const {
    propertyId,
    userId,
    userName,
    userPhone,
    userEmail,
    visitDate,
    visitTimeSlot,
    paymentMethod = 'UPI'
  } = req.body;

  if (!propertyId || !userId || !userName || !visitDate || !visitTimeSlot) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  const properties = getProperties();
  const property = properties.find(p => p.id === propertyId);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const newBooking: VisitBooking = {
    id: `visit-${Date.now()}`,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyLocality: `${property.locality}, ${property.city}`,
    tenantId: userId,
    tenantName: userName,
    tenantPhone: userPhone || '+91 98000 00000',
    tenantEmail: userEmail || 'tenant@example.com',
    visitDate,
    visitTimeSlot,
    paymentStatus: 'paid',
    paymentAmount: 199,
    paymentTransactionId: `TXN-ZH-${Math.floor(10000000 + Math.random() * 90000000)}`,
    paidAt: new Date().toISOString(),
    unlockedAddress: property.confidentialExactAddress,
    unlockedOwnerPhone: property.confidentialOwnerPhone,
    unlockedOwnerName: property.ownerName,
    unlockedOwnerEmail: property.confidentialOwnerEmail,
    status: 'confirmed'
  };

  const visits = getVisits();
  visits.unshift(newBooking);
  saveVisits(visits);

  // Generate dual WhatsApp notification messages
  const ownerPhoneClean = property.confidentialOwnerPhone.replace(/[^0-9]/g, '');
  const tenantPhoneClean = (userPhone || '').replace(/[^0-9]/g, '');

  const ownerWhatsappText = `🔔 *ZenithHomes Alert: New Walkthrough Booked!*\n\nHello ${property.ownerName}, tenant *${userName}* (Mobile: ${userPhone}) has booked an official walkthrough for your property *${property.title}* on *${visitDate}* (${visitTimeSlot}).\n\n• Status: ₹199 Token Paid & Verified\n• Tenant Contact: ${userPhone}\n\nPlease keep the flat accessible at the scheduled slot!`;
  const ownerWhatsappUrl = `https://wa.me/${ownerPhoneClean}?text=${encodeURIComponent(ownerWhatsappText)}`;

  const tenantWhatsappText = `🎉 *ZenithHomes Visit Confirmation*\n\nHi ${userName}, your walkthrough for *${property.title}* is confirmed!\n\n• Scheduled Date: *${visitDate}* (${visitTimeSlot})\n• Verified Owner: *${property.ownerName}*\n• Owner Mobile: *${property.confidentialOwnerPhone}*\n• Exact Flat Address: *${property.confidentialExactAddress}*\n• GPS Navigation: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.confidentialExactAddress)}`;
  const tenantWhatsappUrl = `https://wa.me/${tenantPhoneClean}?text=${encodeURIComponent(tenantWhatsappText)}`;

  const notifications = getNotifications();

  // Notification for Owner
  const ownerNotification = {
    id: `notif-owner-${Date.now()}`,
    recipientId: property.ownerId,
    recipientRole: 'owner',
    type: 'visit_booked_owner',
    title: `🔔 New Visit Request from ${userName}`,
    message: `Tenant ${userName} (${userPhone}) has booked a visit for "${property.title}" on ${visitDate} (${visitTimeSlot}). ₹199 token verified.`,
    propertyTitle: property.title,
    date: visitDate,
    timeSlot: visitTimeSlot,
    tenantName: userName,
    tenantPhone: userPhone,
    ownerName: property.ownerName,
    ownerPhone: property.confidentialOwnerPhone,
    exactAddress: property.confidentialExactAddress,
    whatsappUrl: ownerWhatsappUrl,
    whatsappText: ownerWhatsappText,
    createdAt: new Date().toISOString(),
    read: false
  };

  // Notification for Tenant
  const tenantNotification = {
    id: `notif-tenant-${Date.now()}`,
    recipientId: userId,
    recipientRole: 'tenant',
    type: 'visit_confirmed_tenant',
    title: `🎉 Visit Pass Confirmed for ${property.title}`,
    message: `Your visit with owner ${property.ownerName} is scheduled on ${visitDate} (${visitTimeSlot}). Owner phone and exact address unlocked.`,
    propertyTitle: property.title,
    date: visitDate,
    timeSlot: visitTimeSlot,
    tenantName: userName,
    tenantPhone: userPhone,
    ownerName: property.ownerName,
    ownerPhone: property.confidentialOwnerPhone,
    exactAddress: property.confidentialExactAddress,
    whatsappUrl: tenantWhatsappUrl,
    whatsappText: tenantWhatsappText,
    createdAt: new Date().toISOString(),
    read: false
  };

  notifications.unshift(ownerNotification);
  notifications.unshift(tenantNotification);
  saveNotifications(notifications);

  res.json({
    success: true,
    booking: newBooking,
    unlockedDetails: {
      ownerName: property.ownerName,
      ownerPhone: property.confidentialOwnerPhone,
      ownerEmail: property.confidentialOwnerEmail,
      exactAddress: property.confidentialExactAddress
    },
    notifications: {
      owner: ownerNotification,
      tenant: tenantNotification
    }
  });
});

// Notifications endpoint
app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const notifications = getNotifications().filter(n => n.recipientId === userId);
  res.json(notifications);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notifications = getNotifications();
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveNotifications(notifications);
  }
  res.json({ success: true });
});

// Tenant: Get my booked visits
app.get('/api/visits/user/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const visits = getVisits().filter(v => v.tenantId === userId);
  res.json(visits);
});

// Owner: Get properties & visits received
app.get('/api/owner/:ownerId/dashboard', (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const properties = getProperties().filter(p => p.ownerId === ownerId);
  const propertyIds = new Set(properties.map(p => p.id));
  const visits = getVisits().filter(v => propertyIds.has(v.propertyId));

  res.json({
    properties,
    visits,
    totalVisits: visits.length,
    totalRevenueEstimated: visits.length * 199
  });
});

// ---------------- AI BROKER CONCIERGE CHAT ROUTE ----------------
// Supports Groq API (user API key or env GROQ_API_KEY) with fallback to Gemini or Built-in Domain Engine

app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const {
      propertyId,
      messages = [],
      groqApiKey,
      groqModel = 'llama-3.3-70b-versatile',
      userId
    } = req.body;

    const properties = getProperties();
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const isUnlocked = isPropertyUnlockedForUser(property.id, userId);
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // System prompt enforcing the strict middleman privacy protocol and human-like real estate fluency
    const systemPrompt = `You are "Zenith Concierge", the official AI Property Broker & Confidential Mediator for ZenithHomes.
You act on behalf of the Property Owner (${property.ownerName}) and talk directly with prospective tenants.
Your goal is to be helpful, transparent, highly knowledgeable, and welcoming like an elite real-estate advisor.

PROPERTY PROFILE:
- Title: ${property.title}
- Configuration: ${property.propertyType} (${property.bhk} BHK, ${property.bathrooms} Bathrooms, ${property.balconies} Balconies)
- Carpet Area: ${property.carpetAreaSqFt} sq.ft
- Furnishing: ${property.furnishing}
- Floor: ${property.floor} of ${property.totalFloors} floors
- Locality / City: ${property.locality}, ${property.city}
- Monthly Rent: ₹${property.monthlyRent.toLocaleString('en-IN')}/month
- Security Deposit: ₹${property.securityDeposit.toLocaleString('en-IN')} (Refundable at move-out)
- Society Maintenance: ₹${property.maintenanceCharges.toLocaleString('en-IN')}/month
- Available From: ${property.availableFrom}
- Key Amenities: ${property.amenities.join(', ')}
- House Rules & Owner Expectations:
  * Tenant Preference: ${property.houseRules.tenantPreference}
  * Food Preference: ${property.houseRules.foodPreference}
  * Pet Policy: ${property.houseRules.petPolicy}
  * Lock-in Period: ${property.houseRules.lockInPeriod}
  * Notice Period: ${property.houseRules.noticePeriod}
- Owner Name: ${property.ownerName}

CURRENT VISIT ACCESS STATUS: ${isUnlocked ? 'VISIT UNLOCKED (Tenant purchased ₹199 Visit Pass)' : 'LOCKED (Visit Pass Not Purchased Yet)'}

CONFIDENTIAL DETAILS (STRICT PRIVACY SHIELD):
- Exact Door / Building Address: ${property.confidentialExactAddress}
- Owner Mobile Phone: ${property.confidentialOwnerPhone}
- Owner Email: ${property.confidentialOwnerEmail}

CRITICAL RULES:
${
  isUnlocked
    ? `The tenant HAS verified and paid the ₹199 Visit Pass. You CAN provide the exact address: "${property.confidentialExactAddress}" and the owner phone number: "${property.confidentialOwnerPhone}" cheerfully and help them plan their visit time!`
    : `The tenant has NOT purchased the ₹199 Visit Pass yet.
1. NEVER reveal the exact door/flat number, building name, owner mobile number, or owner email.
2. If asked for the owner's phone, email, or exact flat address:
   Politely and confidently explain: "To protect our property owners from telemarketing spam and 20+ unsolicited broker calls, ZenithHomes keeps direct contact numbers and exact street addresses confidential until you schedule an official walkthrough with our ₹199 Visit Pass. Once unlocked, you receive the verified owner's direct mobile, WhatsApp, and exact Google Maps GPS pin immediately!"
3. For all other queries (rent, deposit, lock-in, pet rules, bachelor policies, sunlight, car parking, move-in dates, society clubhouse), answer in rich, transparent detail.
4. If the tenant expresses interest in visiting or inspecting the flat, guide them smoothly to book their slot and unlock owner details using the ₹199 Visit Pass.`
}

Style Guidelines:
- Speak in warm, professional, authentic Indian real-estate terminology (e.g., mention gated society, power backup, Cauvery/borewell water, refundable deposit).
- Keep answers concise and engaging (2 to 4 sentences). Avoid repetitive robotic phrases.`;

    const activeGroqKey = (groqApiKey && groqApiKey.trim()) || process.env.GROQ_API_KEY;

    // Check if Groq API is callable
    if (activeGroqKey && activeGroqKey.trim().length > 0) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeGroqKey.trim()}`
          },
          body: JSON.stringify({
            model: groqModel || 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
              }))
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return res.json({
              reply: replyText,
              engine: `Groq (${groqModel})`,
              suggestVisitPass: !isUnlocked && containsVisitIntent(lastUserMessage)
            });
          }
        } else {
          const errBody = await groqResponse.text();
          console.warn('Groq API returned error status:', groqResponse.status, errBody);
        }
      } catch (groqErr) {
        console.warn('Error calling Groq API, attempting fallback:', groqErr);
      }
    }

    // Attempt Gemini Fallback if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser Question: ${lastUserMessage}`
        });

        if (response.text) {
          return res.json({
            reply: response.text,
            engine: 'Gemini 2.5 Flash',
            suggestVisitPass: !isUnlocked && containsVisitIntent(lastUserMessage)
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini fallback error, using domain concierge engine:', geminiErr);
      }
    }

    // Reliable Domain Real-Estate Concierge Fallback Engine
    const smartReply = generateConciergeResponse(lastUserMessage, property, isUnlocked);
    return res.json({
      reply: smartReply,
      engine: activeGroqKey ? 'Groq (Simulated Proxy)' : 'Zenith Concierge Engine',
      suggestVisitPass: !isUnlocked && containsVisitIntent(lastUserMessage)
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ error: 'Internal server error in AI concierge' });
  }
});

function containsVisitIntent(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('visit') ||
    q.includes('see the flat') ||
    q.includes('inspect') ||
    q.includes('address') ||
    q.includes('phone') ||
    q.includes('number') ||
    q.includes('contact') ||
    q.includes('call owner') ||
    q.includes('location') ||
    q.includes('when can i') ||
    q.includes('available to see')
  );
}

function generateConciergeResponse(query: string, prop: Property, isUnlocked: boolean): string {
  const q = query.toLowerCase();

  // If asking for owner contact or exact address
  if (
    q.includes('owner phone') ||
    q.includes('phone number') ||
    q.includes('owner number') ||
    q.includes('contact number') ||
    q.includes('call owner') ||
    q.includes('mobile') ||
    q.includes('exact address') ||
    q.includes('flat number') ||
    q.includes('door number') ||
    q.includes('full address') ||
    q.includes('where is the flat') ||
    q.includes('where is the building')
  ) {
    if (isUnlocked) {
      return `Here are the verified owner and location details for your upcoming visit:\n\n• Owner: ${prop.ownerName}\n• Direct Phone / WhatsApp: ${prop.confidentialOwnerPhone}\n• Exact Address: ${prop.confidentialExactAddress}\n\nYou can reach out directly via call or WhatsApp to confirm your arrival!`;
    }
    return `To protect ${prop.ownerName} from unsolicited commercial brokers and marketing spam, ZenithHomes keeps direct owner contact numbers and the exact GPS coordinates shielded. You can unlock the verified owner's direct mobile, instant WhatsApp chat, and exact Google Maps pin immediately by booking an in-person walkthrough with our ₹199 Visit Pass!`;
  }

  // If asking about negotiation or discount
  if (q.includes('negotiat') || q.includes('discount') || q.includes('less rent') || q.includes('cheaper') || q.includes('budget')) {
    return `The monthly rent is set at ₹${prop.monthlyRent.toLocaleString('en-IN')}. ${prop.ownerName} is generally open to a slight leeway of ₹1,000–₹1,500/month for long-term lease agreements (11–22 months) and tenants with ready move-in schedules. Would you like to schedule an in-person visit to discuss terms directly?`;
  }

  // If asking about deposit refund & lock-in
  if (q.includes('deposit') || q.includes('advance') || q.includes('lock in') || q.includes('lock-in') || q.includes('refund')) {
    return `The security deposit is ₹${prop.securityDeposit.toLocaleString('en-IN')}, fully refundable at lease completion subject to standard utility bills clearance. The society lock-in period is ${prop.houseRules.lockInPeriod} with a ${prop.houseRules.noticePeriod} prior notice period.`;
  }

  // If asking about visit scheduling
  if (q.includes('visit') || q.includes('see') || q.includes('when can i') || q.includes('timing') || q.includes('slot') || q.includes('saturday') || q.includes('sunday')) {
    if (isUnlocked) {
      return `Your visit pass is active for ${prop.title}! You can visit during daytime hours (10:00 AM – 7:00 PM). Please call the owner at ${prop.confidentialOwnerPhone} 30 minutes prior to arrival.`;
    }
    return `Walkthroughs for ${prop.title} are open all 7 days (10:00 AM – 7:00 PM). You can schedule an official slot right now by clicking "Schedule Visit & Unlock Details (₹199)". You'll instantly receive ${prop.ownerName}'s direct phone number, WhatsApp link, and exact GPS navigation!`;
  }

  // If asking about rent, maintenance, or pricing
  if (q.includes('rent') || q.includes('price') || q.includes('cost') || q.includes('brokerage') || q.includes('maintenance')) {
    return `Here is the transparent pricing breakdown for ${prop.title}:\n• Monthly Rent: ₹${prop.monthlyRent.toLocaleString('en-IN')}\n• Society Maintenance: ₹${prop.maintenanceCharges.toLocaleString('en-IN')}/month\n• Security Deposit: ₹${prop.securityDeposit.toLocaleString('en-IN')}\n• Brokerage Commission: ₹0 (Zero brokerage guaranteed).`;
  }

  // If asking about pets
  if (q.includes('pet') || q.includes('dog') || q.includes('cat')) {
    return `Regarding pets: ${prop.houseRules.petPolicy}. The residential community features wide walking corridors and pet-friendly open spaces.`;
  }

  // If asking about bachelor / family restrictions
  if (q.includes('bachelor') || q.includes('family') || q.includes('who can stay') || q.includes('single') || q.includes('students') || q.includes('professionals')) {
    return `The owner's preference for this home is: "${prop.houseRules.tenantPreference}". Working professionals with verifiable corporate employment or startup founders are welcome!`;
  }

  // If asking about food / cooking
  if (q.includes('food') || q.includes('veg') || q.includes('non veg') || q.includes('cooking') || q.includes('meat')) {
    return `Food policy: ${prop.houseRules.foodPreference}. There are no strict culinary constraints for tenants.`;
  }

  // If asking about furnishing, parking, or amenities
  if (q.includes('furnish') || q.includes('amenit') || q.includes('parking') || q.includes('gym') || q.includes('lift') || q.includes('power') || q.includes('water')) {
    return `This property is ${prop.furnishing} (${prop.carpetAreaSqFt} sq.ft on ${prop.floor}). Verified amenities include: ${prop.amenities.join(', ')}. Covered car parking and 24/7 power backup are available.`;
  }

  // Default introductory answer
  return `Hello! I am your Zenith Concierge for ${prop.title} in ${prop.locality}. I have verified details on this home, including financials (₹${prop.monthlyRent.toLocaleString('en-IN')}/mo rent, ₹${prop.securityDeposit.toLocaleString('en-IN')} deposit), ${prop.houseRules.lockInPeriod} lock-in, and amenities. What would you like to know, or would you like to book an in-person visit with our ₹199 Visit Pass?`;
}

// ---------------- DEVELOPMENT / PRODUCTION SERVING ----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`ZenithHomes AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
