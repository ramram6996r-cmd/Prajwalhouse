export interface Property {
  id: string;
  title: string;
  tagline: string;
  description: string;
  propertyType: '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | 'Villa' | 'Studio';
  bhk: number;
  bathrooms: number;
  balconies: number;
  carpetAreaSqFt: number;
  furnishing: 'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished';
  floor: string;
  totalFloors: number;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  city: string;
  locality: string;
  confidentialExactAddress: string;
  googleMapsCoordinates?: { lat: number; lng: number };
  ownerId: string;
  ownerName: string;
  confidentialOwnerPhone: string;
  confidentialOwnerEmail: string;
  images: string[];
  amenities: string[];
  houseRules: {
    tenantPreference: string;
    foodPreference: string;
    petPolicy: string;
    lockInPeriod: string;
    noticePeriod: string;
  };
  availableFrom: string;
  verified: boolean;
  createdAt: string;
}

export interface VisitBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocality: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  visitDate: string;
  visitTimeSlot: string;
  paymentStatus: 'paid' | 'pending';
  paymentAmount: number;
  paymentTransactionId: string;
  paidAt: string;
  unlockedAddress: string;
  unlockedOwnerPhone: string;
  unlockedOwnerName: string;
  unlockedOwnerEmail: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  ownerNotificationSent?: boolean;
  tenantNotificationSent?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'tenant' | 'owner';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  suggestVisitPass?: boolean;
  unlockedDetails?: {
    ownerName: string;
    ownerPhone: string;
    exactAddress: string;
  };
}

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientRole: 'tenant' | 'owner';
  type: 'visit_booked_owner' | 'visit_confirmed_tenant';
  title: string;
  message: string;
  propertyTitle: string;
  date: string;
  timeSlot: string;
  tenantName: string;
  tenantPhone: string;
  ownerName: string;
  ownerPhone: string;
  exactAddress: string;
  whatsappUrl: string;
  whatsappText: string;
  createdAt: string;
  read: boolean;
}
