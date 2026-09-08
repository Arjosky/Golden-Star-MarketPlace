import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  X,
  PackageSearch,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Layers,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface CatalogSectionProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  onOpenECatalog?: () => void;
  onOpenSlidingPage?: () => void;
  initialCategory?: Category;
}

const CATEGORIES: { label: Category; shortBadge?: string }[] = [
  { label: 'All' },
  { label: 'Prime Flash Deals', shortBadge: '⚡ Flash' },
  { label: 'Skincare', shortBadge: 'Skin' },
  { label: 'Fragrance & Perfumes', shortBadge: 'Frag' },
  { label: 'Wellness by Oriflame', shortBadge: 'Well' },
  { label: 'Makeup & Color', shortBadge: 'Color' },
  { label: 'Hair & Personal Care', shortBadge: 'Hair' }
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  onAddToCart,
  onViewDetails,
  onOpenECatalog,
  onOpenSlidingPage,
  initialCategory = 'All',
}) => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [skuQuery, setSkuQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'discount' | 'price-asc' | 'price-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'sliding'>('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoSlide, setIsAutoSlide] = useState(true);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setCurrentSlideIndex(0);
    }
  }, [initialCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Active status check
      if (item.status !== 'active') return false;

      // Category filter
      if (selectedCategory === 'Prime Flash Deals') {
        if (!item.isPrimeFlash) return false;
      } else if (selectedCategory !== 'All') {
        if (item.category !== selectedCategory) return false;
      }

      // In stock check
      if (inStockOnly && item.stock <= 0) return false;

      // SKU Query or Name Search
      if (skuQuery.trim()) {
        const q = skuQuery.toLowerCase().trim();
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesExtract = item.swedishExtracts.some(e => e.toLowerCase().includes(q));
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesSku && !matchesTitle && !matchesExtract && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'discount') {
        const discA = (a.mrp - a.clearancePrice) / a.mrp;
        const discB = (b.mrp - b.clearancePrice) / b.mrp;
        return discB - discA;
      }
      if (sortBy === 'price-asc') return a.clearancePrice - b.clearancePrice;
      if (sortBy === 'price-desc') return b.clearancePrice - a.clearancePrice;
      // Default: featured (Prime flash first, then stock)
      if (a.isPrimeFlash && !b.isPrimeFlash) return -1;
      if (!a.isPrimeFlash && b.isPrimeFlash) return 1;
      return 0;
    });
  }, [products, selectedCategory, skuQuery, sortBy, inStockOnly]);

  const itemsPerSlide = 4;
  const totalSlides = Math.max(1, Math.ceil(filteredProducts.length / itemsPerSlide));
  const currentSlideProducts = useMemo(() => {
    const start = currentSlideIndex * itemsPerSlide;
    return filteredProducts.slice(start, start + itemsPerSlide);
  }, [filteredProducts, currentSlideIndex]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Automatic slide rotation in sliding shelf view
  useEffect(() => {
    if (viewMode !== 'sliding' || !isAutoSlide || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(timer);
  }, [viewMode, isAutoSlide, totalSlides]);

  return (
    <section id="shopSection" data-alias="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header & Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Oriflame Sweden Clearance Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Curated Swedish Catalog
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Search by Oriflame 5-digit SKU code, product title, or Swedish botanical ingredients.
            </p>
          </div>

          {/* SKU Query Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4 text-emerald-700" />
            </div>
            <input
              id="sku-query-bar"
              type="text"
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="Search SKU (e.g. 12760) or name..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-300 focus:border-emerald-600 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-colors shadow-xs"
            />
            {skuQuery && (
              <button
                onClick={() => setSkuQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar + In-App E-Catalog Launcher */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            {CATEGORIES.map(({ label, shortBadge }) => {
              const isSelected = selectedCategory === label;
              const isFlash = label === 'Prime Flash Deals';
              return (
                <button
                  key={label}
                  id={`category-pill-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategory(label)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isSelected
                      ? isFlash
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : 'bg-emerald-800 text-white font-bold shadow-xs'
                      : isFlash
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90'
                  }`}
                >
                  {isFlash && <Sparkles className="w-3.5 h-3.5 fill-current text-rose-200" />}
                  <span>{label}</span>
                  {shortBadge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white font-bold' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {shortBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Row: Sort, View Mode & Open Sliding Page */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
          <div className="flex items-center gap-4">
            <span className="font-medium text-stone-700">
              Showing <strong className="text-emerald-800 font-bold">{filteredProducts.length}</strong> authenticated items
            </span>

            <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded bg-white border-stone-300 text-emerald-700 focus:ring-emerald-700 w-3.5 h-3.5"
              />
              <span>In-stock only</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher (Grid vs Sliding Deck) */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                id="catalog-view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#0a7d4f]" />
                <span className="hidden sm:inline">{t('catalog.gridView', 'Grid')}</span>
              </button>
              <button
                id="catalog-view-sliding-btn"
                onClick={() => setViewMode('sliding')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'sliding' 
                    ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Sliding Deck View"
              >
                <Layers className="w-3.5 h-3.5 text-[#0a7d4f]" />
                <span className="hidden sm:inline">{t('catalog.slideDeck', 'Sliding View')}</span>
              </button>
            </div>

            {/* Launch Full Sliding Page Button */}
            {onOpenSlidingPage && (
              <button
                id="catalog-open-sliding-page-btn"
                onClick={onOpenSlidingPage}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                title="Open Dedicated Sliding Marketplace Page"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('catalog.openSliding', 'Open Sliding Page')}</span>
                <ArrowRight className="w-3 h-3 text-amber-200" />
              </button>
            )}

            <div className="flex items-center gap-1.5 border-l border-stone-200 pl-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-300 text-stone-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-600 shadow-2xs"
              >
                <option value="featured">Featured</option>
                <option value="discount">Highest Discount %</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content: Grid or Sliding Deck View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <PackageSearch className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1 font-serif">
            No matching Oriflame items found
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            We couldn't find items matching "{skuQuery}". Try searching another SKU code or change category filters.
          </p>
          <button
            onClick={() => {
              setSkuQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'sliding' ? (
        /* ↔️ SLIDING DECK VIEW */
        <div className="space-y-6">
          {/* Sliding Deck Controls Bar */}
          <div className="bg-white/90 border border-stone-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-stone-900">
                {language === 'en' ? 'Automatic Sliding Shelf' : 'অটোমেটিক স্লাইডিং শেলফ'}:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline">
                ({currentSlideProducts.length} items shown)
              </span>

              {/* Pause / Resume Button */}
              <button
                onClick={() => setIsAutoSlide(!isAutoSlide)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 cursor-pointer transition ml-2"
                title={isAutoSlide ? "Pause auto slide" : "Resume auto slide"}
              >
                {isAutoSlide ? (
                  <>
                    <Pause className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                    <span>Auto-slide On</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Dot Indicators */}
              <div className="hidden md:flex items-center gap-1 max-w-[200px] overflow-x-auto">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-6 bg-emerald-800'
                        : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Slide Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  id="slide-deck-prev-btn"
                  onClick={handlePrevSlide}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  id="slide-deck-next-btn"
                  onClick={handleNextSlide}
                  className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-xs"
                  title="Next Slide"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sliding Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300">
            {currentSlideProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Quick full sliding page banner */}
          {onOpenSlidingPage && (
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-amber-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm">
                    {language === 'en' ? 'Want a full immersive sliding experience?' : 'সম্পূর্ণ স্লাইডিং অভিজ্ঞতা চান?'}
                  </h4>
                  <p className="text-xs text-emerald-100">
                    {language === 'en' ? 'Slide through Stockholm formulas with auto-play, extracts inspection, and WhatsApp checkout.' : 'অটো-প্লে ও বিস্তারিত সুইডিশ ফর্মুলা সহ পুরো স্লাইডিং পেজ দেখুন।'}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenSlidingPage}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              >
                <span>{t('catalog.openSliding', 'Open Sliding Page')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ▦ GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
};
