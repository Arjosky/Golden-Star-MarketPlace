import React from 'react';
import { Sparkles, Truck, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { FlashSaleConfig } from '../types';

interface TopMarqueeProps {
  flashConfig: FlashSaleConfig;
  onOpenSellerModal: () => void;
  onOpenFlashDeals: () => void;
  onOpenAuthModal?: () => void;
}

export const TopMarquee: React.FC<TopMarqueeProps> = ({
  flashConfig,
  onOpenSellerModal,
  onOpenFlashDeals,
  onOpenAuthModal,
}) => {
  return (
    <div id="top-announcement-marquee" className="bg-gradient-to-r from-[#f4f9f6] via-[#fbfdf9] to-[#f4f9f6] text-stone-800 text-xs font-semibold py-2 px-4 overflow-hidden border-b border-emerald-200/80 relative z-30 shadow-2xs">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Badge */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 bg-white text-emerald-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Team Golden Star • Clearance Hub</span>
        </div>

        {/* Center Marquee Content */}
        <div className="flex-1 overflow-hidden mx-3 sm:mx-6 group cursor-pointer" onClick={onOpenFlashDeals}>
          <div className="whitespace-nowrap animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused] flex items-center gap-8 text-[12px] font-medium text-stone-800">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <strong className="font-extrabold text-[#0a7d4f]">🇸🇪 SWEDISH CLEARANCE:</strong> Authentic Oriflame Beauty & Wellness up to 60% OFF MRP
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <strong className="font-bold text-stone-900">EXPRESS SPO DISPATCH:</strong> Kolkata Hub Direct to Pan-India
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="font-bold text-stone-900">{flashConfig.headline}</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <strong className="font-bold text-stone-900">OFFICIAL BRAND PARTNER:</strong> Sign In / Sign Up to access member clearance benefits
            </span>
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="marquee-auth-cta"
            onClick={onOpenAuthModal || onOpenSellerModal}
            className="text-[11px] font-bold bg-white hover:bg-stone-50 text-emerald-950 px-2.5 sm:px-3 py-1 rounded-md transition-colors border border-emerald-300 hover:border-[#0a7d4f] whitespace-nowrap cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Sign In / Sign Up</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
