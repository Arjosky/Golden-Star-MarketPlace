import React from 'react';
import { BookOpen, ShieldCheck, Award, MapPin } from 'lucide-react';

export const TheFourPillars: React.FC = () => {
  const pillars = [
    {
      num: '01',
      icon: BookOpen,
      title: 'Digital Catalog Integration',
      desc: 'Instant digital catalog distribution via WhatsApp with real-time stock access and instant cart synchronization.',
      badge: 'Stockholm Direct'
    },
    {
      num: '02',
      icon: ShieldCheck,
      title: '30-Day Claim Protocol',
      desc: 'Dedicated claims resolution and feedback loop valid for 30 full days post shipment directly in your customer portal.',
      badge: '100% Guaranteed'
    },
    {
      num: '03',
      icon: Award,
      title: '100% Customer Satisfaction',
      desc: 'Uncompromising commitment to certified European quality, sealed authenticity checks, and direct dispute resolution.',
      badge: 'Zero Risk'
    },
    {
      num: '04',
      icon: MapPin,
      title: 'Local PIN Logistics',
      desc: 'Automated pickup and drop routing based on 6-digit postal codes to optimize handover costs and delivery times.',
      badge: 'SPO 29435 Dumdum (700077)'
    }
  ];

  return (
    <section id="journeySection" className="glass-banner rounded-[2.5rem] p-8 sm:p-14 space-y-12 scroll-mt-28 relative overflow-hidden">
      {/* Background watermark badge */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5 relative z-10">
        <span className="inline-block text-[#0a7d4f] font-extrabold text-xs uppercase tracking-widest bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-300/60 shadow-2xs">
          Transformation
        </span>
        <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#1c2b24]">
          The 4 Pillars of Our Digital Journey
        </h3>
        <p className="text-xs sm:text-sm text-[#5b6b63] max-w-xl mx-auto leading-relaxed">
          Structured execution taking consultants and beauty enthusiasts from traditional direct selling to modern automated scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div 
              key={pillar.num} 
              className="glass-card rounded-3xl p-7 space-y-3.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl sm:text-4xl font-serif font-extrabold text-[#d4a017] group-hover:scale-110 transition-transform">
                    {pillar.num}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#0a7d4f] shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-[#1c2b24] mb-2 leading-snug">
                  {pillar.title}
                </h4>
                <p className="text-xs text-[#5b6b63] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-900/10 flex items-center justify-between text-[11px] text-[#0a7d4f] font-semibold">
                <span>Standard</span>
                <span className="font-mono text-[10px] bg-white/90 px-2 py-0.5 rounded-full border border-stone-200 shadow-2xs">
                  {pillar.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
