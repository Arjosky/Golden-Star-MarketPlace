import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Eye, 
  Calendar, 
  ShieldCheck,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discountPercent = Math.round(((product.mrp - product.clearancePrice) / product.mrp) * 100);
  const savingsINR = product.mrp - product.clearancePrice;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Check if product has an admin-verified uploaded photo
  const isVerifiedPhoto = Boolean(
    (product.isVerifiedImage || 
     product.imageUrl?.startsWith('data:') || 
     product.imageUrl?.startsWith('blob:')) &&
    !product.imageUrl?.includes('logo-bw')
  );

  // Fallback authentic B&W Team Golden Star logo
  const fallbackImage = '/team-golden-star-logo-bw.svg';
  const displayImage = isVerifiedPhoto ? (imgError ? fallbackImage : product.imageUrl) : fallbackImage;

  return (
    <div
      id={`product-card-${product.sku}`}
      className="group relative glass-card hover:border-[#0a7d4f]/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {/* 500x500px Aspect Ratio Image Container */}
      <div 
        className="relative w-full aspect-square bg-white/70 overflow-hidden cursor-pointer border-b border-stone-200/50 flex items-center justify-center"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={displayImage}
          alt={product.title}
          onError={() => setImgError(true)}
          className={`w-full h-full ${
            isVerifiedPhoto 
              ? 'object-cover object-center' 
              : 'object-contain p-8 bg-[#faf8f5]'
          } group-hover:scale-105 transition-transform duration-500`}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          {/* SKU Code Pill */}
          <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#1c2b24] text-[11px] font-mono font-bold tracking-wider border border-stone-200 backdrop-blur-xs shadow-xs">
            SKU {product.sku}
          </span>

          {/* Discount Pill */}
          <span className="px-2.5 py-1 rounded-full bg-[#fff2cc] text-[#075c3a] text-[11px] font-extrabold tracking-tight border border-[#d4a017]/40 shadow-xs">
            SAVE {discountPercent}%
          </span>
        </div>

        {/* Bottom Status Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          {/* Prime Flash Tag (if applicable) */}
          {product.isPrimeFlash ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50/95 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-rose-600 fill-rose-600" />
              Flash Deal
            </span>
          ) : <div />}

          {/* Verification Status Pill */}
          {isVerifiedPhoto ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1c2b24]/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold backdrop-blur-xs shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1c2b24]/85 text-amber-200 text-[10px] font-medium backdrop-blur-xs shadow-xs border border-stone-700/60">
              <Camera className="w-3 h-3 text-[#d4a017]" />
              <span>SPO Hub Spec</span>
            </span>
          )}
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-[#1c2b24]/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="px-4 py-2 rounded-full bg-white/95 text-[#1c2b24] text-xs font-bold hover:bg-white border border-stone-200 flex items-center gap-1.5 shadow-md backdrop-blur-md transition-transform transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#0a7d4f]" />
            <span>Inspect Spec &amp; Batch</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Volume */}
          <div className="flex items-center justify-between text-[11px] text-[#5b6b63] mb-1 font-medium">
            <span className="text-[#0a7d4f] font-bold uppercase tracking-wider text-[10px]">{product.category}</span>
            <span>{product.volume}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm sm:text-base font-serif font-bold text-[#1c2b24] hover:text-[#0a7d4f] transition-colors line-clamp-1 cursor-pointer mb-1"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Subtitle / Key Extract */}
          <p className="text-xs text-[#5b6b63] line-clamp-1 mb-2">
            {product.subtitle || product.swedishExtracts.join(', ')}
          </p>

          {/* Expiry & Verified Batch */}
          <div className="flex items-center justify-between text-[11px] bg-stone-50/90 rounded-xl px-2.5 py-1.5 border border-stone-200/60 text-[#5b6b63] font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              Exp: <strong className="text-stone-800 font-sans">{product.expiryDate}</strong>
            </span>
            <span className="flex items-center gap-1 text-[#0a7d4f] font-sans text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              Batch {product.batchCode}
            </span>
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-stone-200/50">
          <div className="flex items-baseline justify-between gap-2 mb-2.5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-[#1c2b24] font-mono tracking-tight">
                  ₹{product.clearancePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#0a7d4f] font-semibold">
                Save ₹{savingsINR.toLocaleString('en-IN')} (Stockholm Hub)
              </p>
            </div>

            {/* Stock status pill */}
            <div className="text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                product.stock <= 5 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50 text-[#075c3a] border border-emerald-200'
              }`}>
                {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            id={`add-to-cart-btn-${product.sku}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              product.stock === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] hover:opacity-95 text-white shadow-md shadow-[#0a7d4f]/20 hover:scale-[1.01]'
            }`}
          >
            {product.stock === 0 ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Dispatch Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • 30-Day Guarantee</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
