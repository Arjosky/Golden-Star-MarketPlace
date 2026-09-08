import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, ArrowRight, ShieldCheck, Zap, Clock, PackageCheck, Send, BookOpen, ExternalLink, Award, Star, Layers } from 'lucide-react';
import { FlashSaleConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  flashConfig: FlashSaleConfig;
  onGoToMarketplace: () => void;
  onScrollToCatalog?: () => void;
  onOpenSellerPortal: () => void;
  onOpenSlidingPage?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  flashConfig,
  onGoToMarketplace,
  onScrollToCatalog,
  onOpenSellerPortal,
  onOpenSlidingPage,
}) => {
  const { language, t } = useLanguage();
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

  return (
    <section id="hero-gradient-banner" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Premium Glass Banner Container */}
      <div className="glass-banner rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 lg:p-14 relative overflow-hidden space-y-6 sm:space-y-8">
        
        {/* Soft Swedish Botanical Ambient Aura Backdrop */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-to-bl from-emerald-100/60 via-teal-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-gradient-to-tr from-amber-100/50 via-yellow-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* 100% Satisfaction Guarantee badge with pulsing gold dot */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 border border-[#0a7d4f]/30 text-xs font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3ad417] animate-pulse shrink-0"></span>
            <span className="text-[#075c3a] font-serif font-bold whitespace-nowrap">100% Satisfaction Guarantee</span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="text-stone-600 font-sans font-medium text-[11px] hidden sm:inline">30-Day Resolution Protocol</span>
          </div>

          {/* Flash Offer Countdown Widget */}
          {flashConfig.isActive && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff2cc] border border-[#d4a017]/40 text-[#075c3a] text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#d4a017]" />
              <span className="font-sans font-semibold text-[11px]">DISCOUNT CLOSING:</span>
              <span className="text-[#d44217] font-extrabold bg-[#fcefcb] px-1.5 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>

        {/* Center Headline & Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-[#0a7d4f] uppercase">
              <span>🇸🇪 Stockholm Formulations</span>
              <span>•</span>
              <span>Kolkata SPO Central Node</span>
              <span>•</span>
              <span>Official Brand Partner Network</span>
            </div>

            <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1c2b24] tracking-tight leading-[1.12]">
              Clean Swedish Beauty &amp; Opportunity — <br className="hidden sm:inline" />
              <span className="text-[#0a7d4f]">
                with a Personal Touch.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-[#5b6b63] leading-relaxed max-w-2xl font-normal">
              Empowering consumers and independent Brand Partners with European certified beauty, 100% satisfaction assurance, zero targets, and digital catalog distribution under Diamond Director <strong className="text-[#1c2b24]">Subhashree Ghosh</strong> and Node Director <strong className="text-[#0a7d4f]">Biswajit Roy (Arjo)</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-explore-marketplace-btn"
                onClick={onGoToMarketplace}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] hover:from-[#075c3a] hover:to-[#05432a] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0a7d4f]/25 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>{t('home.exploreMarketplace', 'Explore Marketplace')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#journeySection"
                className="px-5 py-3.5 rounded-full bg-white/95 hover:bg-stone-50 text-[#1c2b24] font-bold text-xs border border-stone-200 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>The 4 Pillars</span>
              </a>

              {onOpenSlidingPage && (
                <button
                  id="hero-open-sliding-page-btn"
                  onClick={onOpenSlidingPage}
                  className="px-5 py-3.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs border border-emerald-300 shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                  title="Open Dedicated Automatic Sliding Showcase"
                >
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Automatic Showcase' : 'অটোমেটিক শোকেস'}</span>
                </button>
              )}

              <a
                id="hero-digital-catalogue-btn"
                href={digitalCatalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-full bg-[#fff2cc] hover:bg-[#fae8b2] text-[#075c3a] font-bold text-xs border border-[#d4a017]/40 flex items-center gap-2 transition-all shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-[#d4a017]" />
                <span>Live e-Catalogue</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#d4a017]" />
              </a>
            </div>
          </div>

          {/* Official Emblem Desktop Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center max-w-xs border border-white/80 shadow-md">
              {/* Round framed emblem with premium drop shadow */}
              <div className="relative mb-4 flex items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-2.5 flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(10,125,79,0.22),0_8px_16px_-4px_rgba(0,0,0,0.12)] border border-emerald-100/90 ring-4 ring-emerald-500/10 group transition-all duration-300 hover:shadow-[0_14px_35px_-5px_rgba(10,125,79,0.28),0_10px_20px_-4px_rgba(0,0,0,0.15)]">
                  <img 
                    src="/team-golden-star-logo.svg" 
                    alt="Team Golden Star Official Logo" 
                    className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <h3 className="font-serif font-extrabold text-lg text-[#1c2b24]">
                TEAM GOLDEN STAR
              </h3>
              <p className="mt-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#fff2cc] via-[#fef7e0] to-[#fff2cc] border border-[#d4a017]/40 text-[#075c3a] text-[11px] font-bold tracking-tight shadow-2xs inline-flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#d4a017] shrink-0" />
                <span>Subhashree Ghosh Diamond Director, PAN India</span>
              </p>
              <div className="mt-3 pt-3 border-t border-stone-200/80 w-full text-[11px] text-[#5b6b63] flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#d4a017] fill-[#d4a017]" />
                <span>100% Certified Network Node</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 pt-4 border-t border-emerald-900/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100/70 text-amber-900 border border-amber-200">
              <PackageCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[10px] text-[#5b6b63] uppercase tracking-wider font-semibold">Clearance Value</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#1c2b24]">Up to 60% OFF MRP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100/70 text-emerald-900 border border-emerald-200">
              <Zap className="w-4 h-4 text-[#0a7d4f]" />
            </div>
            <div>
              <p className="text-[10px] text-[#5b6b63] uppercase tracking-wider font-semibold">Central SPO Hub</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#1c2b24] tracking-tight">
                SPO Code 29435, PIN- 700077, Kolkata Dumdum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#fff2cc] text-[#075c3a] border border-[#d4a017]/40">
              <ShieldCheck className="w-4 h-4 text-[#d4a017]" />
            </div>
            <div>
              <p className="text-[10px] text-[#5b6b63] uppercase tracking-wider font-semibold">Official Brand Partner</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#1c2b24]">Sign In / Sign Up</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-100/70 text-teal-900 border border-teal-200">
              <Send className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <p className="text-[10px] text-[#5b6b63] uppercase tracking-wider font-semibold">Fast Dispatch</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#1c2b24]">WhatsApp 7003146399</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

