import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ArrowUp,
  BookOpen,
  ExternalLink,
  Award,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenSellerModal: () => void;
  onScrollToTop: () => void;
  onGoToMarketplace?: () => void;
  onGoToHome?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenSellerModal,
  onScrollToTop,
  onGoToMarketplace,
  onGoToHome,
}) => {
  const digitalCatalogueUrl = "https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar";
  
  // Discreet owner gesture: 3 clicks on operator name within 2.5s opens master console
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<any>(null);

  const handleOperatorSecretClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);
      onOpenAdmin();
    } else {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2500);
    }
  };

  return (
    <footer id="golden-star-footer" className="bg-white border-t border-stone-200 text-stone-600 text-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Operator */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <img 
                  src="/team-golden-star-logo.svg" 
                  alt="Team Golden Star Official Logo" 
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-stone-900 text-base tracking-wide">
                  GOLDEN STAR STORE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  TEAM GOLDEN STAR
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed max-w-md">
              Official Oriflame Sweden beauty & wellness stock liquidation terminal. Founded under Diamond Director <strong className="text-stone-800">Subhashree Ghosh</strong> (Founder Team Golden Star) and operated with verified authentic clearance custody by <strong className="text-stone-800">Biswajit Roy (Arjo)</strong>.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs">
              <a
                href="https://wa.me/917003146399"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 hover:underline font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>WhatsApp: 7003146399</span>
              </a>

              <a
                href="mailto:oriflamearjo@gmail.com"
                className="flex items-center gap-1.5 text-amber-800 hover:text-amber-950 hover:underline font-semibold"
              >
                <Mail className="w-3.5 h-3.5 text-amber-700" />
                <span>oriflamearjo@gmail.com</span>
              </a>
            </div>

            {/* Direct Digital Catalogue Button */}
            <div className="pt-2">
              <a
                href={digitalCatalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>📖 Digital Catalogue: in.oriflame.com (Store: IN-goldenstar)</span>
                <ExternalLink className="w-3 h-3 text-amber-700" />
              </a>
            </div>
          </div>

          {/* Col 2: Liquidity & Portals */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Portals & Services
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              {onGoToHome && (
                <li>
                  <button
                    onClick={onGoToHome}
                    className="hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-left cursor-pointer font-medium"
                  >
                    <span>🏠 Home Overview</span>
                  </button>
                </li>
              )}
              {onGoToMarketplace && (
                <li>
                  <button
                    onClick={onGoToMarketplace}
                    className="hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-left cursor-pointer font-medium text-emerald-800"
                  >
                    <span>🛍️ Clearance Marketplace Page</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenSellerModal}
                  className="hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-left cursor-pointer font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Official Brand Partner Desk (Sign In / Sign Up)</span>
                </button>
              </li>
              <li>
                <a
                  href={digitalCatalogueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Official Monthly E-Catalogue</span>
                </a>
              </li>
              <li className="text-stone-500">Service Point Oriflame (SPO Express)</li>
              <li className="text-stone-500">Swedish Astaxanthin Defense</li>
            </ul>
          </div>

          {/* Col 3: Direct Selling & Hub Governance */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Team Credentials & Trust
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li className="text-[11px] text-stone-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Authentic Swedish Formulations</span>
              </li>
              <li className="text-[11px] text-stone-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Director: Subhashree Ghosh (Diamond)</span>
              </li>
              <li className="text-[11px] text-stone-500">
                Dispatch Node: Kolkata Hub (Direct SPO)
              </li>
              <li className="text-[11px] text-stone-500">
                Pan-India Express Dispatch via Bluedart
              </li>
              <li className="text-[11px] text-stone-500">
                Stock Verification: Factory Batch Code Sealed
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Team Golden Star • All authentic Oriflame trademarks belong to Oriflame Cosmetics AG.
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-stone-700 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              title="Click to Open Admin Command Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console (Biswajit Roy / Arjo)</span>
            </button>
            <span>•</span>
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-1 text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
