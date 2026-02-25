import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Info, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Card as CardComponent } from './components/Card';
import { Card as CardType, GameState, Turn, Suit } from './types';
import { createDeck, shuffle, isValidMove, WILD_RANK, SUITS } from './constants';

const INITIAL_CARDS = 8;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    turn: 'player',
    status: 'start_screen',
    winner: null,
    currentSuit: null,
  });

  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState<string>("欢迎来到疯狂6点！");

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = shuffle(createDeck());
    const playerHand = fullDeck.splice(0, INITIAL_CARDS);
    const aiHand = fullDeck.splice(0, INITIAL_CARDS);
    
    // Discard pile starts with one card that is NOT a wild card
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === WILD_RANK) {
      firstDiscardIndex++;
    }
    const discardPile = [fullDeck.splice(firstDiscardIndex, 1)[0]];

    setGameState({
      deck: fullDeck,
      discardPile,
      playerHand,
      aiHand,
      turn: 'player',
      status: 'playing',
      winner: null,
      currentSuit: null,
    });
    setMessage("你的回合，请出牌或摸牌。");
  }, []);

  // Remove the auto-init useEffect
  // useEffect(() => {
  //   initGame();
  // }, [initGame]);

  const checkWinner = (state: GameState) => {
    if (state.playerHand.length === 0) return 'player';
    if (state.aiHand.length === 0) return 'ai';
    return null;
  };

  const nextTurn = (state: GameState): Turn => {
    return state.turn === 'player' ? 'ai' : 'player';
  };

  const handleDrawCard = () => {
    if (gameState.status !== 'playing' || gameState.turn !== 'player') return;

    if (gameState.deck.length === 0) {
      setMessage("摸牌堆已空，跳过回合。");
      setGameState(prev => ({ ...prev, turn: 'ai' }));
      return;
    }

    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop()!;
    const newHand = [...gameState.playerHand, drawnCard];

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newHand,
      turn: 'ai',
    }));
    setMessage("你摸了一张牌。");
  };

  const handlePlayCard = (card: CardType) => {
    if (gameState.status !== 'playing' || gameState.turn !== 'player') return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!isValidMove(card, topCard, gameState.currentSuit)) {
      setMessage("无效的出牌！必须匹配花色或点数。");
      return;
    }

    const newHand = gameState.playerHand.filter(c => c.id !== card.id);
    const newDiscardPile = [...gameState.discardPile, card];

    if (card.rank === WILD_RANK) {
      setGameState(prev => ({
        ...prev,
        playerHand: newHand,
        discardPile: newDiscardPile,
        status: 'choosing_suit',
      }));
      setMessage("打出了疯狂6！请选择一个新的花色。");
    } else {
      const newState = {
        ...gameState,
        playerHand: newHand,
        discardPile: newDiscardPile,
        turn: 'ai' as Turn,
        currentSuit: null,
      };

      const winner = checkWinner(newState);
      if (winner) {
        setGameState({ ...newState, status: 'game_over', winner });
      } else {
        setGameState(newState);
        setMessage("AI 正在思考...");
      }
    }
  };

  const handleSuitChoice = (suit: Suit) => {
    const newState = {
      ...gameState,
      status: 'playing' as const,
      currentSuit: suit,
      turn: 'ai' as Turn,
    };

    const winner = checkWinner(newState);
    if (winner) {
      setGameState({ ...newState, status: 'game_over', winner });
    } else {
      setGameState(newState);
      setMessage(`你选择了 ${suit === 'hearts' ? '红心' : suit === 'diamonds' ? '方块' : suit === 'clubs' ? '梅花' : '黑桃'}。AI 回合。`);
    }
  };

  // AI Logic
  useEffect(() => {
    if (gameState.turn === 'ai' && gameState.status === 'playing' && !gameState.winner) {
      const timer = setTimeout(() => {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const validMoves = gameState.aiHand.filter(c => isValidMove(c, topCard, gameState.currentSuit));

        if (validMoves.length > 0) {
          // AI plays a card. Prefer non-wild cards unless necessary.
          const normalMoves = validMoves.filter(c => c.rank !== WILD_RANK);
          const cardToPlay = normalMoves.length > 0 
            ? normalMoves[Math.floor(Math.random() * normalMoves.length)]
            : validMoves[0];

          const newHand = gameState.aiHand.filter(c => c.id !== cardToPlay.id);
          const newDiscardPile = [...gameState.discardPile, cardToPlay];

          if (cardToPlay.rank === WILD_RANK) {
            // AI chooses most frequent suit in its hand
            const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            newHand.forEach(c => suitCounts[c.suit]++);
            const chosenSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);

            const newState = {
              ...gameState,
              aiHand: newHand,
              discardPile: newDiscardPile,
              currentSuit: chosenSuit,
              turn: 'player' as Turn,
            };
            
            const winner = checkWinner(newState);
            if (winner) {
              setGameState({ ...newState, status: 'game_over', winner });
            } else {
              setGameState(newState);
              setMessage(`AI 打出了疯狂6并选择了 ${chosenSuit}。轮到你了。`);
            }
          } else {
            const newState = {
              ...gameState,
              aiHand: newHand,
              discardPile: newDiscardPile,
              turn: 'player' as Turn,
              currentSuit: null,
            };

            const winner = checkWinner(newState);
            if (winner) {
              setGameState({ ...newState, status: 'game_over', winner });
            } else {
              setGameState(newState);
              setMessage("AI 出牌了。轮到你了。");
            }
          }
        } else {
          // AI draws
          if (gameState.deck.length > 0) {
            const newDeck = [...gameState.deck];
            const drawnCard = newDeck.pop()!;
            const newHand = [...gameState.aiHand, drawnCard];
            setGameState(prev => ({
              ...prev,
              deck: newDeck,
              aiHand: newHand,
              turn: 'player',
            }));
            setMessage("AI 摸了一张牌。轮到你了。");
          } else {
            setGameState(prev => ({ ...prev, turn: 'player' }));
            setMessage("摸牌堆已空，AI 跳过回合。轮到你了。");
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="min-h-screen bg-pink-100 text-slate-900 font-sans selection:bg-pink-200 flex flex-col overflow-y-auto">
      {/* Start Screen */}
      <AnimatePresence>
        {gameState.status === 'start_screen' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-pink-100 p-6"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-300 rounded-full blur-[120px]" />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center"
            >
              {/* Logo/Icon */}
              <div className="mb-8 relative">
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-24 h-36 bg-white rounded-xl border-2 border-slate-200 shadow-2xl flex flex-col items-center justify-center p-2 relative"
                >
                  <div className="absolute top-2 left-2 text-red-600 font-bold text-xl">6</div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner">
                    <img src="https://picsum.photos/seed/eggy-6/200/200" alt="Eggy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute bottom-2 right-2 text-red-600 font-bold text-xl rotate-180">6</div>
                </motion.div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                  <span className="text-2xl font-black">!</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-pink-600 to-pink-900">
                Arail疯狂6点
              </h1>
              <p className="text-pink-800/60 text-lg sm:text-xl mb-12 max-w-md">
                经典的 Crazy Eights 纸牌游戏，加入可爱的蛋仔角色，挑战 AI 赢取胜利！
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={initGame}
                  className="px-12 py-4 bg-pink-600 text-white font-black rounded-2xl text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  开始游戏
                </button>
                <button
                  onClick={() => setShowRules(true)}
                  className="px-12 py-4 bg-white/50 hover:bg-white/80 text-pink-900 font-bold rounded-2xl text-xl backdrop-blur-md border border-pink-200 transition-all"
                >
                  游戏规则
                </button>
              </div>

              <div className="mt-16 flex items-center gap-6 opacity-60">
                <div className="flex flex-col items-center text-pink-900">
                  <span className="text-2xl font-bold">52</span>
                  <span className="text-[10px] uppercase tracking-widest">扑克牌</span>
                </div>
                <div className="w-px h-8 bg-pink-300" />
                <div className="flex flex-col items-center text-pink-900">
                  <span className="text-2xl font-bold">6</span>
                  <span className="text-[10px] uppercase tracking-widest">万能牌</span>
                </div>
                <div className="w-px h-8 bg-pink-300" />
                <div className="flex flex-col items-center text-pink-900">
                  <span className="text-2xl font-bold">∞</span>
                  <span className="text-[10px] uppercase tracking-widest">乐趣</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-pink-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="text-2xl font-bold text-white">6</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block text-pink-900">Arail疯狂6点</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="p-2 hover:bg-white/40 rounded-full transition-colors text-pink-900"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={initGame}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full transition-all text-sm font-medium shadow-md"
          >
            <RotateCcw size={16} />
            <span>重新开始</span>
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-pink-900/60">
            <span>AI 对手</span>
            <span className="px-2 py-0.5 bg-pink-200 rounded-full">{gameState.aiHand.length} 张牌</span>
          </div>
          <div className="flex -space-x-8 sm:-space-x-12 overflow-visible py-4">
            {gameState.aiHand.map((_, i) => (
              <CardComponent key={`ai-${i}`} card={{} as any} isBack disabled className="scale-90 sm:scale-100" />
            ))}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 my-4">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group" onClick={handleDrawCard}>
              <div className="absolute -inset-1 bg-pink-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                {gameState.deck.length > 0 ? (
                  <>
                    <CardComponent card={{} as any} isBack className="cursor-pointer" />
                    <div className="absolute -bottom-2 -right-2 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                      {gameState.deck.length}
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-24 sm:w-24 sm:h-36 border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center">
                    <Layers className="text-pink-300" size={32} />
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-pink-900/40">摸牌堆</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {topCard && (
                  <CardComponent 
                    key={topCard.id} 
                    card={topCard} 
                    className="shadow-2xl shadow-pink-900/10"
                  />
                )}
              </AnimatePresence>
              {gameState.currentSuit && (
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-pink-500 animate-pulse">
                  <span className={`text-xl ${gameState.currentSuit === 'hearts' || gameState.currentSuit === 'diamonds' ? 'text-red-600' : 'text-slate-900'}`}>
                    {gameState.currentSuit === 'hearts' ? '♥' : gameState.currentSuit === 'diamonds' ? '♦' : gameState.currentSuit === 'clubs' ? '♣' : '♠'}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-pink-900/40">弃牌堆</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-2 sm:gap-4 mt-auto">
          <div className="bg-white/50 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full backdrop-blur-md border border-pink-200 shadow-lg mb-2">
            <p className="text-xs sm:text-base font-medium text-pink-900">
              {message}
            </p>
          </div>

          <div className="w-full overflow-x-auto pb-4 px-4 flex justify-center no-scrollbar">
            <div className="flex flex-nowrap sm:flex-wrap justify-center gap-2 sm:gap-4 min-w-max sm:min-w-0">
              {gameState.playerHand.map((card) => (
                <CardComponent 
                  key={card.id} 
                  card={card} 
                  onClick={() => handlePlayCard(card)}
                  disabled={gameState.turn !== 'player' || gameState.status !== 'playing'}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-pink-900/60 mb-2">
            <span>你的手牌</span>
            <span className="px-2 py-0.5 bg-pink-200 rounded-full">{gameState.playerHand.length} 张牌</span>
          </div>
        </div>
      </main>

      {/* Wild Card Suit Picker */}
      <AnimatePresence>
        {gameState.status === 'choosing_suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <h2 className="text-2xl font-bold mb-2">疯狂6点！</h2>
              <p className="text-slate-400 mb-8">请选择接下来要匹配的花色</p>
              
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map((suit) => (
                  <button
                    key={suit}
                    onClick={() => handleSuitChoice(suit)}
                    className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <span className={`text-4xl mb-2 group-hover:scale-125 transition-transform ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-white'}`}>
                      {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
                    </span>
                    <span className="text-xs uppercase tracking-widest opacity-60">
                      {suit === 'hearts' ? '红心' : suit === 'diamonds' ? '方块' : suit === 'clubs' ? '梅花' : '黑桃'}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-950 border border-white/20 p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-pink-500"></div>
              
              <div className="mb-6 flex justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${gameState.winner === 'player' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-slate-700'} shadow-2xl`}>
                  <Trophy size={48} className={gameState.winner === 'player' ? 'text-white' : 'text-slate-400'} />
                </div>
              </div>

              <h2 className="text-4xl font-black mb-2 tracking-tight">
                {gameState.winner === 'player' ? '你赢了！' : 'AI 获胜'}
              </h2>
              <p className="text-slate-400 mb-10 text-lg">
                {gameState.winner === 'player' ? '太棒了，你清空了所有手牌！' : '别灰心，下次一定能赢。'}
              </p>
              
              <button
                onClick={initGame}
                className="w-full py-4 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-3 text-lg"
              >
                <RotateCcw size={24} />
                <span>再来一局</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Overlay */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-8 flex justify-center"
          >
            <div className="bg-slate-900 border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-2xl w-full relative">
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronDown size={24} />
              </button>
              
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="text-pink-300" />
                <span>游戏规则</span>
              </h3>
              
              <div className="space-y-4 text-sm sm:text-base text-slate-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-pink-500/20 text-pink-300 rounded flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <p>每人初始发 8 张牌。目标是率先清空手牌。</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-pink-500/20 text-pink-300 rounded flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <p>出牌必须与弃牌堆顶部的牌匹配<strong>花色</strong>或<strong>点数</strong>。</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-pink-500/20 text-pink-300 rounded flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <p><strong className="text-white">疯狂6点：</strong>数字“6”是万能牌，可在任何时候打出，并指定新的花色。</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-pink-500/20 text-pink-300 rounded flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <p>无牌可出时必须摸一张牌。摸牌后回合结束。</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
