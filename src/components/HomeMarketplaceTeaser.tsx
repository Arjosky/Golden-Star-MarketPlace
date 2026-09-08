import React from 'react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Truck, 
  Percent, 
  Flame, 
  HeartHandshake,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HomeMarketplaceTeaserProps {
  onGoToMarketplace: (category?: Category) => void;
  onOpenSlidingPage?: () => void;
  totalProductCount: number;
}

export const HomeMarketplaceTeaser: React.FC<HomeMarketplaceTeaserProps> = ({
  onGoToMarketplace,
  onOpenSlidingPage,
  totalProductCount,
}) => {
  const { language, t } = useLanguage();

  const categories: { name: Category; labelEn: string; labelBn: string; countText: string; icon: string; bg: string }[] = [
    { 
      name: 'Prime Flash Deals', 
      labelEn: 'Prime Flash Deals', 
      labelBn: 'প্রাইম ফ্ল্যাশ ডিলস', 
      countText: 'Up to 60% Off', 
      icon: '⚡', 
      bg: 'from-amber-500/10 to-rose-500/10 border-amber-200 hover:border-amber-400' 
    },
    { 
      name: 'Skincare', 
      labelEn: 'Swedish Skincare', 
      labelBn: 'সুইডিশ স্কিনকেয়ার', 
      countText: 'NovAge & Optimals', 
      icon: '✨', 
      bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 hover:border-emerald-400' 
    },
    { 
      name: 'Fragrance & Perfumes', 
      labelEn: 'Fragrances & Perfumes', 
      labelBn: 'সুগন্ধি ও পারফিউম', 
      countText: 'Giordani & Possess', 
      icon: '💎', 
      bg: 'from-purple-500/10 to-indigo-500/10 border-purple-200 hover:border-purple-400' 
    },
    { 
      name: 'Wellness by Oriflame', 
      labelEn: 'Wellness by Oriflame', 
      labelBn: 'ওয়েলনেস সাপ্লিমেন্ট', 
      countText: 'Omega-3 & Nutrishake', 
      icon: '🌿', 
      bg: 'from-lime-500/10 to-emerald-500/10 border-lime-200 hover:border-lime-400' 
    },
    { 
      name: 'Makeup & Color', 
      labelEn: 'Makeup & Color', 
      labelBn: 'মেকআপ ও কসমেটিক্স', 
      countText: 'THE ONE & Giordani', 
      icon: '💄', 
      bg: 'from-rose-500/10 to-pink-500/10 border-rose-200 hover:border-rose-400' 
    },
    { 
      name: 'Hair & Personal Care', 
      labelEn: 'Hair & Personal Care', 
      labelBn: 'হেয়ার ও পার্সোনাল কেয়ার', 
      countText: 'Milk & Honey Gold', 
      icon: '🛁', 
      bg: 'from-amber-500/10 to-orange-500/10 border-amber-200 hover:border-amber-400' 
    },
  ];

  return (
    <section 
      id="homeMarketplaceTeaserSection" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0a3e2a] via-[#0d5238] to-[#072c1e] text-white p-8 sm:p-12 lg:p-14 shadow-2xl border border-emerald-600/30">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left Description Column */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'en' ? 'Dedicated Clearance Storefront' : 'ডেডিকেটেড ক্লিয়ারেন্স মার্কেটপ্লেস'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-white font-mono">{totalProductCount}+ Items</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'en' ? (
                <>
                  Explore the Complete <br className="hidden sm:inline" />
                  <span className="text-amber-300">Oriflame Sweden Marketplace</span>
                </>
              ) : (
                <>
                  সম্পূর্ণ অরিজিনাল <br className="hidden sm:inline" />
                  <span className="text-amber-300">সুইডিশ ওরিফ্লেম মার্কেটপ্লেস</span> দেখুন
                </>
              )}
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              {language === 'en'
                ? 'Looking to purchase genuine European certified skincare, fragrance, or wellness formulations? Step into our separate, full-featured marketplace with live inventory, SKU filters, verified batch codes, and wholesale clearance rates up to 60% off.'
                : 'অথেন্টিক সুইডিশ স্কিনকেয়ার, পারফিউম বা ওয়েলনেস সামগ্রী খুঁজছেন? আমাদের সম্পূর্ণ আলাদা ডেডিকেটেড মার্কেটপ্লেস পেজে প্রবেশ করুন—যেখানে রয়েছে লাইভ স্টক, এসকেইউ সার্চ, সিল্ড ব্যাচ ভেরিফিকেশন এবং সর্বোচ্চ ৬০% পর্যন্ত ক্লিয়ারেন্স ছাড়।'}
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-emerald-100 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>100% Genuine SPO Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Dumdum Hub 700077</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>30-Day Money-Back</span>
              </div>
            </div>
          </div>

          {/* Right CTA Actions Column */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full lg:w-auto shrink-0">
            <button
              id="home-teaser-open-marketplace-btn"
              onClick={() => onGoToMarketplace('All')}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-stone-950" />
              <span>{t('home.openMarketplace', 'Open Full Marketplace Page')}</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>

            {onOpenSlidingPage && (
              <button
                id="home-teaser-open-sliding-btn"
                onClick={onOpenSlidingPage}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>{language === 'en' ? 'Open Sliding Showcase Page' : 'স্লাইডিং শোকেস পেজ খুলুন'}</span>
              </button>
            )}

            <div className="text-center lg:text-left text-[11px] text-emerald-200/80 pt-1">
              Verified by Diamond Director Subhashree Ghosh
            </div>
          </div>
        </div>

        {/* Category Fast-Launch Grid */}
        <div className="mt-10 pt-8 border-t border-emerald-700/60">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('home.categoriesTitle', 'Quick Category Access')}
            </span>
            <button
              onClick={() => onGoToMarketplace('All')}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('home.viewAllProducts', 'View All Products')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => onGoToMarketplace(cat.name)}
                className={`p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border text-left transition-all hover:scale-[1.03] flex flex-col justify-between gap-2 cursor-pointer ${cat.bg}`}
              >
                <div className="text-2xl">{cat.icon}</div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {language === 'en' ? cat.labelEn : cat.labelBn}
                  </h4>
                  <p className="text-[10px] text-emerald-200/80 font-medium">
                    {cat.countText}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
