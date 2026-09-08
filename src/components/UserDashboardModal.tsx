import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  Star, 
  Package, 
  MapPin, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { AuthUser, GuaranteedOrder, Product } from '../types';
import { OFFICIAL_CATALOG_DB } from '../data/catalogDB';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  orders: GuaranteedOrder[];
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateOrders: (orders: GuaranteedOrder[]) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  products,
  onAddProduct,
  onUpdateProductStock,
  onUpdateOrders,
}) => {
  // Seller Listing state
  const [skuCode, setSkuCode] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [stockQty, setStockQty] = useState(5);
  const [sellingPrice, setSellingPrice] = useState(999);
  const [catalogMrp, setCatalogMrp] = useState<number | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  // Claim Modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState('Dissatisfaction with formulation (30-Day Return Guarantee)');
  const [claimDesc, setClaimDesc] = useState('');

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen || !user) return null;

  // SKU code auto lookup
  const handleSkuChange = (sku: string) => {
    const trimmed = sku.trim();
    setSkuCode(trimmed);
    const catalogItem = OFFICIAL_CATALOG_DB[trimmed];
    if (catalogItem) {
      setCatalogMrp(catalogItem.mrp);
      if (!productTitle) setProductTitle(catalogItem.name);
      if (sellingPrice > catalogItem.mrp) {
        setPriceWarning(`Price Cap Alert: Price cannot exceed official catalogue MRP of ₹${catalogItem.mrp}`);
      } else {
        setPriceWarning(null);
      }
    } else {
      setCatalogMrp(null);
      setPriceWarning(null);
    }
  };

  const handlePriceChange = (val: number) => {
    setSellingPrice(val);
    if (catalogMrp && val > catalogMrp) {
      setPriceWarning(`Price Cap Alert: Price cannot exceed official catalogue MRP of ₹${catalogMrp}`);
    } else {
      setPriceWarning(null);
    }
  };

  const handlePublishStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (catalogMrp && sellingPrice > catalogMrp) {
      alert(`Selling price cannot exceed official catalogue MRP of ₹${catalogMrp}`);
      return;
    }

    const catalogItem = OFFICIAL_CATALOG_DB[skuCode];
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: skuCode || '42255',
      title: productTitle || 'Oriflame Swedish Formulation',
      subtitle: 'Clearance Liquidation Stock',
      category: (catalogItem?.category as any) || 'Skincare',
      mrp: catalogMrp || Math.round(sellingPrice * 1.3),
      clearancePrice: sellingPrice,
      stock: stockQty,
      imageUrl: catalogItem?.img || '/team-golden-star-logo-bw.svg',
      isVerifiedImage: true,
      rating: 5.0,
      reviewCount: 1,
      volume: catalogItem?.volume || '50 ml',
      description: 'Factory sealed genuine formulation liquidated under Team Golden Star custody.',
      swedishExtracts: ['Stockholm Lab Tested', 'Certified Genuine'],
      batchCode: 'SE-2026-QC',
      expiryDate: '12/2026',
      status: 'active',
      addedAt: new Date().toISOString().split('T')[0],
      sellerConsultantId: user.bpId || user.email,
    };

    onAddProduct(newProduct);
    alert(`Success! Listing published at ₹${sellingPrice}.\nNet Seller Settlement: ₹${Math.round(sellingPrice * 0.95)} per unit.`);
    setSkuCode('');
    setProductTitle('');
    setCatalogMrp(null);
    setPriceWarning(null);
  };

  // Claim operations
  const handleOpenClaim = (orderId: string) => {
    setSelectedOrderId(orderId);
    setClaimDesc('');
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const updated = orders.map((o) =>
      o.orderId === selectedOrderId
        ? { ...o, claimFiled: true, claimReason, claimDescription: claimDesc }
        : o
    );
    onUpdateOrders(updated);
    setIsClaimModalOpen(false);
    alert(`Claim successfully filed for ${selectedOrderId}.\nOur Support Desk (+91 7003146399) will contact your registered WhatsApp within 24 hours.`);
  };

  // Review operations
  const handleOpenReview = (orderId: string) => {
    setReviewOrderId(orderId);
    setReviewStars(5);
    setReviewText('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;

    const updated = orders.map((o) =>
      o.orderId === reviewOrderId
        ? { ...o, rating: reviewStars, review: reviewText }
        : o
    );
    onUpdateOrders(updated);
    setIsReviewModalOpen(false);
    alert(`Thank you for reviewing Order ${reviewOrderId}! Review verified and published.`);
  };

  const userListings = products.filter(
    (p) => p.sellerConsultantId === user.bpId || p.sellerConsultantId === user.email || user.role === 'SELLER'
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1c2b24]/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-modal rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-9 space-y-7 animate-fade-in-up relative shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#0a7d4f]">
                {user.name}'s Dashboard &amp; Claim Hub
              </h3>
            </div>
            <p className="text-xs text-[#5b6b63] mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Registered Logistics: <strong>{user.city} - PIN {user.pin}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full text-[10px] border border-amber-300">
                {user.role === 'SELLER' ? `Brand Partner (${user.bpId || 'Verified'})` : 'Customer Account'}
              </span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#5b6b63] hover:text-[#1c2b24] p-1.5 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELLER STOCK MANAGER SECTION (If Seller Role) */}
        {user.role === 'SELLER' && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-stone-50 via-white to-[#ebf5ef] border border-emerald-200/80 rounded-[2rem] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c2b24] flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#0a7d4f]" /> List Product for Liquidation
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Retail price cannot exceed official catalogue MRP. You receive <strong>95% net payout</strong> on sales.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  5% Service Rate Applied
                </span>
              </div>

              <form onSubmit={handlePublishStock} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-stone-700">Select / Input Product SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={skuCode}
                    onChange={(e) => handleSkuChange(e.target.value)}
                    placeholder="e.g. 42255, 33980, 46047, 42503, 12760"
                    className="w-full p-3 border border-stone-200 rounded-2xl bg-white font-mono focus:outline-none focus:border-[#0a7d4f]"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Tip: Try entering 42255 or 33980 for auto-catalogue detection.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-stone-700">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Product Description"
                    className="w-full p-3 border border-stone-200 rounded-2xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700">Units Available *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-stone-200 rounded-2xl bg-white font-mono focus:outline-none focus:border-[#0a7d4f]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700">Official Catalogue MRP</label>
                  <input
                    type="text"
                    readOnly
                    value={catalogMrp ? `₹${catalogMrp}` : 'Auto-Detected'}
                    className="w-full p-3 border border-stone-200 rounded-2xl bg-stone-100 font-mono text-stone-600 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-stone-700">Customer Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={sellingPrice}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    placeholder="Must be <= MRP"
                    className="w-full p-3 border border-stone-200 rounded-2xl bg-white font-mono font-bold text-[#0a7d4f] focus:outline-none focus:border-[#0a7d4f]"
                  />
                </div>

                {/* Real-time Net Seller Payout Preview */}
                <div className="sm:col-span-4 p-4 bg-gradient-to-r from-[#e6f4ee] to-[#dcf1e5] border border-[#0a7d4f]/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
                  <div>
                    <span className="text-[#075c3a] font-bold block text-sm">Estimated Maximum Seller Payout:</span>
                    <span className="text-[11px] text-stone-600">5% partner platform fee applied. 95% net settlement direct to you.</span>
                  </div>
                  <div className="mt-2 sm:mt-0 font-mono text-xl font-extrabold text-[#0a7d4f]">
                    ₹{Math.round(sellingPrice * 0.95).toFixed(2)}
                  </div>
                </div>

                {priceWarning && (
                  <div className="sm:col-span-4 text-rose-600 font-bold text-xs flex items-center gap-1.5 p-2 bg-rose-50 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{priceWarning}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={Boolean(priceWarning)}
                  className={`sm:col-span-4 py-3.5 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase hover:opacity-95 transition shadow-md shadow-[#0a7d4f]/25 cursor-pointer ${
                    priceWarning ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Publish to Clearance Marketplace
                </button>
              </form>
            </div>

            {/* Active Stock Listings */}
            <div>
              <h4 className="font-bold text-xs uppercase mb-3 text-[#1c2b24] flex items-center justify-between">
                <span>Your Active Stock Listings ({userListings.length})</span>
                <span className="text-[11px] font-mono text-[#0a7d4f]">Hub: {user.pin}</span>
              </h4>
              <div className="space-y-2.5 text-xs max-h-48 overflow-y-auto pr-1">
                {userListings.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-white/90 border border-stone-200 rounded-2xl shadow-2xs">
                    <div>
                      <p className="font-bold text-[#1c2b24]">{p.title} (SKU {p.sku})</p>
                      <p className="text-[11px] text-[#0a7d4f] font-mono font-semibold">
                        Price: ₹{p.clearancePrice} • 95% Net Payout: ₹{Math.round(p.clearancePrice * 0.95)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5b6b63]">Units:</span>
                      <input
                        type="number"
                        min={0}
                        value={p.stock}
                        onChange={(e) => onUpdateProductStock(p.id, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border border-stone-200 rounded-lg text-center font-mono bg-white font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS WITH LIVE 30-DAY CLAIM & FEEDBACK */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
            <h4 className="font-bold text-xs uppercase text-[#1c2b24] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0a7d4f]" />
              <span>Order History, 30-Day Claims &amp; Reviews</span>
            </h4>
            <span className="text-[10px] bg-[#fff2cc] text-[#075c3a] font-bold px-3 py-1 rounded-full border border-[#d4a017]/30 shadow-2xs flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a017]" />
              <span>30-Day Guarantee Active</span>
            </span>
          </div>

          <div className="overflow-x-auto border border-stone-200/80 rounded-3xl bg-white/70">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-stone-50 to-[#edf4f0] border-b border-stone-200 text-[#5b6b63] font-semibold">
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Item Details</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">30-Day Claim Policy</th>
                  <th className="p-3.5 text-right">Feedback / Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => {
                  const delDate = new Date(o.deliveryDate);
                  const daysElapsed = Math.floor((Date.now() - delDate.getTime()) / (1000 * 60 * 60 * 24));
                  const daysLeft = 30 - daysElapsed;
                  const isEligible = daysLeft >= 0;

                  return (
                    <tr key={o.orderId} className="hover:bg-stone-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-[#0a7d4f]">{o.orderId}</td>
                      <td className="p-3.5 font-medium text-[#1c2b24]">{o.itemsSummary}</td>
                      <td className="p-3.5 font-mono font-bold">₹{o.amount}</td>
                      <td className="p-3.5">
                        <span className="px-3 py-0.5 rounded-full bg-[#e6f4ee] text-[#075c3a] text-[10px] font-bold">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {o.claimFiled ? (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" /> Under Review
                          </span>
                        ) : isEligible ? (
                          <button
                            onClick={() => handleOpenClaim(o.orderId)}
                            className="px-3.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-rose-500" />
                            <span>Claim ({daysLeft}d left)</span>
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[10px] italic">Window Expired</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {o.rating ? (
                          <div className="text-right">
                            <span className="text-amber-500 text-[11px] font-bold">★ {o.rating}/5</span>
                            <p className="text-[10px] text-stone-500 truncate max-w-xs">{o.review}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReview(o.orderId)}
                            className="px-3.5 py-1 rounded-full bg-white border border-[#0a7d4f]/40 text-[#0a7d4f] hover:bg-[#e6f4ee] text-[10px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Star className="w-3 h-3 text-[#d4a017]" />
                            <span>Rate &amp; Review</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CLAIM REGISTRATION SUB-MODAL */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-60 bg-[#1c2b24]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal rounded-[2.5rem] max-w-md w-full p-7 space-y-4 animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif font-extrabold text-base text-[#1c2b24] flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-[#0a7d4f]" /> File 30-Day Guarantee Claim
              </h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-[#5b6b63] hover:text-[#1c2b24]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Order Reference</label>
                <input
                  type="text"
                  readOnly
                  value={selectedOrderId || ''}
                  className="w-full p-3 border rounded-2xl bg-stone-100 font-mono text-stone-700 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Reason for Claim *</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full p-3 border border-stone-200 rounded-2xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                >
                  <option value="Damaged in transit">Damaged in transit</option>
                  <option value="Packaging seal compromised">Packaging seal compromised</option>
                  <option value="Dissatisfaction with formulation (30-Day Return Guarantee)">Dissatisfaction with formulation (30-Day Return Guarantee)</option>
                  <option value="Wrong SKU received">Wrong SKU received</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Explain Issue *</label>
                <textarea
                  required
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  placeholder="Describe the condition of your formulation..."
                  className="w-full p-3 border border-stone-200 rounded-2xl bg-white h-24 focus:outline-none focus:border-[#0a7d4f]"
                />
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                * Claims are reviewed within 24 hours. Our support node (+91 7003146399) will contact you for resolution.
              </p>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-lg cursor-pointer"
              >
                Submit Official Claim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK / REVIEW SUB-MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-60 bg-[#1c2b24]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal rounded-[2.5rem] max-w-md w-full p-7 space-y-4 animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif font-extrabold text-base text-[#1c2b24] flex items-center gap-1.5">
                <Star className="w-5 h-5 text-[#d4a017] fill-[#d4a017]" /> Rate Formulation &amp; Service
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-[#5b6b63] hover:text-[#1c2b24]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div className="text-center py-2">
                <p className="font-semibold text-stone-600 mb-2">How satisfied are you with this product?</p>
                <div className="flex justify-center gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewStars(s)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= reviewStars ? 'text-[#d4a017] fill-[#d4a017]' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700">Your Honest Review / Experience</label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this Swedish formulation..."
                  className="w-full p-3 border border-stone-200 rounded-2xl bg-white h-24 focus:outline-none focus:border-[#0a7d4f]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-lg cursor-pointer"
              >
                Publish Verified Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
