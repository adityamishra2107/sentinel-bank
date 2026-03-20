import React, { useState } from 'react';
import { CreditCard, Wifi, Zap } from 'lucide-react';

const VirtualCard = ({ 
  cardholderName = 'John Doe', 
  cardNumber = '•••• •••• •••• 4242', 
  expiry = '12/28', 
  cvv = '123',
  isFrozen = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-sm mx-auto h-56 relative perspective-1000 cursor-pointer animate-fade-in-up md:max-w-md md:h-64"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full absolute top-0 left-0 transition-all duration-700 preserve-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* FRONT OF CARD */}
        <div className={`absolute w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between overflow-hidden
          ${isFrozen 
            ? 'bg-gradient-to-br from-slate-400 to-slate-600' 
            : 'bg-gradient-to-br from-gray-900 via-indigo-900 to-violet-900'
          }`}
        >
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Zap className={`w-6 h-6 ${isFrozen ? 'text-slate-300' : 'text-emerald-400'}`} />
              <span className="text-white font-bold text-lg tracking-wide">SentinelBank</span>
            </div>
            <Wifi className="w-6 h-6 text-white/80 rotate-90" />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md mb-4 opacity-90 shadow-inner"></div>
            <p className="text-gray-100 font-mono text-xl md:text-2xl tracking-[0.2em] mb-2 drop-shadow-md">
              {cardNumber}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wider mb-1 uppercase">Cardholder Name</p>
                <p className="text-white font-bold tracking-wide uppercase">{cardholderName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium tracking-wider mb-1 uppercase">Valid Thru</p>
                <p className="text-white font-bold tracking-wide">{expiry}</p>
              </div>
            </div>
          </div>
          
          {isFrozen && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
              <span className="bg-slate-900/80 text-white px-4 py-2 rounded-full font-bold shadow-lg border border-white/20 flex items-center gap-2">
                ❄️ Card Frozen
              </span>
            </div>
          )}
        </div>

        {/* BACK OF CARD */}
        <div className={`absolute w-full h-full backface-hidden rounded-2xl rotate-y-180 flex flex-col justify-between overflow-hidden
          ${isFrozen 
            ? 'bg-gradient-to-br from-slate-500 to-slate-700' 
            : 'bg-gradient-to-br from-indigo-950 via-gray-900 to-slate-900'
          }`}
        >
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-black/80 mt-6 shadow-inner"></div>
          
          <div className="px-6 py-4 flex-1 flex flex-col justify-center">
            <div className="w-full bg-white/20 h-10 rounded flex items-center justify-end px-4 mb-2">
              <span className="text-gray-900 font-mono font-bold italic bg-white px-2 py-1 rounded text-sm shrink-0">
                {cvv}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 px-4 leading-tight">
              This card is the property of SentinelBank. If found, please return to any branch or call 1-800-SENTINEL.
            </p>
          </div>
          
          <div className="px-6 pb-4 flex justify-between items-center opacity-70">
            <p className="text-xs text-white/60 font-medium">Customer Support</p>
            <p className="text-xs text-white/90 font-bold">sentinelbank.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
