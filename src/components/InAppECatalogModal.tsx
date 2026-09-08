import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types';

interface InAppECatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProductDetails: (product: Product) => void;
}

interface CatalogSpread {
  pageNumber: number;
  themeTitle: string;
  themeSubtitle: string;
  heroBadge: string;
  coverImage: string;
  description: string;
  featuredSkus: string[];
}

const CATALOG_SPREADS: CatalogSpread[] = [
  {
    pageNumber: 1,
    themeTitle: 'The Royal Swedish Skin Therapy',
    themeSubtitle: 'NovAge & Tender Care Iconic Formulations',
    heroBadge: 'Stock Clearance: Up to 55% OFF',
    coverImage: '/products/catalog-skin.svg',
    description: 'Powered by patented Bio Aspartolift, Lingonberry seed extract, and organic beeswax. Original Swedish laboratory batches verified at Kolkata SPO.',
    featuredSkus: ['12760', '38531']
  },
  {
    pageNumber: 2,
    themeTitle: 'Stockholm Haute Parfumerie',
    themeSubtitle: 'Eclat & Possess Master Crafted Scents',
    heroBadge: 'Collector Stock: Up to 50% OFF',
    coverImage: '/products/catalog-fragrance.svg',
    description: 'Fragrances distilled in Grasse, France & Stockholm. Featuring Swedish birch bark, frosted pine, and regal orris accents. 100% factory sealed bottles.',
    featuredSkus: ['35651', '33650']
  },
  {
    pageNumber: 3,
    themeTitle: 'Scandinavian Nutritional Vitality',
    themeSubtitle: 'Wellness by Oriflame Astaxanthin & Swedish Omega 3',
    heroBadge: 'Wellness Clearance: 95% Liquidity Rate',
    coverImage: '/products/catalog-wellness.svg',
    description: 'Harvested from the Stockholm Archipelago. Formulated with natural astaxanthin and certified non-GMO fish oil in pharmaceutical grade facilities.',
    featuredSkus: ['29683', '29705']
  },
  {
    pageNumber: 4,
    themeTitle: 'Pure Botanical Botanical Cleansing',
    themeSubtitle: 'Love Nature Organic Extracts & Hair Oils',
    heroBadge: 'Daily Essentials: Up to 58% OFF',
    coverImage: '/products/catalog-novage.svg',
    description: 'Infused with organic tea tree, Mexican lime, and cold-pressed coconut oils. Biodegradable formulas bottled with post-consumer recycled materials.',
    featuredSkus: ['34843', '31614', '30861']
  }
];

export const InAppECatalogModal: React.FC<InAppECatalogModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onViewProductDetails
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [addedSku, setAddedSku] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSpread = CATALOG_SPREADS[currentPageIndex];
  const matchedProducts = products.filter(p => currentSpread.featuredSkus.includes(p.sku));

  const handleQuickAdd = (p: Product) => {
    onAddToCart(p);
    setAddedSku(p.sku);
    setTimeout(() => setAddedSku(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white border border-stone-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">In-App Swedish E-Catalog</span>
                <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Spread {currentPageIndex + 1} of {CATALOG_SPREADS.length}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                {currentSpread.themeTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <span>Personal Store Catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9F6]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Catalog Page Graphic Display */}
            <div className="lg:col-span-6 relative group overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 aspect-[4/3] sm:aspect-[16/10] flex items-end shadow-sm">
              <img
                src={currentSpread.coverImage}
                alt={currentSpread.themeTitle}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
              
              <div className="relative z-10 p-5 space-y-2 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-bold text-[11px] uppercase tracking-wider">
                  {currentSpread.heroBadge}
                </span>
                <h3 className="text-xl font-bold text-white font-serif drop-shadow-md">
                  {currentSpread.themeTitle}
                </h3>
                <p className="text-xs text-stone-200 line-clamp-2">
                  {currentSpread.description}
                </p>
              </div>
            </div>

            {/* Featured SKUs on this Catalog Spread */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Interactive Products on this Spread ({matchedProducts.length})</span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Direct Swedish Stock</span>
              </div>

              <div className="space-y-3">
                {matchedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-16 h-16 object-cover rounded-xl bg-stone-50 border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          SKU {prod.sku}
                        </span>
                        <span className="text-[10px] text-stone-500 truncate">{prod.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5">{prod.title}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-extrabold text-stone-900 font-mono">
                          ₹{prod.clearancePrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ₹{prod.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {Math.round(((prod.mrp - prod.clearancePrice) / prod.mrp) * 100)}% OFF
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onViewProductDetails(prod)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        title="View Full Specifications"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickAdd(prod)}
                        disabled={prod.stock <= 0}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          addedSku === prod.sku
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {addedSku === prod.sku ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Swedish Botanical Verification: Batch tested with minimum 18 months expiry at Kolkata SPO.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-white px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentPageIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Spread</span>
          </button>

          <div className="flex items-center gap-1.5">
            {CATALOG_SPREADS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentPageIndex === idx ? 'bg-emerald-800 w-6' : 'bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPageIndex((prev) => Math.min(CATALOG_SPREADS.length - 1, prev + 1))}
            disabled={currentPageIndex === CATALOG_SPREADS.length - 1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span>Next Spread</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
