import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Search, 
  Clock, 
  Send, 
  Zap, 
  Package, 
  SlidersHorizontal,
  Play,
  Pause,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MarketplaceSlidePageProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  onOpenCart: () => void;
  totalCartCount: number;
}

const CATEGORIES: Category[] = [
  'All',
  'Prime Flash Deals',
  'Skincare',
  'Fragrance & Perfumes',
  'Wellness by Oriflame',
  'Makeup & Color',
  'Hair & Personal Care'
];

export const MarketplaceSlidePage: React.FC<MarketplaceSlidePageProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onViewDetails,
  onOpenCart,
  totalCartCount
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Resume autoplay whenever the showcase is opened
  useEffect(() => {
    if (isOpen) {
      setIsAutoPlay(true);
    }
  }, [isOpen]);

  // Filter active products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (item.status !== 'active') return false;

      if (selectedCategory === 'Prime Flash Deals') {
        if (!item.isPrimeFlash) return false;
      } else if (selectedCategory !== 'All') {
        if (item.category !== selectedCategory) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesExtract = item.swedishExtracts.some(e => e.toLowerCase().includes(q));
        return matchesSku || matchesTitle || matchesCat || matchesExtract;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Keep index within bounds when filtered list updates
  useEffect(() => {
    if (currentIndex >= filteredProducts.length) {
      setCurrentIndex(Math.max(0, filteredProducts.length - 1));
    }
  }, [filteredProducts.length, currentIndex]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredProducts.length, currentIndex]);

  // Auto-play interval
  useEffect(() => {
    if (!isOpen || !isAutoPlay || filteredProducts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen, isAutoPlay, filteredProducts.length]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProduct: Product | undefined = filteredProducts[currentIndex];

  const handleNext = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
  };

  const handlePrev = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
  };

  const handleQuickAdd = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onAddToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const scrollStrip = (direction: 'left' | 'right') => {
    if (stripRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      stripRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Image resolution
  const fallbackImage = '/team-golden-star-logo-bw.svg';
  const getProductImage = (item: Product) => {
    const isVerified = Boolean(
      (item.isVerifiedImage || item.imageUrl?.startsWith('data:') || item.imageUrl?.startsWith('blob:')) &&
      !item.imageUrl?.includes('logo-bw')
    );
    return isVerified && item.imageUrl ? item.imageUrl : fallbackImage;
  };

  const currentDiscount = currentProduct
    ? Math.round(((currentProduct.mrp - currentProduct.clearancePrice) / currentProduct.mrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[92vw] lg:w-[84vw] max-w-6xl bg-[#fbf9f5] shadow-2xl flex flex-col border-l border-emerald-900/20 transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-extrabold text-stone-900 tracking-tight truncate">
                  {language === 'en' ? 'Marketplace Express' : 'মার্কেটপ্লেস এক্সপ্রেস'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 uppercase tracking-wide">
                  {language === 'en' ? 'Automatic Showcase' : 'অটোমেটিক শোকেস'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Subhashree Ghosh Org • Sealed Stockholm Formulation SPO Node Dumdum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">{language === 'en' ? 'Cart' : 'ব্যাগ'}</span>
              <span className="bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {totalCartCount}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer border border-stone-200"
              title="Close Sliding Page (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#f3f0e8] border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                  }`}
                >
                  {cat === 'Prime Flash Deals' && '⚡ '}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder={language === 'en' ? 'Search SKU or name...' : 'পণ্যের নাম বা SKU খুঁজুন...'}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-12 space-y-3">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800 font-serif">
                {language === 'en' ? 'No items found' : 'কোনো পণ্য পাওয়া যায়নি'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'en' ? 'Try changing your category filter or search query.' : 'ক্যাটাগরি ফিল্টার বা সার্চ শব্দ পরিবর্তন করুন।'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setCurrentIndex(0);
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                {language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট'}
              </button>
            </div>
          ) : currentProduct ? (
            <>
              {/* PRIMARY HERO SLIDER CARD */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg overflow-hidden relative">
                {/* Top Navigation & Counter Strip */}
                <div className="px-5 py-3 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 font-mono text-xs">
                      Slide {currentIndex + 1} / {filteredProducts.length}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-800 font-semibold truncate max-w-[200px]">
                      {currentProduct.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Auto-play toggle */}
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        isAutoPlay 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                      title="Auto slide through products"
                    >
                      {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isAutoPlay ? 'Auto-slide ON' : 'Auto-slide'}</span>
                    </button>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrev}
                        className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition cursor-pointer"
                        title="Previous Product (Left Arrow)"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition cursor-pointer"
                        title="Next Product (Right Arrow)"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Product Body */}
                <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
                  {/* Left: Product Image & Badges */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div 
                      className="relative w-full aspect-square max-w-[340px] rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden flex items-center justify-center cursor-pointer group"
                      onClick={() => onViewDetails(currentProduct)}
                    >
                      <img
                        src={getProductImage(currentProduct)}
                        alt={currentProduct.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Discount Badge */}
                      {currentDiscount > 0 && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-md">
                          {currentDiscount}% {t('catalog.off', 'OFF')}
                        </div>
                      )}

                      {/* Prime Flash Badge */}
                      {currentProduct.isPrimeFlash && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-extrabold text-[11px] shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-current" />
                          <span>FLASH</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                        SKU {currentProduct.sku}
                      </div>
                    </div>

                    {/* Stock Indicator */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${currentProduct.stock > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-medium text-stone-600">
                        {currentProduct.stock > 0 
                          ? `${currentProduct.stock} units available at SPO Hub` 
                          : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Details, Pricing, Swedish Formula & Actions */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#0a7d4f] font-bold uppercase tracking-wider mb-1">
                        <span>Stockholm Formula</span>
                        <span>•</span>
                        <span>Dumdum Hub 700077</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900 leading-snug">
                        {currentProduct.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                        {currentProduct.description}
                      </p>
                    </div>

                    {/* Swedish Extracts */}
                    {currentProduct.swedishExtracts && currentProduct.swedishExtracts.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          Key Swedish Ingredients:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentProduct.swedishExtracts.map((extract, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold"
                            >
                              🌿 {extract}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing Card */}
                    <div className="p-4 rounded-2xl bg-[#f8f5ee] border border-stone-200 flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-stone-500 font-semibold block">
                          Direct Clearance Rate
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                            ₹{currentProduct.clearancePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-stone-400 line-through">
                            MRP ₹{currentProduct.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                          Save ₹{(currentProduct.mrp - currentProduct.clearancePrice).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-1">
                          + 5% BP Concession Valid
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => handleQuickAdd(currentProduct)}
                        disabled={currentProduct.stock <= 0}
                        className={`flex-1 min-w-[160px] py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                          addedProductId === currentProduct.id
                            ? 'bg-emerald-700 text-white'
                            : currentProduct.stock <= 0
                            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-900/15'
                        }`}
                      >
                        {addedProductId === currentProduct.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{language === 'en' ? 'Added to Bag!' : 'ব্যাগে যোগ হয়েছে!'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>
                              {currentProduct.stock <= 0 
                                ? (language === 'en' ? 'Out of Stock' : 'স্টক শেষ')
                                : (language === 'en' ? 'Add to Bag' : 'ব্যাগে যোগ করুন')}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onViewDetails(currentProduct)}
                        className="py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-stone-600" />
                        <span>{language === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}</span>
                      </button>

                      <a
                        href={`https://wa.me/917003146399?text=${encodeURIComponent(`Hi Arjo, I want to order ${currentProduct.title} (SKU: ${currentProduct.sku}) at clearance price Rs. ${currentProduct.clearancePrice}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-2xl bg-[#e7f8ef] hover:bg-[#d8f3e5] text-emerald-800 border border-emerald-300 flex items-center justify-center transition cursor-pointer"
                        title="Instant WhatsApp Order"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Trust Guarantees */}
                    <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>30-Day Money-Back Guarantee</span>
                      </span>
                      <span>•</span>
                      <span>Sealed Batch Hologram</span>
                      <span>•</span>
                      <span>SPO Code 29435 Dumdum</span>
                    </div>
                  </div>
                </div>

                {/* Dot Pagination Bar */}
                <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-200 flex items-center justify-center gap-1.5 overflow-x-auto max-w-full">
                  {filteredProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-emerald-800'
                          : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                      title={`Go to item ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* HORIZONTAL SLIDING TRAY / CONVEYOR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider">
                      {language === 'en' ? 'More Products in this Shelf' : 'এই বিভাগের আরও পণ্য'}
                    </h4>
                    <span className="text-xs text-stone-500">({filteredProducts.length} items)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollStrip('left')}
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollStrip('right')}
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scroll Area */}
                <div 
                  ref={stripRef}
                  className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-thin"
                >
                  {filteredProducts.map((item, idx) => {
                    const isCurrent = idx === currentIndex;
                    const discount = Math.round(((item.mrp - item.clearancePrice) / item.mrp) * 100);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-48 sm:w-56 shrink-0 rounded-2xl p-3 bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md bg-emerald-50/20'
                            : 'border-stone-200 hover:border-stone-300 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-xl bg-stone-50 overflow-hidden mb-2 flex items-center justify-center">
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              className="w-full h-full object-contain p-2"
                              loading="lazy"
                            />
                            {discount > 0 && (
                              <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-600 text-white">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">SKU {item.sku}</span>
                          <h5 className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5 leading-snug">
                            {item.title}
                          </h5>
                        </div>

                        <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-stone-900">
                              ₹{item.clearancePrice}
                            </span>
                            <span className="text-[10px] text-stone-400 line-through block">
                              ₹{item.mrp}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleQuickAdd(item, e)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-stone-500 font-medium">
            Use <strong className="text-stone-700">← / →</strong> keyboard arrows or touch swipe to slide products.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Back to Marketplace' : 'মার্কেটপ্লেসে ফিরুন'}
            </button>
            <button
              onClick={onOpenCart}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'View Cart & Checkout' : 'কার্ট দেখুন ও চেকআউট'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
