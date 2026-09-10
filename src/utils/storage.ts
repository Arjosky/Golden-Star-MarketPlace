import { Product, SellerIntake, WhitelistPartner, FlashSaleConfig, CartItem, BuyerOrder, SellerApplication, TeamOrg, AuthUser, GuaranteedOrder } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockInventory';
import { INITIAL_INTAKES, INITIAL_WHITELIST, INITIAL_FLASH_CONFIG } from '../data/mockPartners';

const STORAGE_KEYS = {
  PRODUCTS: 'golden_star_products_v1',
  INTAKES: 'golden_star_intakes_v1',
  WHITELIST: 'golden_star_whitelist_v1',
  FLASH_CONFIG: 'golden_star_flash_config_v1',
  CART: 'golden_star_cart_v1',
  ADMIN_SESSION: 'golden_star_admin_session_v1',
  ORDERS: 'golden_star_orders_v1',
  SELLER_APPS: 'golden_star_seller_apps_v1',
  ACTIVE_SELLER: 'golden_star_active_seller_v1',
  TEAMS: 'golden_star_teams_v1',
  MASTER_PIN: 'golden_star_master_pin_v1',
  AUTH_USER: 'gs_active_user',
  GUARANTEED_ORDERS: 'gs_user_orders',
};

export const INITIAL_TEAMS: TeamOrg[] = [
  {
    id: 'team-golden-star',
    teamName: 'Team Golden Star',
    founderDirectorName: 'Subhashree Ghosh',
    title: 'Diamond Director Oriflame PAN India, Founder Team Golden star',
    consultantIdOrPanCode: 'DIAMOND-SG-700314',
    phone: '7003146399',
    email: 'oriflamearjo@gmail.com',
    hubLocation: 'Kolkata Central SPO Clearance Hub (West Bengal)',
    platformConcessionRate: 5.0,
    status: 'Active',
    addedAt: '2024-01-01',
    notes: 'Founding Organization & Flagship Diamond Director Hub of Team Golden Star Store. Auto-verifies all affiliate brand partners with 95% net payout.'
  }
];

export const INITIAL_ORDERS: BuyerOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'GSS-ORD-700314-88',
    createdAt: '2026-03-06 14:20',
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Tender Care
        quantity: 3
      },
      {
        product: INITIAL_PRODUCTS[1], // NovAge Ecollagen
        quantity: 1
      }
    ],
    customer: {
      fullName: 'Soma Mukherjee',
      phone: '9830124567',
      address: 'Dumdum Park, Kolkata',
      city: 'Kolkata Dumdum',
      state: 'West Bengal',
      pincode: '700077',
      dispatchMethod: 'Express SPO 29435 Dumdum Hub',
      notes: 'Please verify original Swedish batch seal before dispatch.'
    },
    isTeamGoldenStarBP: true,
    bpConsultantId: 'GS-882103',
    platformMarginRate: 5.0,
    subtotal: 2196,
    totalMrp: 3896,
    totalSavings: 1700,
    shippingFee: 0,
    finalTotal: 2196,
    sellerPayoutRate: 95.0,
    sellerPayoutTotal: 2086.2,
    platformFeeTotal: 109.8,
    dispatchMethod: 'Express SPO Kolkata Hub',
    status: 'In-Transit (Courier)',
    trackingNumber: 'SPO-KOL-99210'
  },
  {
    id: 'ord-102',
    orderNumber: 'GSS-ORD-RET-4402',
    createdAt: '2026-03-05 18:45',
    items: [
      {
        product: INITIAL_PRODUCTS[2], // Possess Man
        quantity: 1
      }
    ],
    customer: {
      fullName: 'Vikramjit Bannerjee',
      phone: '9831998822',
      address: '14B Southern Avenue',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700029',
      dispatchMethod: 'Home Courier Priority',
      notes: 'Fragile fragrance glass bottle.'
    },
    isTeamGoldenStarBP: false,
    platformMarginRate: 15.0,
    subtotal: 2199,
    totalMrp: 3799,
    totalSavings: 1600,
    shippingFee: 0,
    finalTotal: 2199,
    sellerPayoutRate: 85.0,
    sellerPayoutTotal: 1869.15,
    platformFeeTotal: 329.85,
    dispatchMethod: 'Home Courier Priority',
    status: 'Pending SPO Allocation',
    trackingNumber: 'EXP-BLUEDART-8821'
  }
];

export const INITIAL_SELLER_APPS: SellerApplication[] = [
  {
    id: 'app-201',
    partnerName: 'Biswajit Roy (Arjo)',
    consultantId: '8448337',
    phone: '7003146399',
    email: 'oriflamearjo@gmail.com',
    directorBadge: 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star',
    isWhitelisted: true,
    bypassCamera: true,
    submittedAt: '2026-03-01 10:00',
    status: 'Approved',
    reviewedAt: '2026-03-01 10:00',
    reviewedBy: 'System Whitelist Bypass'
  },
  {
    id: 'app-202',
    partnerName: 'Debasmita Pal',
    consultantId: 'GS-789012',
    phone: '9874561230',
    email: 'debasmita.pal@gmail.com',
    directorBadge: 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star',
    isWhitelisted: false,
    bypassCamera: false,
    submittedAt: '2026-03-07 09:15',
    status: 'Pending Arjo Verification'
  },
  {
    id: 'app-203',
    partnerName: 'Rajesh Sen',
    consultantId: 'RET-33120',
    phone: '9830991100',
    directorBadge: 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star',
    isWhitelisted: false,
    bypassCamera: false,
    submittedAt: '2026-03-06 17:30',
    status: 'Rejected',
    rejectionReason: 'ID Verification Failed: Consultant ID could not be cross-referenced with Subhashree Ghosh Diamond Director tree.',
    resolutionGuide: 'Please ensure your BP ID is registered under Subhashree Ghosh Diamond Director Oriflame PAN India or contact Biswajit Roy (Arjo) on WhatsApp 7003146399 for verification.',
    reviewedAt: '2026-03-06 18:00',
    reviewedBy: 'Arjo (Biswajit Roy)'
  }
];

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    let hasChanges = false;
    const migrated = parsed.map((p) => {
      // If product has an old mock placeholder and is not an admin verified image
      const isCustomUploaded = p.imageUrl?.startsWith('data:') || p.imageUrl?.startsWith('blob:');
      if (!p.isVerifiedImage && !isCustomUploaded && (!p.imageUrl || p.imageUrl.startsWith('/products/'))) {
        hasChanges = true;
        return {
          ...p,
          imageUrl: '/team-golden-star-logo-bw.svg',
          isVerifiedImage: false,
        };
      }
      return p;
    });
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('storage-products-updated'));
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

export function getStoredIntakes(): SellerIntake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTAKES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(INITIAL_INTAKES));
      return INITIAL_INTAKES;
    }
    const parsed = JSON.parse(raw);
    // Ensure all items have sellerTier and concessionPercent
    return parsed.map((item: any) => ({
      ...item,
      sellerTier: item.sellerTier || (item.concessionPercent === 15 ? 'Retail Consultant (15%)' : 'Whitelisted Brand Partner (5%)'),
      concessionPercent: item.concessionPercent ?? 5.0,
    }));
  } catch (e) {
    console.error('Failed to parse stored intakes', e);
    return INITIAL_INTAKES;
  }
}

export function exportDatabaseJSON(): string {
  const payload = {
    exportDate: new Date().toISOString(),
    operator: 'Biswajit Roy (Arjo) | Team Golden Star',
    contact: '7003146399',
    products: getStoredProducts(),
    intakes: getStoredIntakes(),
    whitelist: getStoredWhitelist(),
    flashConfig: getStoredFlashConfig(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importDatabaseJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.products && Array.isArray(data.products)) {
      saveStoredProducts(data.products);
    }
    if (data.intakes && Array.isArray(data.intakes)) {
      saveStoredIntakes(data.intakes);
    }
    if (data.whitelist && Array.isArray(data.whitelist)) {
      saveStoredWhitelist(data.whitelist);
    }
    if (data.flashConfig) {
      saveStoredFlashConfig(data.flashConfig);
    }
    return true;
  } catch (e) {
    console.error('Failed to import database JSON', e);
    return false;
  }
}

export function saveStoredIntakes(intakes: SellerIntake[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(intakes));
    window.dispatchEvent(new Event('storage-intakes-updated'));
  } catch (e) {
    console.error('Failed to save intakes', e);
  }
}

export function getStoredWhitelist(): WhitelistPartner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WHITELIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(INITIAL_WHITELIST));
      return INITIAL_WHITELIST;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored whitelist', e);
    return INITIAL_WHITELIST;
  }
}

export function saveStoredWhitelist(whitelist: WhitelistPartner[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(whitelist));
    window.dispatchEvent(new Event('storage-whitelist-updated'));
  } catch (e) {
    console.error('Failed to save whitelist', e);
  }
}

export function getStoredFlashConfig(): FlashSaleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASH_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FLASH_CONFIG, JSON.stringify(INITIAL_FLASH_CONFIG));
      return INITIAL_FLASH_CONFIG;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored flash config', e);
    return INITIAL_FLASH_CONFIG;
  }
}

export function saveStoredFlashConfig(config: FlashSaleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FLASH_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event('storage-flash-updated'));
  } catch (e) {
    console.error('Failed to save flash config', e);
  }
}

export function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart', e);
  }
}

export function getStoredMasterPin(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.MASTER_PIN) || '123713';
  } catch {
    return '123713';
  }
}

export function saveStoredMasterPin(pin: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_PIN, pin);
  } catch (e) {
    console.error('Failed to save master pin', e);
  }
}

export function getAdminAuthSession(): boolean {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return s === 'authenticated_123713' || s === 'authenticated_master';
  } catch {
    return false;
  }
}

export function setAdminAuthSession(auth: boolean): void {
  try {
    if (auth) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'authenticated_master');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to set auth session', e);
  }
}

export function getStoredOrders(): BuyerOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored orders', e);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: BuyerOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('storage-orders-updated'));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

export function getStoredSellerApps(): SellerApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELLER_APPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SELLER_APPS, JSON.stringify(INITIAL_SELLER_APPS));
      return INITIAL_SELLER_APPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored seller apps', e);
    return INITIAL_SELLER_APPS;
  }
}

export function saveStoredSellerApps(apps: SellerApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELLER_APPS, JSON.stringify(apps));
    window.dispatchEvent(new Event('storage-seller-apps-updated'));
  } catch (e) {
    console.error('Failed to save seller apps', e);
  }
}

export function getActiveSellerSession(): SellerApplication | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SELLER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveSellerSession(app: SellerApplication | null): void {
  try {
    if (app) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SELLER, JSON.stringify(app));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SELLER);
    }
    window.dispatchEvent(new Event('storage-active-seller-updated'));
  } catch (e) {
    console.error('Failed to save active seller session', e);
  }
}

export function getStoredTeams(): TeamOrg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored teams', e);
    return INITIAL_TEAMS;
  }
}

export function saveStoredTeams(teams: TeamOrg[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    window.dispatchEvent(new Event('storage-teams-updated'));
  } catch (e) {
    console.error('Failed to save teams', e);
  }
}

export const INITIAL_GUARANTEED_ORDERS: GuaranteedOrder[] = [
  {
    orderId: "ORD-9021",
    itemsSummary: "NovAge Mask (42255) x 1",
    amount: 1079,
    status: "Delivered",
    deliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    claimFiled: false,
    rating: 5,
    review: "Authentic Swedish formulation. Received in sealed condition."
  },
  {
    orderId: "ORD-8942",
    itemsSummary: "Love Potion EDP (46047) x 1",
    amount: 4499,
    status: "Delivered",
    deliveryDate: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(),
    claimFiled: false,
    rating: null,
    review: null
  },
  {
    orderId: "ORD-7812",
    itemsSummary: "Giordani Gold Essenza Parfum (42503) x 1",
    amount: 3899,
    status: "Delivered",
    deliveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    claimFiled: false,
    rating: null,
    review: null
  }
];

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    window.dispatchEvent(new Event('storage-auth-user-updated'));
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    window.dispatchEvent(new Event('storage-auth-user-updated'));
  } catch (e) {
    console.error('Failed to clear auth user', e);
  }
}

export function getStoredGuaranteedOrders(): GuaranteedOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUARANTEED_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GUARANTEED_ORDERS, JSON.stringify(INITIAL_GUARANTEED_ORDERS));
      return INITIAL_GUARANTEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_GUARANTEED_ORDERS;
  }
}

export function saveStoredGuaranteedOrders(orders: GuaranteedOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUARANTEED_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('storage-guaranteed-orders-updated'));
  } catch (e) {
    console.error('Failed to save guaranteed orders', e);
  }
}

export function resetToFactoryDefault(): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(INITIAL_INTAKES));
  localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(INITIAL_WHITELIST));
  localStorage.setItem(STORAGE_KEYS.FLASH_CONFIG, JSON.stringify(INITIAL_FLASH_CONFIG));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.SELLER_APPS, JSON.stringify(INITIAL_SELLER_APPS));
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SELLER);
  window.dispatchEvent(new Event('storage-products-updated'));
  window.dispatchEvent(new Event('storage-intakes-updated'));
  window.dispatchEvent(new Event('storage-whitelist-updated'));
  window.dispatchEvent(new Event('storage-flash-updated'));
  window.dispatchEvent(new Event('storage-orders-updated'));
  window.dispatchEvent(new Event('storage-seller-apps-updated'));
  window.dispatchEvent(new Event('storage-active-seller-updated'));
  window.dispatchEvent(new Event('storage-teams-updated'));
}
