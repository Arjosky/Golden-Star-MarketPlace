import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Clock, 
  Package, 
  Award, 
  Lock, 
  Check,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Category, SellerIntake, IntakeProductItem } from '../types';

interface SellerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIntake: (intake: SellerIntake) => void;
  isStandaloneView?: boolean;
}

interface ItemDraft {
  id: string;
  productName: string;
  sku: string;
  category: Category;
  quantity: number;
  askingPrice: number;
  productDetails: string; // unlimited words
  mnfDate: string; // mm/yy
  expiryDate: string; // mm/yy
  condition: 'Factory Sealed' | 'Mint Boxed' | 'Store Display';
  imageUrl?: string;
}

const createDefaultItem = (index: number): ItemDraft => ({
  id: `item-${Date.now()}-${index}`,
  productName: '',
  sku: '',
  category: 'Skincare',
  quantity: 5,
  askingPrice: 999,
  productDetails: '',
  mnfDate: '',
  expiryDate: '',
  condition: 'Factory Sealed',
  imageUrl: '',
});

// Helper to format/sanitize MM/YY
const formatMmYy = (value: string): string => {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length <= 2) {
    return cleaned;
  }
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
};

export const SellerPortalModal: React.FC<SellerPortalModalProps> = ({
  isOpen,
  onClose,
  onSubmitIntake,
  isStandaloneView = false,
}) => {
  // Brand Partner Identification State
  const [partnerName, setPartnerName] = useState('');
  const [consultantId, setConsultantId] = useState('');
  const [phone, setPhone] = useState('');
  const [upiIdOrBank, setUpiIdOrBank] = useState('');

  // Multiple Products Intake State (Optional multiple add)
  const [items, setItems] = useState<ItemDraft[]>([createDefaultItem(1)]);

  // Terms & Conditions Checkbox State
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedIntake, setSubmittedIntake] = useState<SellerIntake | null>(null);

  if (!isOpen && !isStandaloneView) return null;

  // Add another product (Optional)
  const handleAddItem = () => {
    setItems((prev) => [...prev, createDefaultItem(prev.length + 1)]);
  };

  // Remove a product (if more than 1)
  const handleRemoveItem = (idToRemove: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Update specific field on an item
  const handleUpdateItem = <K extends keyof ItemDraft>(
    id: string,
    field: K,
    value: ItemDraft[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  // Aggregate Calculations
  const totalUnits = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const totalGrossValuation = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.askingPrice) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Please accept the Terms & Conditions before submitting.');
      return;
    }

    if (!partnerName.trim() || !consultantId.trim() || !phone.trim() || !upiIdOrBank.trim()) {
      alert('Please enter Brand Partner Name, Oriflame Brand Partner ID, WhatsApp Phone, and Payout details.');
      return;
    }

    // Validate that each item has at least product name and SKU
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productName.trim() || !item.sku.trim()) {
        alert(`Please complete Product Name and Oriflame SKU for Product #${i + 1}.`);
        return;
      }
    }

    const convertedItems: IntakeProductItem[] = items.map((it) => ({
      id: it.id,
      productName: it.productName.trim(),
      sku: it.sku.trim(),
      category: it.category,
      quantity: Number(it.quantity) || 1,
      askingPricePerUnit: Number(it.askingPrice) || 10,
      productDetails: it.productDetails.trim(),
      mnfDate: it.mnfDate.trim() || '01/24',
      expiryDate: it.expiryDate.trim() || '12/26',
      condition: it.condition,
      imageUrl: it.imageUrl,
    }));

    const primaryItem = items[0];
    const concessionAmount = Math.round(totalGrossValuation * 0.05);
    const netPayoutAmount = totalGrossValuation - concessionAmount;

    const newIntake: SellerIntake = {
      id: `intake-${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      partnerName: partnerName.trim(),
      consultantId: consultantId.trim().toUpperCase(),
      phone: phone.trim(),
      email: `${phone.trim()}@goldenstar.in`,
      productName:
        items.length > 1
          ? `${primaryItem.productName.trim()} (+${items.length - 1} more items)`
          : primaryItem.productName.trim(),
      sku: items.map((it) => it.sku.trim()).join(', '),
      category: primaryItem.category,
      quantity: totalUnits,
      mrp: totalGrossValuation * 1.5,
      askingPricePerUnit: primaryItem.askingPrice,
      grossValuation: totalGrossValuation,
      sellerTier: 'Whitelisted Brand Partner (5%)',
      concessionPercent: 5.0,
      concessionAmount,
      netPayoutAmount,
      batchNumber: 'SEALED-BATCH-KOLKATA',
      expiryDate: primaryItem.expiryDate.trim() || '12/2026',
      mnfDate: primaryItem.mnfDate.trim() || '01/2024',
      productDetails: primaryItem.productDetails.trim(),
      items: convertedItems,
      condition: primaryItem.condition,
      proofUrl: primaryItem.imageUrl || '/products/proof-clearance.svg',
      upiIdOrBank: upiIdOrBank.trim(),
      status: 'Pending Verification',
      adminNotes: `Intake of ${items.length} product(s) totaling ${totalUnits} units. Verified by Subhashree Ghosh Org (Team Golden Star).`,
    };

    onSubmitIntake(newIntake);
    setSubmittedIntake(newIntake);
    setIsSubmitted(true);
  };

  const handleTeleportToWhatsApp = () => {
    if (!submittedIntake) return;

    const productsListFormatted = (submittedIntake.items || []).map((it, idx) => {
      return `📦 *Product #${idx + 1}: ${it.productName}*
• SKU Code: ${it.sku}
• Category: ${it.category}
• Quantity: ${it.quantity} units @ ₹${it.askingPricePerUnit} each = ₹${(it.quantity * it.askingPricePerUnit).toLocaleString('en-IN')}
• Mnf Date (mm/yy): ${it.mnfDate || 'N/A'}
• Expiry Date (mm/yy): ${it.expiryDate || 'N/A'}
• Condition: ${it.condition || 'Factory Sealed'}
${it.productDetails ? `• Product Details: ${it.productDetails}` : ''}`;
    }).join('\n\n');

    const msg = `🌟 *GOLDEN STAR STORE - BRAND PARTNER CLEARANCE INTAKE* 🌟
*Authority:* Subhashree Ghosh (Diamond Director Oriflame PAN India, Founder Team Golden Star)
*Operator:* Biswajit Roy (Arjo) | 7003146399
──────────────────────────────
👤 *BRAND PARTNER DETAILS:*
• Brand Partner Name: ${submittedIntake.partnerName}
• Oriflame Brand Partner ID: ${submittedIntake.consultantId}
• WhatsApp Number: ${submittedIntake.phone}
• Payout UPI/Account: ${submittedIntake.upiIdOrBank}
──────────────────────────────
📋 *INVENTORY LISTING SPECIFICATIONS (${submittedIntake.items?.length || 1} Product${(submittedIntake.items?.length || 1) > 1 ? 's' : ''}):*

${productsListFormatted}
──────────────────────────────
📊 *VALUATION SUMMARY:*
• Total Products: ${submittedIntake.items?.length || 1} item(s)
• Total Units: ${submittedIntake.quantity} units
• Gross Clearance Value: ₹${submittedIntake.grossValuation.toLocaleString('en-IN')}
• BP Payout (95% Net): ₹${submittedIntake.netPayoutAmount.toLocaleString('en-IN')}
──────────────────────────────
✅ *TERMS ACCEPTED:* Verified Brand Partner Quality & Process Guidelines.
Please review SKU(s) and allocate to Kolkata SPO Hub for liquidation.`;

    window.open(`https://wa.me/917003146399?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const content = (
    <div className="relative bg-white border border-stone-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
      {/* Header */}
      <div className="bg-stone-50 p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center">
            <img 
              src="/team-golden-star-logo.svg" 
              alt="Team Golden Star Logo" 
              className="w-full h-full object-contain filter drop-shadow-xs" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>ORIFLAME BRAND PARTNER CLEARANCE INTAKE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              Brand Partner Inventory Liquidation Portal
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Surplus stock liquidation desk for registered Oriflame Brand Partners under Team Golden Star.
            </p>
          </div>
        </div>

        {!isStandaloneView && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors shrink-0 cursor-pointer shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Verification Authority Seal (Subhashree Ghosh) */}
      <div className="bg-emerald-50/70 border-b border-emerald-200 px-5 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs border border-emerald-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-900">
                Verified Authority:
              </span>
              <span className="text-xs font-bold text-emerald-900">
                Subhashree Ghosh
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-950 font-semibold inline-flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium">
              Diamond Director Oriflame PAN India, Founder Team Golden Star
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] text-stone-500 block">SPO Dispatch Hub</span>
          <span className="text-xs font-bold text-stone-800">Kolkata Central</span>
        </div>
      </div>

      {/* Body Scrollable Area */}
      <div className="overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#F8F9F6]">
        {isSubmitted && submittedIntake ? (
          /* Submission Success State */
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-stone-900 font-serif">
              Clearance Intake Successfully Logged
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Surplus inventory ({submittedIntake.items?.length || 1} product listing{submittedIntake.items && submittedIntake.items.length > 1 ? 's' : ''}, {submittedIntake.quantity} total units) 
              submitted by Brand Partner <strong className="text-emerald-900">{submittedIntake.partnerName}</strong> (ID: {submittedIntake.consultantId}) 
              has been recorded in the verification pipeline.
            </p>

            <div className="bg-white rounded-xl p-4 border border-stone-200 text-left text-xs space-y-3 max-w-xl mx-auto shadow-xs">
              <div className="flex justify-between text-stone-600 border-b border-stone-100 pb-2">
                <span>Reference Intake ID:</span>
                <span className="font-mono font-bold text-emerald-900">{submittedIntake.id}</span>
              </div>

              {/* Items Summary list */}
              <div className="space-y-2 py-1">
                {(submittedIntake.items || []).map((it, idx) => (
                  <div key={it.id || idx} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>#{idx + 1} {it.productName}</span>
                      <span className="font-mono text-emerald-900">₹{(it.quantity * it.askingPricePerUnit).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-3 mt-1">
                      <span>SKU: <strong className="text-stone-700">{it.sku}</strong></span>
                      <span>Qty: <strong className="text-stone-700">{it.quantity} units</strong></span>
                      <span>Mnf: <strong className="text-stone-700">{it.mnfDate || 'N/A'}</strong></span>
                      <span>Exp: <strong className="text-stone-700">{it.expiryDate || 'N/A'}</strong></span>
                    </div>
                    {it.productDetails && (
                      <div className="text-[11px] text-stone-600 mt-1 italic line-clamp-2">
                        "{it.productDetails}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-emerald-900">
                <span>Gross Clearance Value:</span>
                <span className="font-mono text-base">₹{submittedIntake.grossValuation.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleTeleportToWhatsApp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Notify Biswajit Roy on WhatsApp (7003146399)</span>
              </button>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedIntake(null);
                  setItems([createDefaultItem(1)]);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 cursor-pointer shadow-xs"
              >
                List New Batch
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Brand Partner Credentials */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider pb-2 border-b border-stone-100">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Brand Partner Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Brand Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Enter your registered name"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Oriflame Brand Partner ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultantId}
                    onChange={(e) => setConsultantId(e.target.value)}
                    placeholder="e.g. 700314 or GS-882103"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9830124567"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Payout UPI ID or Bank Account *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiIdOrBank}
                    onChange={(e) => setUpiIdOrBank(e.target.value)}
                    placeholder="e.g. 9830124567@upi or Bank A/C"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Inventory Listing Specifications (Multiple Add Optional) */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>Inventory Listing Specifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {items.length} Product{items.length > 1 ? 's' : ''} Added
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    (Multiple Add Supported)
                  </span>
                </div>
              </div>

              {/* List of Product Items */}
              <div className="space-y-6">
                {items.map((item, index) => {
                  const itemValuation = (Number(item.quantity) || 0) * (Number(item.askingPrice) || 0);

                  return (
                    <div
                      key={item.id}
                      className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 relative transition-all hover:border-emerald-300 shadow-2xs"
                    >
                      {/* Product Header / Numbering */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                            Product #{index + 1} Specifications
                          </span>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
                            title="Remove this product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Product</span>
                          </button>
                        )}
                      </div>

                      {/* Input Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Product Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={item.productName}
                            onChange={(e) => handleUpdateItem(item.id, 'productName', e.target.value)}
                            placeholder="e.g. Tender Care Protecting Balm with Organic Honey"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        {/* Oriflame SKU Code */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Oriflame SKU Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={item.sku}
                            onChange={(e) => handleUpdateItem(item.id, 'sku', e.target.value)}
                            placeholder="e.g. 12760"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Category
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value as Category)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-700"
                          >
                            <option value="Skincare">Skincare</option>
                            <option value="Wellness by Oriflame">Wellness by Oriflame</option>
                            <option value="Fragrance & Perfumes">Fragrance & Perfumes</option>
                            <option value="Makeup & Color">Makeup & Color</option>
                            <option value="Hair & Personal Care">Hair & Personal Care</option>
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Quantity (Units) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        {/* Clearance Asking Price */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Asking Price (₹ / unit) *
                          </label>
                          <input
                            type="number"
                            min="10"
                            step="10"
                            required
                            value={item.askingPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'askingPrice', Math.max(10, Number(e.target.value)))}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-bold font-mono focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        {/* Product Mnf Date (mm/yy) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-stone-700">
                              Product Mnf Date *
                            </label>
                            <span className="text-[10px] text-stone-400 font-mono">mm/yy</span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={item.mnfDate}
                              onChange={(e) => handleUpdateItem(item.id, 'mnfDate', formatMmYy(e.target.value))}
                              placeholder="04/24"
                              className="w-full pl-8 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700"
                            />
                            <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1">
                            Month / Year manufactured
                          </p>
                        </div>

                        {/* Expiry Date (mm/yy) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-stone-700">
                              Expiry Date *
                            </label>
                            <span className="text-[10px] text-stone-400 font-mono">mm/yy</span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={item.expiryDate}
                              onChange={(e) => handleUpdateItem(item.id, 'expiryDate', formatMmYy(e.target.value))}
                              placeholder="12/26"
                              className="w-full pl-8 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono focus:outline-none focus:border-emerald-700"
                            />
                            <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1">
                            Min. 12 months shelf life
                          </p>
                        </div>

                        {/* Condition */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            Package Condition
                          </label>
                          <select
                            value={item.condition}
                            onChange={(e) => handleUpdateItem(item.id, 'condition', e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-700"
                          >
                            <option value="Factory Sealed">Factory Sealed (Original Cellophane)</option>
                            <option value="Mint Boxed">Mint Boxed (Unopened Carton)</option>
                            <option value="Store Display">Store Display (Pristine Unused)</option>
                          </select>
                        </div>

                        {/* Product Details (Unlimited Words) */}
                        <div className="sm:col-span-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Product Details (Unlimited Words)</span>
                            </label>
                            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Unlimited Words / Description
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={item.productDetails}
                            onChange={(e) => handleUpdateItem(item.id, 'productDetails', e.target.value)}
                            placeholder="Enter detailed description, key Swedish ingredients, skin benefits, shades/aroma notes, volume/size, packaging condition, or any specific details for the buyer (no word limit)..."
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700 leading-relaxed resize-y"
                          />
                        </div>
                        {/* Product Photo / Batch Image Upload (Optional) */}
                        <div className="sm:col-span-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Product Image / Photo Proof (Optional)</span>
                            </label>
                            <span className="text-[10px] text-stone-500 font-medium">
                              Attach real batch photo or Swedish catalog image
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* File Upload Button / Drag-and-drop */}
                            <label className="flex-1 border border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold text-stone-700">
                              <Upload className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span className="truncate">
                                {item.imageUrl ? 'Change Photo / File' : 'Upload Photo (Phone / PC)'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('Image exceeds 5MB limit.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const dataUrl = event.target?.result as string;
                                    if (dataUrl) {
                                      handleUpdateItem(item.id, 'imageUrl', dataUrl);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>

                            {/* Or Direct Image Link */}
                            <input
                              type="url"
                              value={item.imageUrl && !item.imageUrl.startsWith('data:') ? item.imageUrl : ''}
                              onChange={(e) => handleUpdateItem(item.id, 'imageUrl', e.target.value)}
                              placeholder="Or paste image URL (https://...)"
                              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-700 font-mono"
                            />

                            {/* Preview Thumbnail if present */}
                            {item.imageUrl && (
                              <div className="relative w-11 h-11 rounded-lg border border-stone-300 bg-white p-0.5 overflow-hidden shrink-0 group">
                                <img
                                  src={item.imageUrl}
                                  alt="Item thumbnail"
                                  className="w-full h-full object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, 'imageUrl', '')}
                                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Remove image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Subtotal Bar */}
                      <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Product #{index + 1} Valuation ({item.quantity} × ₹{item.askingPrice}):
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          ₹{itemValuation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "+ Add Another Product (Optional)" Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="add-multiple-product-btn"
                  onClick={handleAddItem}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>+ Add Another Product (Optional)</span>
                </button>
              </div>

              {/* Combined Total Valuation Summary */}
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Total Combined Inventory:</span>
                  <span className="font-bold text-stone-800 text-sm">
                    {items.length} Product Listing{items.length > 1 ? 's' : ''} ({totalUnits} Total Units)
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-stone-500 block">Total Gross Clearance Valuation:</span>
                  <span className="font-mono font-bold text-lg text-emerald-900">
                    ₹{totalGrossValuation.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Terms & Conditions Timeline */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Clearance Process Timeline & Terms</span>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  4-Stage Liquidation Protocol
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow-xs flex items-center justify-center text-[9px] text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Digital Intake & Oriflame SKU Match (0 – 2 Hours)
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Your registered Oriflame Brand Partner ID and SKU details are cross-referenced with Sweden/India catalog master data for authentic clearance listing.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow-xs flex items-center justify-center text-[9px] text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Quality Seal & Expiry Audit (Kolkata SPO Hub)
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      All products must be 100% genuine, factory-sealed, unadulterated with minimum 12 months shelf life remaining prior to dispatch.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow-xs flex items-center justify-center text-[9px] text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Pan-India Marketplace Liquidation (1 – 3 Business Days)
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Inventory is promoted through Team Golden Star's high-traffic clearance marketplace and digital buyer channels.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-800 border-2 border-white shadow-xs flex items-center justify-center text-[9px] text-white font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Direct Payout Settlement (Instant on Clearance)
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                      Liquidation proceeds are transferred directly to your designated UPI ID or Bank Account immediately upon clearance allocation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Acceptance Checkbox */}
              <div className="pt-3 border-t border-stone-100">
                <label 
                  htmlFor="terms-agreement-checkbox"
                  className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-emerald-300 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id="terms-agreement-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 block">
                      I accept the Terms & Conditions and Quality Guidelines
                    </span>
                    <span className="text-[11px] text-stone-500 leading-normal">
                      I confirm that the listed Oriflame products are authentic, unopened, factory-sealed, and agree to the 4-stage Team Golden Star liquidation protocol verified under Subhashree Ghosh.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {!isStandaloneView && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                id="submit-brand-partner-intake-btn"
                disabled={!acceptedTerms}
                className={`px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs ${
                  acceptedTerms
                    ? 'bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Clearance Intake ({items.length} Product{items.length > 1 ? 's' : ''})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (isStandaloneView) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      {content}
    </div>
  );
};
