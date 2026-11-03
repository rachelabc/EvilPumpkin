import React from 'react';
import { GameStats, RacerCharacter } from '../types/game';
import { Trophy, RotateCcw, ArrowLeft, Flame, Sparkles, Heart, Zap, Crosshair } from 'lucide-react';

const GHOST_KART_SRC = '/src/assets/images/pastel_ghost_kart_1793316656927.jpg';
const BOSS_AVATAR_SRC = '/src/assets/images/evil_pumpkin_boss_1793316656643.jpg';

interface FinishScreenProps {
  stats: GameStats;
  racer: RacerCharacter;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  stats,
  racer,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const isVictory = stats.isVictory;

  // Format time
  const minutes = Math.floor(stats.timeElapsed / 60);
  const seconds = Math.floor(stats.timeElapsed % 60);
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-[#100720] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full filter blur-[120px] opacity-25 ${
            isVictory ? 'bg-gradient-to-r from-pink-500 to-cyan-400' : 'bg-gradient-to-r from-red-600 to-purple-800'
          }`}
        />
      </div>

      <div className="relative z-10 max-w-xl w-full bg-[#1b1030]/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Top Header Badge & Illustration */}
        <div className="relative mb-4">
          <div
            className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 shadow-2xl p-1 mx-auto transition-transform hover:scale-105 ${
              isVictory
                ? 'border-pink-400 bg-gradient-to-br from-pink-500/30 to-purple-600/30 shadow-[0_0_25px_rgba(244,114,182,0.6)]'
                : 'border-red-500 bg-gradient-to-br from-red-900/40 to-black/60 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
            }`}
          >
            <img
              src={isVictory ? GHOST_KART_SRC : BOSS_AVATAR_SRC}
              alt={isVictory ? 'Victory Racer' : 'Evil Pumpkin'}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Floating Trophy or Skull badge */}
          <div
            className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white ${
              isVictory ? 'bg-amber-400 text-black' : 'bg-red-600 text-white'
            }`}
          >
            {isVictory ? <Trophy size={20} /> : <span className="text-lg">💀</span>}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">
          {isVictory ? '🎃 EVIL PUMPKIN DEFEATED!' : 'THE EVIL PUMPKIN GOT YOU!'}
        </h2>
        <p className="text-xs md:text-sm text-purple-300 max-w-md mb-6">
          {isVictory
            ? `Spectacular driving! You out-maneuvered Jack the Dread and saved the Haunted Mansion with ${racer.name}!`
            : `Your kart spun out under Jack's relentless pursuit. Collect more weapons and chain drift boosts to strike back!`}
        </p>

        {/* Big Rank Display (for Victory or Performance) */}
        <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-black/40 border border-purple-500/30 w-full justify-around">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
              Driver Rank
            </span>
            <span
              className={`text-4xl font-black font-mono tracking-tight drop-shadow-md ${
                stats.rank === 'S'
                  ? 'text-yellow-300'
                  : stats.rank === 'A'
                  ? 'text-pink-400'
                  : stats.rank === 'B'
                  ? 'text-cyan-300'
                  : 'text-purple-300'
              }`}
            >
              RANK {stats.rank}
            </span>
          </div>

          <div className="h-10 w-px bg-purple-800/60" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
              Final Score
            </span>
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-white tabular-nums">
              {stats.finalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Race Statistics Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full mb-6 text-left">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Time Survived</span>
            <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">{timeFormatted}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Boss Damage</span>
            <span className="text-sm font-bold font-mono text-rose-300 tabular-nums">{stats.damageDealt} HP</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Candies Collected</span>
            <span className="text-sm font-bold font-mono text-amber-300 tabular-nums">🍬 {stats.candiesCollected}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Drift Boosts</span>
            <span className="text-sm font-bold font-mono text-pink-300 tabular-nums">🔥 {stats.driftBoostsTriggered}x</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Weapons Deployed</span>
            <span className="text-sm font-bold font-mono text-teal-300 tabular-nums">💥 {stats.itemsUsed}x</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-semibold block">Difficulty</span>
            <span className="text-sm font-bold font-mono text-purple-200 uppercase">{stats.difficulty}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] transition-all text-white font-bold text-sm shadow-[0_0_20px_rgba(244,114,182,0.5)] flex items-center justify-center gap-2 border border-white/20"
          >
            <RotateCcw size={18} />
            <span>{isVictory ? 'RACE AGAIN' : 'REMATCH JACK'}</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/80 active:scale-[0.98] transition-all text-purple-200 font-bold text-sm flex items-center justify-center gap-2 border border-purple-500/40"
          >
            <ArrowLeft size={18} />
            <span>START MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
