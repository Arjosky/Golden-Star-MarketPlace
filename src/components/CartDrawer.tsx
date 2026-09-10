import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Copy, 
  Check, 
  Phone, 
  Award,
  UserCheck,
  Lock,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CartItem, CustomerOrderInfo, BuyerOrder, AuthUser, GuaranteedOrder } from '../types';
import { getStoredOrders, saveStoredOrders, getStoredGuaranteedOrders, saveStoredGuaranteedOrders } from '../utils/storage';
import { saveOrderToFirestore } from '../utils/firebaseStorage';
import { findNearestSellerForPincode } from '../utils/pincodeMatcher';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user?: AuthUser | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
}) => {
  const [customer, setCustomer] = useState<CustomerOrderInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.street || '',
    city: user?.city || 'Kolkata',
    state: 'West Bengal',
    pincode: user?.pin || '700091',
    dispatchMethod: 'Express SPO Kolkata Hub',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
        address: user.street || prev.address,
        city: user.city || prev.city,
        pincode: user.pin || prev.pincode,
      }));
      if (user.role === 'SELLER') {
        setBuyerRole('brand_partner');
        if (user.bpId) setBpId(user.bpId);
      }
    }
  }, [user]);

  // Dual Margin Role Selection: 'customer' (15%) or 'brand_partner' (5%)
  const [buyerRole, setBuyerRole] = useState<'customer' | 'brand_partner'>('customer');
  const [bpId, setBpId] = useState(user?.bpId || '');
  const [copied, setCopied] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState<BuyerOrder | null>(null);
  const [paidOrderSuccess, setPaidOrderSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-detection logic:
  const isBrandPartner = buyerRole === 'brand_partner' || bpId.trim().length >= 4;
  const serviceChargePercent = isBrandPartner ? 5 : 15;

  // Smart Pincode Auto-Merge for Fastest Delivery
  const buyerPin = customer.pincode.trim() || '700091';
  const pincodeMatch = findNearestSellerForPincode(buyerPin);
  const sellerPin = pincodeMatch.sellerPincode;
  const deliveryCost = pincodeMatch.deliveryCost;
  const logisticsTierName = `${pincodeMatch.tier} (${pincodeMatch.hubArea})`;

  // Financial Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalClearance = cartItems.reduce(
    (acc, item) => acc + item.product.clearancePrice * item.quantity,
    0
  );
  const totalMrp = cartItems.reduce(
    (acc, item) => acc + item.product.mrp * item.quantity,
    0
  );
  const totalSavings = totalMrp - subtotalClearance;
  const shippingFee = subtotalClearance === 0 ? 0 : deliveryCost;
  
  // Extra Service Charge based on detected role
  const serviceChargeAmount = Math.round((subtotalClearance * serviceChargePercent) / 100);
  const finalTotal = subtotalClearance + serviceChargeAmount + shippingFee;

  // Construct official WhatsApp Message
  const constructWhatsAppMessage = (orderNumber: string, trackingNumber: string) => {
    const orderLines = cartItems.map((item, idx) => {
      const lineTotal = item.product.clearancePrice * item.quantity;
      return `${idx + 1}. [SKU ${item.product.sku}] ${item.product.title}\n   Qty: ${item.quantity} × ₹${item.product.clearancePrice} = ₹${lineTotal}`;
    }).join('\n');

    const message = `🌟 *GOLDEN STAR STORE - CLEARANCE DISPATCH ORDER* 🌟
*Operator:* Biswajit Roy (Arjo) | 7003146399
──────────────────────────────
📦 *ORDER ID:* ${orderNumber}
🚚 *SPO TRACKING:* ${trackingNumber}
──────────────────────────────
👑 *BUYER CLASSIFICATION:*
${isBrandPartner 
  ? `• Oriflame Brand Partner (5% Service Charge)\n• Brand Partner ID: ${bpId.trim() || 'Verified BP'}` 
  : `• Customer (15% Extra Service Charge)`}
──────────────────────────────
📋 *ORDERED ITEMS:*
${orderLines}
──────────────────────────────
📊 *BILLING SUMMARY:*
• Items Subtotal: ₹${subtotalClearance.toLocaleString('en-IN')}
• Service Charge (${serviceChargePercent}%): ₹${serviceChargeAmount.toLocaleString('en-IN')}
• Delivery / Shipping: ${shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
• 💵 *FINAL PAYABLE:* ₹${finalTotal.toLocaleString('en-IN')}
──────────────────────────────
👤 *DELIVERY ADDRESS:*
• Name: ${customer.fullName || 'Valued Buyer'}
• Phone: ${customer.phone || 'Via WhatsApp'}
• Address: ${customer.address ? `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}` : 'Will confirm via chat'}
• Dispatch Hub: ${customer.dispatchMethod}
──────────────────────────────
✅ Ready for verification & Kolkata SPO dispatch by Biswajit Roy.`;

    return message;
  };

  const handleWhatsAppTeleport = () => {
    if (cartItems.length === 0) return;

    const orderNumber = `GSS-ORD-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `SPO-KOL-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: BuyerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      items: [...cartItems],
      customer: { ...customer },
      isTeamGoldenStarBP: isBrandPartner,
      bpConsultantId: isBrandPartner ? bpId : undefined,
      platformMarginRate: serviceChargePercent,
      subtotal: subtotalClearance,
      totalMrp,
      totalSavings,
      shippingFee,
      finalTotal,
      sellerPayoutRate: 100 - serviceChargePercent,
      sellerPayoutTotal: subtotalClearance - serviceChargeAmount,
      platformFeeTotal: serviceChargeAmount,
      dispatchMethod: customer.dispatchMethod,
      status: 'Pending SPO Allocation',
      trackingNumber
    };

    const existingOrders = getStoredOrders();
    saveStoredOrders([newOrder, ...existingOrders]);
    setGeneratedOrder(newOrder);

    // Persist to Cloud Database for Future Customer Support & Warranty Protocols
    saveOrderToFirestore(
      orderNumber,
      user || null,
      customer.fullName,
      customer.phone,
      `${customer.address}, ${customer.city} - ${customer.pincode}`,
      customer.dispatchMethod,
      cartItems,
      finalTotal,
      customer.notes
    );

    // Also register in GuaranteedOrders
    const guaranteedOrder: GuaranteedOrder = {
      orderId: orderNumber,
      itemsSummary: cartItems.map(i => `${i.product.title} x ${i.quantity}`).join(', '),
      amount: finalTotal,
      status: 'Dispatched',
      deliveryDate: new Date().toISOString(),
      claimFiled: false,
      rating: null,
      review: null
    };
    const userOrders = getStoredGuaranteedOrders();
    saveStoredGuaranteedOrders([guaranteedOrder, ...userOrders]);

    const msg = constructWhatsAppMessage(orderNumber, trackingNumber);
    window.open(`https://wa.me/917003146399?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleRazorpayCheckout = () => {
    if (cartItems.length === 0) return;

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const guaranteedOrder: GuaranteedOrder = {
      orderId: orderNumber,
      itemsSummary: cartItems.map(i => `${i.product.title} x ${i.quantity}`).join(', '),
      amount: finalTotal,
      status: 'Confirmed',
      deliveryDate: new Date().toISOString(),
      claimFiled: false,
      rating: null,
      review: null
    };
    const userOrders = getStoredGuaranteedOrders();
    saveStoredGuaranteedOrders([guaranteedOrder, ...userOrders]);

    // Persist to Cloud Database for Future Customer Support
    saveOrderToFirestore(
      orderNumber,
      user || null,
      customer.fullName,
      customer.phone,
      `${customer.address}, ${customer.city} - ${customer.pincode}`,
      customer.dispatchMethod,
      cartItems,
      finalTotal,
      customer.notes
    );

    setPaidOrderSuccess(orderNumber);
    onClearCart();
  };

  const handleCopyInvoice = () => {
    const orderNum = generatedOrder ? generatedOrder.orderNumber : `GSS-ORD-${Date.now().toString().slice(-6)}`;
    const trackNum = generatedOrder ? generatedOrder.trackingNumber : `SPO-KOL-PENDING`;
    const msg = constructWhatsAppMessage(orderNum, trackNum);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#F8F9F6] border-l border-stone-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 font-serif">
                  Clearance Dispatch Cart
                </h2>
                <p className="text-[11px] text-stone-500">
                  Direct Kolkata SPO node • Operator Biswajit Roy
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {paidOrderSuccess ? (
              <div className="text-center py-10 px-4 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-stone-900 mb-1">
                  Razorpay Payment Confirmed!
                </h3>
                <p className="text-xs font-mono font-semibold text-emerald-800 mb-4 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block border border-emerald-200">
                  Order ID: {paidOrderSuccess}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto mb-6">
                  Your purchase is backed by our official <strong className="text-emerald-900">30-Day Money-Back Guarantee</strong>.
                  You can track, review, or file hassle-free claims directly from your User Dashboard.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setPaidOrderSuccess(null);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    Done & Return to Store
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-stone-800 mb-1">Your cart is empty</p>
                <p className="text-xs text-stone-500 mb-6">
                  Browse authentic Swedish clearance products and add Oriflame items.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium pb-1 border-b border-stone-200">
                    <span>Selected Products ({itemsCount} units)</span>
                    <button
                      onClick={onClearCart}
                      className="text-rose-600 hover:underline text-[11px] cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {cartItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="bg-white p-3.5 rounded-xl border border-stone-200 flex gap-3 items-center justify-between shadow-2xs"
                    >
                      {(product.isVerifiedImage || product.imageUrl?.startsWith('data:')) && !product.imageUrl?.includes('logo-bw') ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-14 h-14 object-cover rounded-lg bg-stone-50 shrink-0 border border-stone-200"
                        />
                      ) : (
                        <img
                          src="/team-golden-star-logo-bw.svg"
                          alt={product.title}
                          className="w-14 h-14 object-contain p-1.5 rounded-lg bg-stone-50 shrink-0 border border-stone-200"
                        />
                      )}

                      <div className="flex-1 min-w-0 px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            SKU {product.sku}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5">
                          {product.title}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xs font-bold text-stone-900 font-mono">
                            ₹{product.clearancePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-stone-100 rounded-lg border border-stone-200 p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-stone-900 font-mono">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            disabled={quantity >= product.stock}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-detected Dual-Margin Role Selection */}
                <div className="pt-2 border-t border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      Order Type
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isBrandPartner
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-stone-200 text-stone-800'
                    }`}>
                      {isBrandPartner ? 'Brand Partner: 5% Service Charge' : 'Customer: 15% Extra Service Charge'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBuyerRole('customer');
                        setBpId('');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !isBrandPartner
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>Customer (15%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuyerRole('brand_partner')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isBrandPartner
                          ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Brand Partner (5%)</span>
                    </button>
                  </div>

                  {isBrandPartner && (
                    <div className="animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Enter Oriflame Brand Partner ID (e.g. 700314)"
                        value={bpId}
                        onChange={(e) => setBpId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-400 focus:border-emerald-600 rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Delivery Information Form */}
                <div className="pt-2 border-t border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Delivery Details</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Recipient Full Name"
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="WhatsApp Phone Number"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={customer.pincode}
                        onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700 font-mono font-bold"
                      />
                    </div>

                    {/* Live Smart Pincode Auto-Merge Result */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-300/80 text-xs shadow-2xs space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-emerald-900 text-[10px] uppercase tracking-wide flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Pincode Auto-Merge Route</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {pincodeMatch.eta}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-700">
                        Customer PIN: <strong className="font-mono text-stone-900">{buyerPin}</strong> ➔ Matched Hub: <strong className="font-mono text-emerald-800">{pincodeMatch.hubArea} (PIN {pincodeMatch.sellerPincode})</strong>
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Assigned Seller: {pincodeMatch.sellerName} • {pincodeMatch.description} (Delivery fee: ₹{deliveryCost})
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Street Address / City"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <select
                        value={customer.dispatchMethod}
                        onChange={(e) => setCustomer({ ...customer, dispatchMethod: e.target.value as any })}
                        className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-emerald-700 text-xs"
                      >
                        <option value="Express SPO Kolkata Hub">Express SPO Kolkata Hub</option>
                        <option value="Home Courier Priority">Home Courier Priority</option>
                        <option value="Direct Pickup (Team Golden Star)">Direct Pickup</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Financial Summary & Dispatch Buttons */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-4">
              
              {/* PIN Logistics Routing Box */}
              <div className="bg-gradient-to-br from-stone-50 to-[#edf4f0] border border-stone-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5b6b63]">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-700" /> Seller SPO Hub PIN:</span>
                  <span className="font-mono font-bold text-[#1c2b24]">SPO 29435 (700077 Dumdum)</span>
                </div>
                <div className="flex justify-between text-[#5b6b63]">
                  <span>Destination PIN:</span>
                  <span className="font-mono font-bold text-[#0a7d4f]">{buyerPin || '700077 (Standard)'}</span>
                </div>
                <div className="border-t border-dashed border-stone-200 pt-1 flex justify-between font-semibold text-[11px]">
                  <span className="text-stone-600">{logisticsTierName}:</span>
                  <span className="text-[#0a7d4f] font-bold">₹{deliveryCost}</span>
                </div>
              </div>

              {/* Financial Tally */}
              <div className="bg-gradient-to-br from-[#e6f4ee]/70 to-[#d8ede1]/50 border border-[#0a7d4f]/25 p-4 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5b6b63]">
                  <span>Items Subtotal:</span>
                  <span className="font-mono text-[#1c2b24] font-bold">₹{subtotalClearance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#5b6b63]">
                  <span>Service Charge ({serviceChargePercent}% {isBrandPartner ? 'BP' : 'Customer'}):</span>
                  <span className="font-mono font-bold text-[#1c2b24]">+₹{serviceChargeAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#5b6b63]">
                  <span>Delivery / Handover:</span>
                  <span className="font-mono font-bold text-[#1c2b24]">₹{deliveryCost}</span>
                </div>
                <div className="border-t border-stone-200/80 pt-2 flex justify-between text-sm sm:text-base font-extrabold text-[#1c2b24]">
                  <span>Total Payable:</span>
                  <span className="text-[#0a7d4f] font-mono font-bold">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Razorpay Instant Checkout */}
                <button
                  onClick={handleRazorpayCheckout}
                  className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#0a7d4f] via-emerald-700 to-[#075c3a] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#0a7d4f]/25 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#d4a017]" />
                  <span>Pay via Razorpay (UPI / NetBanking)</span>
                </button>

                {/* Direct WhatsApp Order */}
                <button
                  id="whatsapp-teleportation-dispatch-btn"
                  onClick={handleWhatsAppTeleport}
                  className="w-full py-3 px-4 rounded-full bg-white border border-[#0a7d4f]/40 hover:bg-emerald-50 text-[#0a7d4f] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Direct WhatsApp Order (7003146399)</span>
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyInvoice}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Invoice Copied' : 'Copy Invoice'}</span>
                  </button>

                  <a
                    href="tel:7003146399"
                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-emerald-800 text-xs font-semibold border border-stone-200 flex items-center gap-1.5"
                    title="Call Operator Arjo"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Call Arjo</span>
                  </a>
                </div>

                {/* Google Integrations Quick Actions */}
                <div className="pt-2 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-[11px]">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Dumdum+Kolkata+700077"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 border border-stone-200 flex items-center justify-center gap-1.5 transition-colors font-medium"
                    title="View Dumdum SPO 29435 on Google Maps"
                  >
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>Maps SPO Hub</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const csvHeader = 'Item Name,SKU,Clearance Price,Quantity,Line Total\n';
                      const csvRows = cartItems.map(i => `"${i.product.name.replace(/"/g, '""')}","${i.product.sku}",${i.product.clearancePrice},${i.quantity},${i.product.clearancePrice * i.quantity}`).join('\n');
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `oriflame_cart_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="py-1.5 px-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-emerald-800 border border-stone-200 flex items-center justify-center gap-1.5 transition-colors font-medium cursor-pointer"
                    title="Export cart to CSV for Google Sheets"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>Sheets Export</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
