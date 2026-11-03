import React, { useState } from 'react';
import { Difficulty, HighScoreEntry, RacerCharacter } from '../types/game';
import { RACERS } from '../utils/constants';
import { Sparkles, Trophy, Zap, Heart, Gauge, Flame, Volume2, VolumeX, ShieldAlert, Play } from 'lucide-react';

const BANNER_SRC = '/src/assets/images/pastel_haunt_banner_1793316655353.jpg';
const GHOST_KART_SRC = '/src/assets/images/pastel_ghost_kart_1793316656927.jpg';

interface StartScreenProps {
  selectedRacer: RacerCharacter;
  onSelectRacer: (racer: RacerCharacter) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  highScores: HighScoreEntry[];
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedRacer,
  onSelectRacer,
  difficulty,
  onSelectDifficulty,
  onStartGame,
  highScores,
  isMuted,
  onToggleMute,
}) => {
  const [showHighScores, setShowHighScores] = useState(false);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-[#120924] text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Background Graphic with Scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={BANNER_SRC}
          alt="Pastel Haunted House"
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120924]/60 via-[#120924]/80 to-[#120924]" />
      </div>

      {/* Top Header Row */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.6)]">
            <span className="text-xl">🎃</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              SPOOKY KART
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-400/30 text-purple-200">
                Haunted House Chase
              </span>
            </h1>
            <p className="text-xs text-purple-300">
              Outrun the Giant Evil Pumpkin · Drift & Battle in the Mansion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHighScores(!showHighScores)}
            className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-xs font-medium text-purple-200 flex items-center gap-1.5 transition-colors"
          >
            <Trophy size={14} className="text-yellow-400" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-xs font-medium text-purple-200 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Hero Preview & Difficulty */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-2xl bg-gradient-to-br from-purple-950/80 to-[#1e1333]/90 p-4">
            <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden border border-purple-400/20 group">
              <img
                src={GHOST_KART_SRC}
                alt="Pastel Ghost Kart"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <div>
                  <span className="text-[11px] font-semibold text-pink-300 uppercase tracking-wider block">
                    Featured Racer
                  </span>
                  <span className="text-base font-bold text-white">Pip the Ghost & Candy Kart</span>
                </div>
              </div>
            </div>

            {/* Difficulty Selector Tabs */}
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2 block">
                Select Chase Intensity
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-2xl border border-purple-500/30">
                {(['CASUAL', 'CLASSIC', 'NIGHTMARE'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onSelectDifficulty(d)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                      difficulty === d
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                        : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
                    }`}
                  >
                    {d === 'CASUAL' && 'Chill Spook'}
                    {d === 'CLASSIC' && 'Classic'}
                    {d === 'NIGHTMARE' && 'Nightmare 🔥'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-purple-300/80 mt-2 px-1">
                {difficulty === 'CASUAL' && 'Gentle boss pace, abundant mystery items, ideal for relaxing drifting.'}
                {difficulty === 'CLASSIC' && 'Mario Kart arcade balance: sharp boss pursuit, active attack dodging.'}
                {difficulty === 'NIGHTMARE' && 'Fierce evil pumpkin, relentless attacks, +50% bonus score multiplier!'}
              </p>
            </div>
          </div>

          {/* Quick Controls Cheat Sheet */}
          <div className="p-3.5 rounded-2xl bg-[#1e1333]/70 border border-purple-500/20 text-xs">
            <span className="font-bold text-purple-200 block mb-1">🎮 How to Play & Controls</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-300">
              <div><strong className="text-white">SPACE / Up:</strong> Gas (Accelerate)</div>
              <div><strong className="text-white">Arrows / WASD:</strong> Steer Direction</div>
              <div><strong className="text-white">F / Click:</strong> Shoot Corn 🌽</div>
              <div><strong className="text-white">Shift:</strong> Power Drift & Turbo</div>
            </div>
          </div>
        </div>

        {/* Right Side: Racer Selection Grid & Start CTA */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-200">
                Choose Your Pastel Racer
              </h2>
              <span className="text-xs text-purple-400">
                Selected: <strong className="text-pink-300">{selectedRacer.name}</strong>
              </span>
            </div>

            {/* Racers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RACERS.map((racer) => {
                const isSelected = racer.id === selectedRacer.id;
                return (
                  <div
                    key={racer.id}
                    onClick={() => onSelectRacer(racer)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-900/90 to-fuchsia-950/90 border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)] scale-[1.02]'
                        : 'bg-[#1a102f]/80 border-purple-800/40 hover:border-purple-600 hover:bg-[#20143a]/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shadow-md"
                          style={{ backgroundColor: racer.colorTheme.primary, color: '#1e1333' }}
                        >
                          {racer.id === 'pip' && '👻'}
                          {racer.id === 'luna' && '🐱'}
                          {racer.id === 'barnaby' && '🦇'}
                          {racer.id === 'mummy' && '🍬'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{racer.name}</h3>
                          <span className="text-[10px] text-purple-300 block">{racer.title}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500 text-white">
                          READY
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-purple-200/80 mb-2.5 line-clamp-2">
                      {racer.description}
                    </p>

                    {/* Stat Bars */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <div className="flex items-center justify-between text-purple-300">
                        <span>Speed</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-1.5 rounded-sm ${
                                i < racer.speed ? 'bg-cyan-400' : 'bg-purple-950'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-purple-300">
                        <span>Handling</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-1.5 rounded-sm ${
                                i < racer.handling ? 'bg-emerald-400' : 'bg-purple-950'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-purple-300">
                        <span>Turbo Boost</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-1.5 rounded-sm ${
                                i < racer.boost ? 'bg-pink-400' : 'bg-purple-950'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-purple-300">
                        <span>Hearts</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-1.5 rounded-sm ${
                                i < racer.health ? 'bg-rose-400' : 'bg-purple-950'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weapons Carousel info */}
          <div className="p-3 rounded-2xl bg-[#1e1333]/80 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <span className="font-bold text-white block">Mystery Weapon Pickups</span>
                <span className="text-[11px] text-purple-300">
                  Candy Missiles · Homing Ghosts · Jack-o-Traps · Star Shield · Nitro
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-500/30">
              Mario Kart Style
            </span>
          </div>

          {/* Big Start Button */}
          <button
            onClick={onStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:via-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-extrabold text-base md:text-lg shadow-[0_0_30px_rgba(217,70,239,0.5)] flex items-center justify-center gap-3 border-2 border-white/20"
          >
            <Play size={22} className="fill-white" />
            <span>START THE HAUNTED CHASE</span>
          </button>
        </div>
      </main>

      {/* Leaderboard Modal / Overlay */}
      {showHighScores && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1b1030] rounded-3xl border border-purple-500/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Mansion Hall of Fame</h3>
              </div>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-purple-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-purple-900/40"
              >
                Close
              </button>
            </div>

            {highScores.length === 0 ? (
              <div className="py-8 text-center text-purple-300 text-sm">
                <p>No high scores recorded yet.</p>
                <p className="text-xs text-purple-400 mt-1">
                  Defeat the Evil Pumpkin to earn your place on the board!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {highScores.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/30 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 w-5">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-white block">{entry.characterName}</span>
                        <span className="text-[10px] text-purple-400">
                          {entry.difficulty} · {entry.isVictory ? '🏆 Defeated Boss' : '💀 Survived'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-cyan-300 tabular-nums block">
                        {entry.score.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono">{entry.timeFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center text-[11px] text-purple-400/60 pt-4">
        Spooky Kart Arcade · Pastel Halloween Edition · Use Arrow Keys / WASD + Shift to Drift
      </footer>
    </div>
  );
};
