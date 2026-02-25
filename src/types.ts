
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  avatarUrl?: string;
}

export type GameStatus = 'start_screen' | 'playing' | 'choosing_suit' | 'game_over';
export type Turn = 'player' | 'ai';

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHand: Card[];
  turn: Turn;
  status: GameStatus;
  winner: Turn | null;
  currentSuit: Suit | null; // For wild card '6'
}
