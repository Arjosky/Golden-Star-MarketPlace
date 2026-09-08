import React from 'react';
import { Award, Laptop, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MANDATORY_VERIFICATION_BADGE } from '../data/catalogDB';

export const LeadershipSection: React.FC = () => {
  return (
    <section id="leadershipSection" className="space-y-10 scroll-mt-28">
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <span className="inline-block text-[#0a7d4f] font-extrabold text-xs uppercase tracking-widest bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-300/60 shadow-2xs">
          Accreditation
        </span>
        <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#1c2b24]">
          Leadership &amp; Verification Foundation
        </h3>
        <p className="text-xs sm:text-sm text-[#5b6b63] max-w-xl mx-auto leading-relaxed">
          Certified network governance, authentic mentorship, and verified downline standards under Oriflame Sweden's premier leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subhashree Ghosh */}
        <div className="glass-card rounded-[2rem] p-8 space-y-5 border border-white/90">
          <div className="flex items-start justify-between gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fff2cc] via-[#fae8b2] to-amber-200 text-[#075c3a] flex items-center justify-center text-2xl font-bold border border-[#d4a017]/40 shadow-sm">
              <Award className="w-7 h-7 text-[#d4a017]" />
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 uppercase tracking-wider">
              PAN India Founder
            </span>
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-[#d4a017] uppercase tracking-wider block">
              Executive Mentor &amp; Founder
            </span>
            <h4 className="text-2xl font-serif font-extrabold text-[#1c2b24] mt-1">
              Subhashree Ghosh
            </h4>
            <p className="text-xs font-bold text-[#0a7d4f] mt-0.5">
              Diamond Director Oriflame PAN India, Founder Team Golden Star
            </p>
          </div>

          <p className="text-xs text-[#5b6b63] leading-relaxed">
            Pioneering pan-India distributor networks and strategic growth guidelines, maintaining strict European quality benchmarks, factory seals, and ethical business integrity across all team inventories.
          </p>

          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Guarantees authentic batch authenticity and downline compliance.</span>
          </div>
        </div>

        {/* Biswajit Roy (Arjo) */}
        <div className="glass-card rounded-[2rem] p-8 space-y-5 border border-white/90">
          <div className="flex items-start justify-between gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e6f4ee] via-[#cfeadc] to-emerald-200 text-[#0a7d4f] flex items-center justify-center text-2xl font-bold border border-[#0a7d4f]/30 shadow-sm">
              <Laptop className="w-7 h-7 text-[#0a7d4f]" />
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/60 uppercase tracking-wider">
              Logistics &amp; Hub Node
            </span>
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-[#0a7d4f] uppercase tracking-wider block">
              Digital Infrastructure Operator
            </span>
            <h4 className="text-2xl font-serif font-extrabold text-[#1c2b24] mt-1">
              Biswajit Roy (Arjo)
            </h4>
            <p className="text-xs font-bold text-stone-600 mt-0.5">
              Team Leader &amp; Marketplace Node Director (+91 7003146399)
            </p>
          </div>

          <p className="text-xs text-[#5b6b63] leading-relaxed">
            Directing marketplace automation, distance routing algorithms based on 6-digit postal codes, partner seller onboarding, and rapid direct WhatsApp dispatch fulfillment from SPO Code 29435, PIN- 700077, Kolkata Dumdum Hub.
          </p>

          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct WhatsApp order teleportation &amp; Brand Partner settlement operator.</span>
          </div>
        </div>
      </div>

      {/* MANDATORY NETWORK VERIFICATION STANDARD BADGE BANNER */}
      <div className="glass-card bg-gradient-to-r from-[#e6f4ee]/80 via-[#e0f1e8]/70 to-[#e6f4ee]/80 border border-[#0a7d4f]/30 rounded-3xl p-6 sm:p-7 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-[#d4a017] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-extrabold text-[#075c3a] uppercase tracking-wider flex items-center gap-2">
            <span>Mandatory Network Verification Standard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </h5>
          <p className="text-xs sm:text-sm text-[#1c2b24] leading-relaxed">
            Every inventory item listed on this platform is authenticated with the fixed quality guarantee:
            <strong className="block font-bold text-[#075c3a] mt-1.5 text-sm sm:text-base font-serif">
              "{MANDATORY_VERIFICATION_BADGE}"
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
};
