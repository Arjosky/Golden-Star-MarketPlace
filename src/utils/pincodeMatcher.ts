import { SellerStockItem } from '../types';

export type PincodeMatchTier = 
  | 'EXACT_PINCODE_HYPERLOCAL' 
  | 'METRO_SPO_DUMDUM' 
  | 'REGIONAL_PRIORITY' 
  | 'NATIONAL_EXPRESS';

export interface PincodeMatchResult {
  tier: PincodeMatchTier;
  badgeText: string;
  etaDescription: string;
  shippingCost: number;
  matchedSellerName: string;
  matchedSellerPincode: string;
  matchedSellerPhone: string;
  isExactLocalMatch: boolean;
  hubName: string;
}

export const CENTRAL_SPO_HUB = {
  name: 'Central SPO 29435 Dumdum Hub (Kolkata)',
  operator: 'Biswajit Roy (Arjo)',
  pincode: '700077',
  phone: '7003146399',
  director: 'Subhashree Ghosh Diamond Director Oriflame PAN India'
};

/**
 * Auto-merge Customer Pincode with the nearest Seller Stock / SPO Node for fastest delivery.
 */
export function findNearestSellerForPincode(
  customerPinInput: string,
  sellerStocks: SellerStockItem[] = [],
  requestedSkus: string[] = []
): PincodeMatchResult {
  const cleanCustomerPin = (customerPinInput || '').replace(/[^0-9]/g, '').slice(0, 6);

  // Default fallback if pincode is empty or invalid
  if (cleanCustomerPin.length < 3) {
    return {
      tier: 'METRO_SPO_DUMDUM',
      badgeText: '🚀 Central SPO 29435 Dumdum Hub',
      etaDescription: '12 - 24 Hours Dispatch from Central Dumdum SPO Node',
      shippingCost: 30,
      matchedSellerName: CENTRAL_SPO_HUB.operator,
      matchedSellerPincode: CENTRAL_SPO_HUB.pincode,
      matchedSellerPhone: CENTRAL_SPO_HUB.phone,
      isExactLocalMatch: false,
      hubName: CENTRAL_SPO_HUB.name,
    };
  }

  // 1. Check for Exact 6-Digit Match among active sellers with stock
  if (cleanCustomerPin.length === 6) {
    const exactSeller = sellerStocks.find(s => {
      const matchPin = (s.pincode || '').trim() === cleanCustomerPin;
      const hasStock = s.quantity > 0 && s.status === 'In Stock (Active)';
      if (requestedSkus.length > 0) {
        return matchPin && hasStock && requestedSkus.includes(s.productCode);
      }
      return matchPin && hasStock;
    });

    if (exactSeller) {
      return {
        tier: 'EXACT_PINCODE_HYPERLOCAL',
        badgeText: `⚡ Same PIN (${cleanCustomerPin}) Instant Match`,
        etaDescription: `Hyperlocal 0 - 6 Hours Handover by Brand Partner ${exactSeller.sellerName}`,
        shippingCost: 25,
        matchedSellerName: `${exactSeller.sellerName} (BP: ${exactSeller.consultantId})`,
        matchedSellerPincode: exactSeller.pincode,
        matchedSellerPhone: exactSeller.phone,
        isExactLocalMatch: true,
        hubName: `Local Brand Partner Node (${exactSeller.sellerName} - PIN ${exactSeller.pincode})`,
      };
    }

    // Check if customer PIN matches Central SPO 29435 (700077 or 700028)
    if (cleanCustomerPin === '700077' || cleanCustomerPin === '700028') {
      return {
        tier: 'EXACT_PINCODE_HYPERLOCAL',
        badgeText: '⚡ Dumdum SPO Local Node Direct Handover',
        etaDescription: 'Same-Day 2 - 6 Hours Handover from SPO Dumdum Hub',
        shippingCost: 25,
        matchedSellerName: CENTRAL_SPO_HUB.operator,
        matchedSellerPincode: cleanCustomerPin,
        matchedSellerPhone: CENTRAL_SPO_HUB.phone,
        isExactLocalMatch: true,
        hubName: CENTRAL_SPO_HUB.name,
      };
    }
  }

  // 2. Metro / City Division Match (e.g. 700xxx Greater Kolkata / Dumdum SPO)
  if (cleanCustomerPin.startsWith('700')) {
    // Look for a seller in the 700xxx zone
    const metroSeller = sellerStocks.find(s => 
      s.pincode?.startsWith('700') && s.quantity > 0 && s.status === 'In Stock (Active)'
    );

    return {
      tier: 'METRO_SPO_DUMDUM',
      badgeText: '🚀 Kolkata Metro SPO 29435 Express',
      etaDescription: '12 - 24 Hours Express Handover & Local Dispatch',
      shippingCost: 30,
      matchedSellerName: metroSeller ? `${metroSeller.sellerName} (PIN: ${metroSeller.pincode})` : CENTRAL_SPO_HUB.operator,
      matchedSellerPincode: metroSeller?.pincode || CENTRAL_SPO_HUB.pincode,
      matchedSellerPhone: metroSeller?.phone || CENTRAL_SPO_HUB.phone,
      isExactLocalMatch: false,
      hubName: CENTRAL_SPO_HUB.name,
    };
  }

  // 3. Regional Priority Match (West Bengal & Eastern Region: PIN prefix 70 - 74)
  const prefix2 = cleanCustomerPin.slice(0, 2);
  const regionalPrefixes = ['70', '71', '72', '73', '74'];
  if (regionalPrefixes.includes(prefix2)) {
    const regionalSeller = sellerStocks.find(s => 
      regionalPrefixes.some(p => s.pincode?.startsWith(p)) && s.quantity > 0 && s.status === 'In Stock (Active)'
    );

    return {
      tier: 'REGIONAL_PRIORITY',
      badgeText: '📦 Regional Priority Speed Express',
      etaDescription: '24 - 48 Hours Priority Air & Rail Dispatch across Bengal',
      shippingCost: 45,
      matchedSellerName: regionalSeller ? `${regionalSeller.sellerName} (PIN: ${regionalSeller.pincode})` : CENTRAL_SPO_HUB.operator,
      matchedSellerPincode: regionalSeller?.pincode || CENTRAL_SPO_HUB.pincode,
      matchedSellerPhone: regionalSeller?.phone || CENTRAL_SPO_HUB.phone,
      isExactLocalMatch: false,
      hubName: 'Eastern Regional Air Express (SPO Dumdum Node)',
    };
  }

  // 4. National PAN-India Match (All other Indian Pincodes)
  return {
    tier: 'NATIONAL_EXPRESS',
    badgeText: '🚚 National PAN-India Courier Express',
    etaDescription: '2 - 4 Days Verified Express Delivery (BlueDart / Delhivery / India Post)',
    shippingCost: 65,
    matchedSellerName: CENTRAL_SPO_HUB.operator,
    matchedSellerPincode: CENTRAL_SPO_HUB.pincode,
    matchedSellerPhone: CENTRAL_SPO_HUB.phone,
    isExactLocalMatch: false,
    hubName: 'PAN-India Central Dispatch Node 29435',
  };
}
