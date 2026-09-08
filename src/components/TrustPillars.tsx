import React from 'react';
import { Leaf, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

export const TrustPillars: React.FC = () => {
  const pillars = [
    {
      id: 'pillar-natural-extracts',
      icon: Leaf,
      iconColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      title: 'Natural Swedish Extracts',
      subtitle: 'Pure Scandinavian Botanical Formulations',
      points: [
        'Swedish Archipelago Astaxanthin & Bilberry',
        'Certified Organic Beeswax, Honey & Milk',
        'Eco-Ethical screening & Non-GMO integrity'
      ],
      badge: 'Stockholm Lab Tested',
    },
    {
      id: 'pillar-authentic-stock',
      icon: ShieldCheck,
      iconColor: 'text-amber-800 bg-amber-50 border-amber-200',
      title: '100% Authentic Stock',
      subtitle: 'Verified Team Golden Star Custody',
      points: [
        'Batch coded & verified expiry dates',
        'Pristine factory seals on every unit',
        'Direct provenance under Biswajit Roy (Arjo)'
      ],
      badge: 'Zero Counterfeit Guarantee',
    },
    {
      id: 'pillar-express-spo',
      icon: Truck,
      iconColor: 'text-sky-800 bg-sky-50 border-sky-200',
      title: 'Express SPO Dispatch',
      subtitle: 'Service Point Oriflame Fast Courier',
      points: [
        'Instant WhatsApp teleportation dispatch',
        'Kolkata Hub hub-to-hub direct routing',
        'Live tracking and personal order follow-up'
      ],
      badge: 'WhatsApp: 7003146399',
    },
  ];

  return (
    <section id="trust-pillars-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              id={pillar.id}
              className="relative bg-white hover:bg-white border border-stone-200/90 hover:border-emerald-600/40 rounded-2xl p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${pillar.iconColor} transition-transform group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-1 font-serif">
                  {pillar.title}
                </h3>
                <p className="text-xs text-emerald-800 font-semibold mb-4">
                  {pillar.subtitle}
                </p>

                <ul className="space-y-2 text-xs text-stone-600 mb-4">
                  {pillar.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Team Golden Star Standard</span>
                <span className="text-emerald-800 font-mono font-semibold">SE-ORIFLAME-QC</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
