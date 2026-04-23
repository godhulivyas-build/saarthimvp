export type SaarthiUserRole = 'farmer' | 'buyer' | 'logistics_partner' | 'cold_storage_owner';

export enum UserRole {
  FARMER = 'Farmer (Kisan)',
  BUYER = 'Buyer (Vyapari)',
  /** @deprecated use LOGISTICS_PARTNER */
  TRANSPORTER = 'Transporter',
  LOGISTICS_PARTNER = 'Logistics Partner',
  COLD_STORAGE_OWNER = 'Cold Storage Owner',
}

export enum AppScreen {
  LANDING = 'LANDING',
  PREFERENCES = 'PREFERENCES',
  DASHBOARD = 'DASHBOARD'
}

export type SaarthiScreen = 'landing' | 'dashboard';

export type FarmerDashboardView =
  | 'home'
  | 'book_vehicle'
  | 'my_requests'
  | 'weather'
  | 'prices'
  | 'alerts'
  | 'nearby_buyers'
  | 'buyer_requests'
  | 'cold_nearby'
  | 'cold_booking'
  | 'wallet'
  | 'payments'
  | 'track';

export type LogisticsDashboardView = 'home' | 'jobs' | 'nearby_loads' | 'my_trips' | 'earnings' | 'wallet';
export type BuyerDashboardView = 'home' | 'post_demand' | 'browse' | 'orders' | 'wallet' | 'payments';
export type ColdStorageDashboardView = 'home' | 'slots' | 'requests' | 'analytics' | 'earnings';

export type SaarthiDashboardView =
  | { role: 'farmer'; view: FarmerDashboardView }
  | { role: 'logistics_partner'; view: LogisticsDashboardView }
  | { role: 'buyer'; view: BuyerDashboardView }
  | { role: 'cold_storage_owner'; view: ColdStorageDashboardView };

export enum DashboardView {
  HOME = 'HOME',
  BOOK_TRANSPORT = 'BOOK_TRANSPORT',
  TRACK_SHIPMENT = 'TRACK_SHIPMENT',
  SUPPORT = 'SUPPORT',
  PROFILE = 'PROFILE',
  AWARENESS = 'AWARENESS',
  MARKET_RATES = 'MARKET_RATES',
  CROP_DISCOVERY = 'CROP_DISCOVERY',
  PRODUCE_MANAGE = 'PRODUCE_MANAGE',
  FARMER_ORDERS = 'FARMER_ORDERS',
  PICKUP_REQUEST = 'PICKUP_REQUEST',
  FPO_NEARBY = 'FPO_NEARBY',
  LOGISTICS_JOBS = 'LOGISTICS_JOBS',
  BUYER_ORDERS = 'BUYER_ORDERS'
}

export interface UserPreferences {
  location: string;
  primaryCrop: string;
  loadSize: string;
  urgency: string;
}

export interface TransportOption {
  id: string;
  provider: string;
  vehicleType: string;
  price: number;
  eta: string;
  rating: number;
}

export interface Shipment {
  id: string;
  source: string;
  destination: string;
  crop: string;
  weight: string;
  status: 'Booked' | 'Picked Up' | 'In Transit' | 'Delivered';
  date: string;
  cost: number;
  eta: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'payment' | 'refund' | 'incentive' | 'payout';
  status: 'completed' | 'pending' | 'failed';
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
}

export interface MarketRate {
  id: string;
  crop: string;
  mandi: string;
  price: number; // Current market price per quintal
  msp: number;   // Minimum Support Price
  trend: 'up' | 'down' | 'stable';
  change: number; // Percentage change
}

export interface CropDiscoveryListing {
  id: string;
  crop: string;
  mandi: string;
  state: string;
  pricePerQuintal: number;
  quantityAvailable: number; // in Tons
  distanceKm: number;
  etaHours: number;
  logisticsCostEst: number;
  tags: ('Cheapest' | 'Fastest' | 'Best Value')[];
}

export interface DashboardProps {
  userRole: UserRole;
  userPreferences: UserPreferences | null;
  onLogout: () => void;
  onSwitchPersona: (role: UserRole) => void;
  onEditPreferences: () => void;
}

export interface PreferenceScreenProps {
  userRole: UserRole;
  initialPreferences?: UserPreferences | null;
  onComplete: (prefs: UserPreferences) => void;
  onSwitchPersona: (role: UserRole) => void;
  onSkip: () => void;
  onBack: () => void;
}

export type ProductUnit = 'kg' | 'quintal' | 'ton';

export type PickupStatus = 'requested' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'in_transit' | 'delivered' | 'cancelled';
export type LogisticsJobStatus = 'open' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered';

export interface ProduceItem {
  id: string;
  farmerName: string;
  farmerLocation: string;
  crop: string;
  quantity: number;
  unit: ProductUnit;
  pricePerUnit: number;
  createdAt: string;
}

export interface PickupRequest {
  id: string;
  produceId: string;
  farmerName: string;
  pickupLocation: string;
  dropLocation: string;
  quantity: number;
  unit: ProductUnit;
  estimatedFareInr?: number;
  status: PickupStatus;
  requestedAt: string;
  transporterId?: string;
  transporterName?: string;
}

export interface Order {
  id: string;
  produceId: string;
  crop: string;
  buyerName: string;
  buyerLocation: string;
  farmerName: string;
  quantity: number;
  unit: ProductUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface LogisticsJob {
  id: string;
  pickupRequestId: string;
  produceId: string;
  crop: string;
  quantity: number;
  unit: ProductUnit;
  pickupLocation: string;
  dropLocation: string;
  farmerName: string;
  estimatedFareInr?: number;
  status: LogisticsJobStatus;
  acceptedByTransporterId?: string;
  acceptedByTransporterName?: string;
  updatedAt: string;
}

export type BuyerDemandStatus = 'open' | 'matched' | 'closed';

export interface BuyerDemand {
  id: string;
  buyerName: string;
  buyerLocation: string;
  crop: string;
  quantity: number;
  unit: ProductUnit;
  priceTarget: number;
  deliveryWindow: string;
  status: BuyerDemandStatus;
  createdAt: string;
}

/** V2 persisted session (localStorage) — production-upgradable to JWT */
export interface V2AuthSession {
  version: 1;
  phone: string;
  name: string;
  preferredLang: 'hi' | 'en' | 'kn' | 'te';
  persona: SaarthiUserRole | null;
  addressLabel: string;
  lat: number | null;
  lng: number | null;
  otpVerified: boolean;
  onboardingComplete: boolean;
}

export interface ColdStorageSlot {
  id: string;
  label: string;
  capacityTons: number;
  usedTons: number;
  pricePerTonDay: number;
}

export interface ColdStorageRequest {
  id: string;
  farmerName: string;
  crop: string;
  tons: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface PaymentSplit {
  farmer: number;
  logistics: number;
  platform: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  status: 'created' | 'paid' | 'failed';
  split: PaymentSplit;
  createdAt: string;
}