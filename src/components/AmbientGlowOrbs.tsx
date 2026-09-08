import React from 'react';

export const AmbientGlowOrbs: React.FC = () => {
  return (
    <>
      {/* Top Left Emerald Swedish Glow */}
      <div 
        className="fixed -top-32 -left-32 w-[32rem] h-[32rem] bg-gradient-to-br from-[#e6f4ee] via-[#d2ede1] to-transparent rounded-full blur-3xl opacity-70 pointer-events-none animate-pulse-soft z-0" 
        style={{ animationDuration: '6s' }}
      />
      {/* Mid Right Nordic Gold Glow */}
      <div 
        className="fixed top-1/3 -right-32 w-[30rem] h-[30rem] bg-gradient-to-bl from-[#fff2cc] via-[#fae8b2] to-transparent rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-soft z-0" 
        style={{ animationDelay: '2s', animationDuration: '7s' }}
      />
    </>
  );
};
