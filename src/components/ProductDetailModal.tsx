import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Leaf, 
  Truck,
  MessageCircle,
  Plus,
  Minus,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const discountPercent = Math.round(((product.mrp - product.clearancePrice) / product.mrp) * 100);
  const savingsINR = (product.mrp - product.clearancePrice) * qty;
  const totalPrice = product.clearancePrice * qty;

  const isVerifiedPhoto = Boolean(
    (product.isVerifiedImage || 
     product.imageUrl?.startsWith('data:') || 
     product.imageUrl?.startsWith('blob:')) &&
    !product.imageUrl?.includes('logo-bw')
  );

  const fallbackImage = '/team-golden-star-logo-bw.svg';
  const displayImage = isVerifiedPhoto ? (imgError ? fallbackImage : product.imageUrl) : fallbackImage;

  const handleAdd = () => {
    onAddToCart(product, qty);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  const handleDirectWhatsApp = () => {
    const text = `Hello Biswajit Roy (Arjo) | Team Golden Star,
I want to order:
• ${product.title} (SKU: ${product.sku})
• Quantity: ${qty} units
• Clearance Price: ₹${product.clearancePrice} each (Total: ₹${totalPrice})
• Batch Code: ${product.batchCode}
Please confirm availability and dispatch via Kolkata SPO.`;
    window.open(`https://wa.me/917003146399?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="relative bg-white border border-stone-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image 500x500 style */}
        <div className="md:w-1/2 bg-stone-50 relative flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-200">
          <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white flex items-center justify-center">
            <img
              src={displayImage}
              alt={product.title}
              onError={() => setImgError(true)}
              className={`w-full h-full ${
                isVerifiedPhoto 
                  ? 'object-cover' 
                  : 'object-contain p-8 bg-stone-50/90'
              }`}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="px-2.5 py-1 rounded-md bg-white/95 text-stone-900 text-xs font-mono font-bold border border-stone-200 shadow-xs">
                SKU: {product.sku}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-xs font-extrabold w-fit shadow-xs">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Bottom Status Pill */}
            <div className="absolute bottom-3 right-3 z-10">
              {isVerifiedPhoto ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Stock Photo</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-900/80 text-stone-300 text-xs font-medium border border-stone-700/60 shadow-xs">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verified Photo Pending</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Information */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{product.category} • {product.volume}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif leading-snug mb-2">
              {product.title}
            </h2>

            {product.subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 mb-4 font-medium">
                {product.subtitle}
              </p>
            )}

            {/* Pricing Details */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl font-extrabold text-stone-900">
                  ₹{product.clearancePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  MRP ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Save ₹{(product.mrp - product.clearancePrice).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Official Swedish Clearance Stock • Guaranteed Authentic
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Swedish Botanical Extracts */}
            <div className="mb-4">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                Active Swedish Botanical Extracts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.swedishExtracts.map((extract, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                  >
                    {extract}
                  </span>
                ))}
              </div>
            </div>

            {/* Provenance & Batch */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Batch Code: <strong className="text-stone-900">{product.batchCode}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Expiry: <strong className="text-stone-900">{product.expiryDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Truck className="w-4 h-4 text-sky-700" />
                <span>Operator Custody: <strong className="text-stone-900">Biswajit Roy (Arjo)</strong></span>
              </div>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Select Quantity:</span>
              <div className="flex items-center gap-3 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-bold w-6 text-center text-stone-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {qty > 1 && (
              <div className="flex justify-between text-xs text-stone-600">
                <span>Total for {qty} units:</span>
                <span className="font-bold text-stone-900">
                  ₹{totalPrice.toLocaleString('en-IN')} (Saved ₹{savingsINR.toLocaleString('en-IN')})
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                id="modal-add-to-cart-btn"
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  product.stock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                id="modal-whatsapp-direct-btn"
                onClick={handleDirectWhatsApp}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
