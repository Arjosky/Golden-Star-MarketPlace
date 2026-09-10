import React from 'react';
import { Sparkles, Truck, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { FlashSaleConfig } from '../types';

interface TopMarqueeProps {
  flashConfig: FlashSaleConfig;
  onOpenSellerModal: () => void;
  onOpenFlashDeals: () => void;
}

export const TopMarquee: React.FC<TopMarqueeProps> = ({
  flashConfig,
  onOpenSellerModal,
  onOpenFlashDeals,
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
              <strong className="font-bold text-stone-900">TEAM GOLDEN STAR:</strong> Subhashree Ghosh Org • Official Swedish Hub
            </span>
          </div>
        </div>

        {/* Right Assurance Badge - No redundant login button at top */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">100% Genuine Guarantee</span>
            <span className="sm:hidden">100% Genuine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
