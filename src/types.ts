export type Category = 
  | 'All'
  | 'Skincare'
  | 'Wellness by Oriflame'
  | 'Fragrance & Perfumes'
  | 'Makeup & Color'
  | 'Hair & Personal Care'
  | 'Prime Flash Deals';

export interface Product {
  id: string;
  sku: string; // e.g., '12760', '38531'
  title: string;
  subtitle?: string;
  category: Category;
  mrp: number; // in INR
  clearancePrice: number; // in INR
  stock: number;
  imageUrl: string;
  isVerifiedImage?: boolean; // True when admin uploads verified photo; false for default B&W logo
  rating: number;
  reviewCount: number;
  volume: string; // e.g. '15 ml', '75 ml', '21 Sachets'
  description: string;
  swedishExtracts: string[];
  batchCode: string;
  expiryDate: string; // e.g., '11/2026'
  isPrimeFlash?: boolean;
  flashDiscountPercent?: number;
  status: 'active' | 'draft' | 'archived';
  sellerConsultantId?: string;
  addedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface IntakeProductItem {
  id: string;
  productName: string;
  sku: string;
  category: Category;
  quantity: number;
  askingPricePerUnit: number;
  productDetails?: string; // unlimited words
  mnfDate?: string; // mm/yy
  expiryDate?: string; // mm/yy
  condition?: 'Factory Sealed' | 'Mint Boxed' | 'Store Display';
  imageUrl?: string; // optional image / photo proof
}

export interface SellerIntake {
  id: string;
  submittedAt: string;
  partnerName: string;
  consultantId: string;
  phone: string;
  email: string;
  productName: string;
  sku: string;
  category: Category;
  quantity: number;
  mrp: number;
  askingPricePerUnit: number;
  grossValuation: number;
  sellerTier: 'Whitelisted Brand Partner (5%)' | 'Retail Consultant (15%)';
  concessionPercent: number; // 5.0% for Whitelisted BP, 15.0% for Retail
  concessionAmount: number;
  netPayoutAmount: number; // 95% or 85%
  batchNumber: string;
  expiryDate: string; // mm/yy
  mnfDate?: string; // mm/yy
  productDetails?: string; // unlimited words
  items?: IntakeProductItem[]; // multiple optional products
  condition: 'Factory Sealed' | 'Mint Boxed' | 'Store Display';
  proofUrl: string;
  upiIdOrBank: string;
  status: 'Pending Verification' | 'Approved & Published' | 'Paid & Liquidated' | 'Rejected';
  adminNotes?: string;
}

export interface FinancialLedgerSummary {
  grossClearanceValue: number;
  totalPlatformCommFee: number;
  partnerCommFee5: number;
  retailCommFee15: number;
  netSellerLiquidationPayable: number;
  settledLiquidationPayable: number;
  pendingLiquidationPayable: number;
}

export interface WhitelistPartner {
  id: string;
  consultantId: string;
  fullName: string;
  phone: string;
  email: string;
  tier: 'Gold Star VIP' | 'Senior Partner' | 'Certified Brand Partner';
  concessionRate: number; // default 5% (or 4.5% VIP)
  totalLiquidatedCount: number;
  totalPayoutINR: number;
  status: 'Verified Active' | 'Audit Pending' | 'Suspended';
  joinedDate: string;
}

export interface FlashOfferItem {
  id: string;
  title: string;
  code: string;
  category: Category | string;
  tag: string;
  mrp: number;
  clearancePrice: number;
  badge?: string;
  img: string;
  description: string;
}

export interface FlashSaleConfig {
  isActive: boolean;
  headline: string;
  discountMultiplierText: string;
  endsAt: string; // ISO date string
  announcementTicker: string;
  cardTitle?: string; // "Live Flash Countdown Offer"
  cardSubtitle?: string; // "Click tab to preview key catalog items"
  featuredOffers?: FlashOfferItem[];
}

export interface CustomerOrderInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dispatchMethod: 'Express SPO 29435 Dumdum Hub' | 'Express SPO Kolkata Hub' | 'Home Courier Priority' | 'Direct Pickup (Team Golden Star)';
  notes?: string;
}

export interface BuyerOrder {
  id: string;
  orderNumber: string; // e.g., 'GSS-ORD-700314-1'
  createdAt: string;
  items: CartItem[];
  customer: CustomerOrderInfo;
  isTeamGoldenStarBP: boolean;
  bpConsultantId?: string;
  platformMarginRate: number; // 5.0% for verified BP, 15.0% for retail
  subtotal: number;
  totalMrp: number;
  totalSavings: number;
  shippingFee: number;
  finalTotal: number;
  sellerPayoutRate: number; // 95.0% or 85.0%
  sellerPayoutTotal: number;
  platformFeeTotal: number;
  dispatchMethod: string;
  status: 'Pending SPO Allocation' | 'In-Transit (Courier)' | 'Delivered' | 'Paid & Liquidated';
  trackingNumber: string;
}

export interface SellerApplication {
  id: string;
  partnerName: string;
  consultantId: string;
  phone: string;
  email?: string;
  directorBadge: string; // 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star'
  isWhitelisted: boolean;
  bypassCamera: boolean;
  selfiePhotoUrl?: string;
  submittedAt: string;
  status: 'Approved' | 'Pending Arjo Verification' | 'Pending Daddy Verification' | 'Rejected';
  rejectionReason?: string;
  resolutionGuide?: string;
  reviewedAt?: string;
  reviewedBy?: string; // 'Arjo (Biswajit Roy)'
}

export interface TeamOrg {
  id: string;
  teamName: string;
  founderDirectorName: string;
  title: string; // e.g., 'Diamond Director Oriflame PAN India, Founder Team Golden star'
  consultantIdOrPanCode: string;
  phone: string;
  email?: string;
  hubLocation: string; // e.g., 'Kolkata Central SPO Hub'
  platformConcessionRate: number; // e.g. 5.0%
  status: 'Active' | 'Pending Verification' | 'Archived';
  addedAt: string;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'SELLER';
  street?: string;
  city: string;
  pin: string;
  bpId?: string;
  provider?: string;
  avatarUrl?: string;
  isVerifiedSeller?: boolean; // Required for Brand Partner to list products
  sellerStatus?: 'active' | 'pending_verification' | 'rejected';
}

export interface GuaranteedOrder {
  orderId: string;
  itemsSummary: string;
  amount: number;
  status: 'Confirmed' | 'Dispatched' | 'Delivered';
  deliveryDate: string;
  claimFiled: boolean;
  claimReason?: string;
  claimDescription?: string;
  rating?: number | null;
  review?: string | null;
}

