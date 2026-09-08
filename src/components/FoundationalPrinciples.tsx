import React from 'react';
import { Ban, TrendingUp, ShieldCheck } from 'lucide-react';

export const FoundationalPrinciples: React.FC = () => {
  const principles = [
    {
      icon: Ban,
      title: 'Zero Mandatory Joining Fees',
      desc: 'Oriflame Sweden and Team Golden Star never demand hidden upfront fees or compulsory startup kits. Join purely on passion for clean European formulations and career empowerment.',
      badge: 'Free Registration'
    },
    {
      icon: TrendingUp,
      title: 'Zero Compulsory Targets',
      desc: 'Brand partners work entirely on their own schedule and speed without restrictive monthly sales quotas, forced personal purchases, or inventory holding penalties.',
      badge: 'Flexible Growth'
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic Sweden Formulations',
      desc: 'All skincare, cosmetics, and wellness formulations are sourced directly from verified Oriflame manufacturing lines, shipped factory sealed with batch codes and validity guarantees.',
      badge: 'Certified Genuine'
    }
  ];

  return (
    <section id="guidelinesSection" className="space-y-10 scroll-mt-28">
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <span className="inline-block text-[#0a7d4f] font-extrabold text-xs uppercase tracking-widest bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-300/60 shadow-2xs">
          Core Standards
        </span>
        <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#1c2b24]">
          Foundational Operating Principles
        </h3>
        <p className="text-xs sm:text-sm text-[#5b6b63] max-w-xl mx-auto leading-relaxed">
          Transparent, ethical, and European-certified benchmarks safeguarding every customer and Brand Partner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {principles.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="glass-card p-8 rounded-[2rem] space-y-4 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#0a7d4f] text-xl font-bold mb-4 group-hover:scale-105 transition-transform shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-[#1c2b24] mb-2 font-serif">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5b6b63] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-semibold text-[#0a7d4f]">Protected By Code</span>
                <span className="font-mono text-[10px] bg-stone-100/80 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
