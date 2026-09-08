import React from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Award,
  Home
} from 'lucide-react';
import { Product, Category } from '../types';
import { CatalogSection } from './CatalogSection';
import { useLanguage } from '../context/LanguageContext';

interface MarketplacePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  onBackToHome: () => void;
  onOpenSlidingPage?: () => void;
  initialCategory?: Category;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  products,
  onAddToCart,
  onViewDetails,
  onBackToHome,
  onOpenSlidingPage,
  initialCategory = 'All',
}) => {
  const { language, t } = useLanguage();

  return (
    <div id="dedicatedMarketplacePage" className="min-h-screen py-6 space-y-6">
      {/* Top Breadcrumbs & Page Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          {/* Left Breadcrumb & Back button */}
          <div className="flex items-center gap-3">
            <button
              id="marketplace-back-to-home-btn"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Return to Home Page"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-800" />
              <span>{t('marketplace.backToHome', 'Back to Home')}</span>
            </button>

            <span className="text-stone-300">/</span>

            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
              <button 
                onClick={onBackToHome}
                className="flex items-center gap-1 hover:text-emerald-800 transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('nav.home', 'Home')}</span>
              </button>
              <span className="text-stone-400">›</span>
              <span className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {t('nav.marketplace', 'Marketplace')}
              </span>
            </div>
          </div>

          {/* Right Quick Tools */}
          <div className="flex items-center gap-2">
            {onOpenSlidingPage && (
              <button
                onClick={onOpenSlidingPage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Open Interactive Automatic Sliding Showcase"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'en' ? 'Automatic Sliding Showcase' : 'অটোমেটিক স্লাইডিং শোকেস'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Marketplace Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0C4A34] via-[#0E5C41] to-[#0A3D2B] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Swedish Stock Clearance Hub</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-mono font-bold border border-emerald-500/40">
                SPO 29435 Dumdum Central Node
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {t('marketplace.pageTitle', 'Team Golden Star Marketplace')}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t('marketplace.pageSubtitle', 'Direct clearance dispatch from Dumdum SPO 29435 • Sealed batch verification • 30-day money-back guarantee')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] sm:text-xs text-emerald-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>100% Genuine Scandinavian Formulations</span>
              </span>
              <span>•</span>
              <span>Up to 60% Clearance Discounts</span>
              <span>•</span>
              <span>Verified by Subhashree Ghosh (Diamond Director)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Search Section */}
      <CatalogSection
        products={products}
        onAddToCart={onAddToCart}
        onViewDetails={onViewDetails}
        onOpenSlidingPage={onOpenSlidingPage}
        initialCategory={initialCategory}
      />
    </div>
  );
};
