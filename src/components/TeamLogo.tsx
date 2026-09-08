import React from 'react';

interface TeamLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'light'
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-13 h-13 sm:w-14 sm:h-14',
    xl: 'w-18 h-18 sm:w-20 sm:h-20',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Team Golden Star Logo Emblem */}
      <div className={`relative ${sizeMap[size]} shrink-0 flex items-center justify-center select-none`}>
        <img 
          src="/team-golden-star-logo.svg" 
          alt="Team Golden Star Official Emblem" 
          className="w-full h-full object-contain filter drop-shadow-sm transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-extrabold tracking-wide text-base sm:text-lg ${
              variant === 'dark' ? 'text-neutral-100' : 'text-stone-900'
            }`}>
              GOLDEN STAR
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${
              variant === 'dark' 
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              STORE
            </span>
          </div>
          <span className={`text-[11px] font-medium leading-tight ${
            variant === 'dark' ? 'text-emerald-400/90' : 'text-stone-500'
          }`}>
            Subhashree Ghosh Org • Oriflame Swedish Hub
          </span>
        </div>
      )}
    </div>
  );
};
