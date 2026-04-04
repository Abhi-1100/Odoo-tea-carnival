import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-surface w-full h-screen">
       <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute w-24 h-24 border-4 border-outline-variant/30 rounded-full"></div>
          <div className="absolute w-24 h-24 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          
          {/* Inner pulse */}
          <div className="w-16 h-16 bg-primary-container/20 rounded-full animate-pulse flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-3xl">coffee</span>
          </div>
       </div>
       <h2 className="mt-8 text-2xl font-headline italic tracking-widest text-primary animate-pulse">Luminous Dining</h2>
       <p className="mt-4 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant flex gap-[2px] items-center">
         <span>Curating Origin</span>
         <span className="animate-[bounce_1s_infinite_100ms] w-1 h-1 bg-primary rounded-full ml-1"></span>
         <span className="animate-[bounce_1s_infinite_200ms] w-1 h-1 bg-primary rounded-full"></span>
         <span className="animate-[bounce_1s_infinite_300ms] w-1 h-1 bg-primary rounded-full"></span>
       </p>
    </div>
  );
}
