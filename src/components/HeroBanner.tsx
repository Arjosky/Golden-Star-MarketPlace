import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  PackageCheck, 
  Send, 
  BookOpen, 
  ExternalLink, 
  Award, 
  Star,
  Eye,
  Layers,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { FlashSaleConfig, Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  flashConfig: FlashSaleConfig;
  onGoToMarketplace: (category?: Category) => void;
  onScrollToCatalog?: () => void;
  onOpenSellerPortal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  flashConfig,
  onGoToMarketplace,
  onScrollToCatalog,
  onOpenSellerPortal,
}) => {
  const { language, t } = useLanguage();

  // Active Catalog / Flash Offer Highlight Showcase
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<number>(0);

  // Countdown calculation
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const end = new Date(flashConfig.endsAt).getTime();
      const diff = Math.max(0, end - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [flashConfig.endsAt]);

  const digitalCatalogueUrl = "https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar";
  const officialStoreUrl = "https://shop.oriflame.com/IN-goldenstar";

  const catalogHighlights = (flashConfig.featuredOffers && flashConfig.featuredOffers.length > 0)
    ? flashConfig.featuredOffers
    : [
    {
      id: "flash-1",
      title: "NovAge Ecollagen Power Serum",
      code: "42255",
      category: "Skincare",
      tag: "Catalog Hero Offer",
      mrp: 2499,
      clearancePrice: 1699,
      badge: "Stockholm Bio-Patented",
      img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
      description: "Instantly reduces wrinkles by up to 49% with patented Tri-Peptide technology & low molecular hyaluronic acid."
    },
    {
      id: "flash-2",
      title: "Tender Care Natural Protecting Balm",
      code: "12760",
      category: "Skincare",
      tag: "Global Bestseller",
      mrp: 399,
      clearancePrice: 249,
      badge: "Pure Swedish Beeswax",
      img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
      description: "Iconic multi-purpose beeswax balm soothing dry lips, cuticles, elbows, and delicate skin."
    },
    {
      id: "flash-3",
      title: "Giordani Gold Essenza Parfum",
      code: "38531",
      category: "Fragrance & Perfumes",
      tag: "Luxury Swedish Haute",
      mrp: 3999,
      clearancePrice: 2599,
      badge: "Orange Blossom Luxury",
      img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
      description: "Sensual floral woody parfum infused with patented Orange Blossom Luxury Essenza floral note."
    },
    {
      id: "flash-4",
      title: "Swedish Astaxanthin & Bilberry Extract",
      code: "38534",
      category: "Wellness by Oriflame",
      tag: "Youth Longevity Seal",
      mrp: 2299,
      clearancePrice: 1599,
      badge: "6000x Stronger than Vit C",
      img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      description: "Harvested from the Stockholm archipelago; supreme natural antioxidant shield against cellular oxidative stress."
    }
  ];

  const activeIndex = selectedCatalogCategory < catalogHighlights.length ? selectedCatalogCategory : 0;
  const currentHighlight = catalogHighlights[activeIndex] || catalogHighlights[0];

  return (
    <section id="hero-gradient-banner" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
      {/* Premium Full Hero Container */}
      <div 
        className="relative rounded-3xl sm:rounded-[2.8rem] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-[0_25px_65px_-15px_rgba(3,28,18,0.85),0_0_40px_rgba(16,185,129,0.15)] bg-gradient-to-br from-[#051d13] via-[#0a3523] to-[#03140d] text-white border border-emerald-500/30 space-y-8"
      >
        
        {/* Luminous Ambient Botanical Auroras & Golden Lights */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.22),rgba(20,184,166,0.1)_40%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2),rgba(245,158,11,0.08)_45%,transparent_75%)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)] rounded-full blur-2xl pointer-events-none" />
        
        {/* Subtle Nordic Luxury Pattern Shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none" />

        {/* Top Badges & Live Status Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="tracking-wide">LIVE DIGITAL CATALOGUE</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90 font-medium text-[11px]">Current Official Campaign</span>
            </div>

            {/* Verified BP Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Oriflame Verified BP ID: 8448337</span>
            </div>
          </div>

          {/* Flash Timer */}
          {flashConfig.isActive && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-sans text-[11px] text-stone-200">CLEARANCE CLOSING:</span>
              <span className="text-amber-300 font-extrabold bg-black/40 px-2 py-0.5 rounded-md border border-amber-400/30">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>

        {/* Hero Grid: Left Typography & CTAs, Right Eye-Catchy Live Catalog Showcase */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Headings & Value Propositions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-emerald-300 uppercase">
              <span>🇸🇪 Swedish Formulation Authority</span>
              <span>•</span>
              <span>Team Golden Star Central Node</span>
            </div>

            <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
              Official Live Swedish <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                Beauty &amp; Wellness Catalog.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/80 leading-relaxed font-normal max-w-xl">
              Discover official Oriflame Sweden formulations with instant digital catalog flipping, genuine stock clearance up to <strong>60% OFF MRP</strong>, and express dispatch from Central SPO Node 29435 under Verified Brand Partner <strong className="text-white">Biswajit Roy (ID: 8448337)</strong> &amp; Diamond Director <strong className="text-amber-200">Subhashree Ghosh</strong>.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Live Digital Catalog direct link */}
              <a
                id="hero-live-catalogue-cta"
                href={digitalCatalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-stone-950" />
                <span>Open Live e-Catalog (Flipbook)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Clearance Marketplace CTA */}
              <button
                id="hero-clearance-marketplace-cta"
                onClick={() => onGoToMarketplace('All')}
                className="px-6 py-3.5 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider border border-emerald-400/40 flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-md"
              >
                <span>Clearance Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Official Storefront Direct Link */}
              <a
                id="hero-official-store-cta"
                href={officialStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-2 transition-all hover:scale-[1.02] backdrop-blur-md"
              >
                <span>Official Oriflame Store</span>
                <ExternalLink className="w-3 h-3 text-emerald-300" />
              </a>
            </div>

            {/* Quick Guarantees Strip */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-200/90 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Factory Sealed Swedish Quality
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" /> 30-Day Money-Back Protocol
              </span>
              <span className="flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-teal-300" /> Dispatch from Kolkata SPO 29435
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Eye-Catchy Live Catalog Highlight Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-2xl space-y-4">
              
              {/* Card Header & Selector Tabs */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                      <span>{flashConfig.cardTitle || "Live Flash Countdown Offer"}</span>
                      {flashConfig.isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-400/40 text-[9px] font-bold font-mono tracking-wider animate-pulse">
                          LIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-emerald-200/80">
                      {flashConfig.cardSubtitle || "Exclusive clearance pricing & countdown preview"}
                    </p>
                  </div>
                </div>

                {flashConfig.isActive && (
                  <div className="text-right shrink-0 bg-black/40 px-2.5 py-1 rounded-xl border border-amber-400/30">
                    <span className="text-[9px] text-stone-300 font-mono block uppercase">ENDS IN</span>
                    <span className="text-amber-300 font-extrabold font-mono text-xs">
                      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {catalogHighlights.map((item, idx) => (
                  <button
                    key={item.id || item.code}
                    type="button"
                    onClick={() => setSelectedCatalogCategory(idx)}
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-all text-center shrink-0 cursor-pointer whitespace-nowrap ${
                      activeIndex === idx
                        ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                        : 'bg-black/30 hover:bg-black/50 text-white/80 border border-white/10'
                    }`}
                  >
                    {item.category ? String(item.category).split(' ')[0] : `Deal #${idx + 1}`}
                  </button>
                ))}
              </div>

              {/* Active Product Preview Card */}
              <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/15 p-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-stone-900 border border-white/20">
                  <img
                    src={currentHighlight.img}
                    alt={currentHighlight.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-amber-300">
                    #{currentHighlight.code}
                  </span>
                </div>

                <div className="space-y-1.5 text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[9px] font-extrabold text-emerald-300">
                      {currentHighlight.tag}
                    </span>
                    <span className="text-[10px] text-stone-300 font-mono">
                      Code {currentHighlight.code}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-white line-clamp-1">
                    {currentHighlight.title}
                  </h4>

                  <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                    {currentHighlight.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 line-through mr-2">
                        MRP ₹{currentHighlight.mrp}
                      </span>
                      <span className="text-amber-300 font-extrabold font-mono text-sm">
                        ₹{currentHighlight.clearancePrice}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onGoToMarketplace(currentHighlight.category as Category)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition shadow cursor-pointer"
                    >
                      <span>Check Stock</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Team Golden Star Leadership Seal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/10 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white p-1 shrink-0 shadow-sm border border-emerald-400/30">
                    <img
                      src="/team-golden-star-logo.svg"
                      alt="Team Golden Star"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-xs text-white">Team Golden Star Sweden</p>
                    <p className="text-[10px] text-amber-200">Subhashree Ghosh Diamond Director, PAN India</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-emerald-300 font-mono block">Node BP: 8448337</span>
                  <span className="text-[10px] font-bold text-white/90">Dumdum SPO 29435</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-semibold">Official Flipbook</p>
              <p className="text-xs sm:text-sm font-extrabold text-white">Live Digital Catalog</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300">
              <PackageCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-semibold">Stock Clearance</p>
              <p className="text-xs sm:text-sm font-extrabold text-white">Up to 60% OFF MRP</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-teal-400/20 text-teal-300">
              <Zap className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-semibold">SPO Central Hub</p>
              <p className="text-xs sm:text-sm font-extrabold text-white">Code 29435 • PIN 700077</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
              <Send className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-semibold">Direct Verification Desk</p>
              <p className="text-xs sm:text-sm font-extrabold text-white">WhatsApp 7003146399</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


