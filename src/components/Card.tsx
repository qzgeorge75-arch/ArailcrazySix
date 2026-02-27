import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit } from '../types';

interface CardProps {
  card: CardType;
  isBack?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-slate-900',
  spades: 'text-slate-900',
};

export const Card: React.FC<CardProps> = ({ card, isBack = false, onClick, disabled = false, className = '' }) => {
  if (isBack) {
    return (
      <motion.div
        whileHover={!disabled ? { y: -10 } : {}}
        className={`w-14 h-20 sm:w-24 sm:h-36 bg-emerald-900 rounded-lg border border-white/20 shadow-2xl flex flex-col relative overflow-hidden ${className}`}
      >
        {/* Magazine Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://picsum.photos/seed/fashion-model-1/200/300?grayscale" 
            alt="Fashion Cover" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/40" />

        {/* Masthead (Magazine Title) */}
        <div className="relative z-10 pt-1 sm:pt-2 px-1 text-center">
          <h4 className="text-[10px] sm:text-[14px] font-black tracking-[0.2em] text-white uppercase leading-none italic">
            Arail
          </h4>
          <div className="h-[1px] w-full bg-white/30 mt-0.5" />
        </div>

        {/* Cover Lines */}
        <div className="relative z-10 mt-auto p-1 sm:p-2 flex flex-col items-center gap-0">
          <span className="text-[9px] sm:text-[14px] font-black text-white uppercase leading-none tracking-tight drop-shadow-sm w-full text-center">
            Crazy
          </span>
          <span className="text-[12px] sm:text-[18px] font-black text-pink-500 uppercase leading-none tracking-tight drop-shadow-sm w-full text-center mt-0.5">
            666
          </span>
          <div className="flex justify-between items-end mt-1 w-full">
            <span className="text-[5px] sm:text-[7px] text-white/60 uppercase">2026</span>
            {/* Mini Barcode */}
            <div className="flex gap-[1px]">
              {[2, 4, 1, 3, 2].map((h, i) => (
                <div key={i} className="w-[1px] bg-white/40" style={{ height: `${h * 2}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* High-end Border */}
        <div className="absolute inset-1 border border-white/10 rounded-sm pointer-events-none" />
      </motion.div>
    );
  }

  const symbol = suitSymbols[card.suit];
  const colorClass = suitColors[card.suit];

  return (
    <motion.div
      layoutId={card.id}
      whileHover={!disabled && onClick ? { y: -15, scale: 1.05 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        w-14 h-20 sm:w-24 sm:h-36 bg-white rounded-lg border border-slate-200 shadow-md 
        flex flex-col justify-between p-1.5 sm:p-3 cursor-pointer select-none relative
        ${disabled ? 'opacity-80 grayscale-[0.2]' : ''}
        ${className}
      `}
    >
      <div className={`flex flex-col items-start ${colorClass}`}>
        <span className="text-sm sm:text-xl font-black leading-none">{card.rank}</span>
        <span className="text-xs sm:text-lg leading-none font-bold">{symbol}</span>
      </div>
      
      <div className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-7xl ${colorClass} opacity-30`}>
        {symbol}
      </div>

      <div className={`flex flex-col items-end rotate-180 ${colorClass}`}>
        <span className="text-sm sm:text-xl font-black leading-none">{card.rank}</span>
        <span className="text-xs sm:text-lg leading-none font-bold">{symbol}</span>
      </div>
    </motion.div>
  );
};
