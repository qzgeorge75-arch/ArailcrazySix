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
        className={`w-14 h-20 sm:w-24 sm:h-36 bg-emerald-700 rounded-lg border-2 border-white/20 shadow-lg flex items-center justify-center relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-2 border border-white/10 rounded-md flex items-center justify-center">
          <div className="w-6 h-6 sm:w-12 sm:h-12 border-2 border-white/20 rounded-full rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 sm:w-6 sm:h-6 bg-white/10 rounded-full" />
          </div>
        </div>
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
        flex flex-col justify-between p-1 sm:p-2 cursor-pointer select-none relative
        ${disabled ? 'opacity-80 grayscale-[0.2]' : ''}
        ${className}
      `}
    >
      <div className={`flex flex-col items-start ${colorClass}`}>
        <span className="text-xs sm:text-lg font-bold leading-none">{card.rank}</span>
        <span className="text-[10px] sm:text-base leading-none">{symbol}</span>
      </div>
      
      <div className={`absolute inset-0 flex items-center justify-center text-xl sm:text-4xl ${colorClass} opacity-20`}>
        {symbol}
      </div>

      {card.avatarUrl && (
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
          <img 
            src={card.avatarUrl} 
            alt="Eggy" 
            className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-100 shadow-inner"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className={`flex flex-col items-end rotate-180 ${colorClass}`}>
        <span className="text-xs sm:text-lg font-bold leading-none">{card.rank}</span>
        <span className="text-[10px] sm:text-base leading-none">{symbol}</span>
      </div>
    </motion.div>
  );
};
