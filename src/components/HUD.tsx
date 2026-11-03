import React, { useEffect, useRef } from 'react';
import { Boss, Difficulty, ItemSlot, Kart, RacerCharacter, WeaponType } from '../types/game';
import { WEAPON_REGISTRY } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { MAP_HEIGHT, MAP_WIDTH, ROOM_ZONES } from '../utils/mansionMap';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Pause, 
  Sparkles, 
  Flame, 
  Crosshair, 
  ShieldAlert, 
  Zap,
  Navigation,
  Compass
} from 'lucide-react';

// Use generated boss portrait
const BOSS_AVATAR_SRC = '/src/assets/images/evil_pumpkin_boss_1793316656643.jpg';

interface HUDProps {
  kart: Kart;
  boss: Boss;
  racer: RacerCharacter;
  itemSlot: ItemSlot;
  difficulty: Difficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onFireWeapon: () => void;
  onShootCorn: () => void;
  // Touch inputs for mobile/tablets
  onSteerTouch: (dir: -1 | 0 | 1) => void;
  onGasTouch: (gas: boolean) => void;
  onBrakeTouch: (brake: boolean) => void;
  onDriftTouch: (drift: boolean) => void;
  onTouchShoot: (shooting: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  kart,
  boss,
  racer,
  itemSlot,
  difficulty,
  isMuted,
  onToggleMute,
  onPause,
  onFireWeapon,
  onShootCorn,
  onSteerTouch,
  onGasTouch,
  onBrakeTouch,
  onDriftTouch,
  onTouchShoot,
}) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute distance between player and boss
  const dx = kart.x - boss.x;
  const dy = kart.y - boss.y;
  const dist = Math.hypot(dx, dy);
  const distMeters = Math.round(dist / 15);

  const isBossClose = dist < 500;
  const isBossCritical = dist < 280;

  // Boss HP percent
  const bossHpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));

  // Current active weapon info
  const activeWeaponInfo = itemSlot.weapon ? WEAPON_REGISTRY[itemSlot.weapon] : null;
  const rouletteWeaponInfo = itemSlot.rouletteItem ? WEAPON_REGISTRY[itemSlot.rouletteItem] : null;

  // Minimap render
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(18, 10, 31, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Scale factors
    const scaleX = w / MAP_WIDTH;
    const scaleY = h / MAP_HEIGHT;

    // Draw rooms
    ROOM_ZONES.forEach((room) => {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(room.x * scaleX, room.y * scaleY, room.w * scaleX, room.h * scaleY);
      ctx.strokeRect(room.x * scaleX, room.y * scaleY, room.w * scaleX, room.h * scaleY);
    });

    // Draw Boss dot (pulsing red/magenta pumpkin)
    const bossMapX = boss.x * scaleX;
    const bossMapY = boss.y * scaleY;
    ctx.fillStyle = boss.phase === 3 ? '#ef4444' : '#f43f5e';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(bossMapX, bossMapY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Player dot (mint/cyan arrow)
    const playerMapX = kart.x * scaleX;
    const playerMapY = kart.y * scaleY;
    ctx.fillStyle = '#6ee7b7';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.save();
    ctx.translate(playerMapX, playerMapY);
    ctx.rotate(kart.angle);
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [kart.x, kart.y, kart.angle, boss.x, boss.y, boss.phase]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 md:p-5">
      {/* TOP BAR: Player Health & Mario Kart Item Box Roulette & Boss HP Bar & Audio */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left Zone: Player Status & Hearts & Weapons */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Hearts & Candy Score */}
          <div className="flex items-center gap-2 bg-[#1e1333]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-purple-500/30 shadow-lg">
            <div className="flex items-center gap-1">
              {Array.from({ length: racer.health }).map((_, i) => (
                <Heart
                  key={i}
                  size={20}
                  className={`transition-all duration-300 ${
                    i < kart.hp
                      ? 'fill-pink-400 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                      : 'fill-transparent text-purple-900/60'
                  }`}
                />
              ))}
            </div>

            <span className="text-purple-400/50 text-xs">|</span>

            {/* Candies */}
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-sm">
              <span className="text-base">🍬</span>
              <span className="tabular-nums font-mono">{kart.candies}</span>
            </div>

            <span className="text-purple-400/50 text-xs">|</span>

            {/* Score */}
            <div className="text-purple-200 text-xs font-medium">
              <span className="text-purple-400 text-[10px] uppercase tracking-wider block">Score</span>
              <span className="text-sm font-bold text-white tabular-nums font-mono">{kart.score}</span>
            </div>
          </div>

          {/* Weapon Slots Row: Corn Cannon (Always Available) + Mystery Item Box */}
          <div className="flex items-center gap-2">
            {/* Primary Weapon: Corn Blaster */}
            <div
              onClick={onShootCorn}
              className="relative overflow-hidden w-20 h-22 md:w-24 md:h-26 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/80 to-[#1e1333]/90 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] p-1 text-center"
              title="Click or press [F] to shoot corn at the evil pumpkin!"
            >
              <div className="text-2xl md:text-3xl mb-0.5 animate-pulse">🌽</div>
              <span className="text-[10px] font-bold text-amber-300 uppercase leading-tight">
                Corn Cannon
              </span>
              <div className="mt-1 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-full border border-amber-500/40">
                <span className="text-[10px] font-mono font-bold text-amber-200 tabular-nums">
                  {kart.cornAmmo ?? 15}/{kart.maxCornAmmo ?? 15}
                </span>
              </div>
              <span className="text-[9px] text-amber-400/80 font-semibold mt-0.5">
                [F] / Click
              </span>
            </div>

            {/* Mario Kart Mystery Item Box Roulette */}
            <div
              onClick={() => {
                if (itemSlot.weapon && !itemSlot.isRolling) {
                  onFireWeapon();
                }
              }}
              className={`relative overflow-hidden w-20 h-22 md:w-24 md:h-26 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-xl p-1 text-center ${
                itemSlot.isRolling
                  ? 'bg-purple-950/80 border-cyan-400 animate-pulse shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                  : itemSlot.weapon
                  ? 'bg-gradient-to-br from-purple-900/90 to-fuchsia-950/90 border-fuchsia-400/80 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.5)]'
                  : 'bg-[#180f28]/70 border-purple-800/40 opacity-70'
              }`}
              title={itemSlot.weapon ? 'Click to fire super weapon' : 'Mystery Item Box'}
            >
              {itemSlot.isRolling ? (
                <div className="flex flex-col items-center justify-center gap-0.5 animate-bounce">
                  <div className="w-8 h-8 rounded-lg bg-purple-700/60 flex items-center justify-center text-xl shadow-inner border border-purple-400/40">
                    {rouletteWeaponInfo?.type === 'CANDY_MISSILE' && '🚀'}
                    {rouletteWeaponInfo?.type === 'GHOST_HOMING' && '👻'}
                    {rouletteWeaponInfo?.type === 'PUMPKIN_TRAP' && '🎃'}
                    {rouletteWeaponInfo?.type === 'STAR_SHIELD' && '⭐'}
                    {rouletteWeaponInfo?.type === 'NITRO_ELIXIR' && '🧪'}
                    {rouletteWeaponInfo?.type === 'LIGHTNING_ZAP' && '⚡'}
                    {!rouletteWeaponInfo && '?'}
                  </div>
                  <span className="text-[9px] font-bold text-cyan-300 tracking-wider uppercase animate-pulse">
                    Rolling...
                  </span>
                </div>
              ) : activeWeaponInfo ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-2xl mb-0.5 drop-shadow-md">
                    {activeWeaponInfo.type === 'CANDY_MISSILE' && '🚀'}
                    {activeWeaponInfo.type === 'GHOST_HOMING' && '👻'}
                    {activeWeaponInfo.type === 'PUMPKIN_TRAP' && '🎃'}
                    {activeWeaponInfo.type === 'STAR_SHIELD' && '⭐'}
                    {activeWeaponInfo.type === 'NITRO_ELIXIR' && '🧪'}
                    {activeWeaponInfo.type === 'LIGHTNING_ZAP' && '⚡'}
                  </div>
                  <span className="text-[9px] font-bold text-fuchsia-200 uppercase leading-none max-w-[70px] truncate">
                    {activeWeaponInfo.name}
                  </span>
                  <div className="mt-1 flex items-center gap-1 bg-black/40 px-1.5 py-0.2 rounded-full border border-fuchsia-400/30">
                    <span className="text-[9px] text-yellow-300 font-bold font-mono">
                      {itemSlot.charges}x
                    </span>
                    <span className="text-[8px] text-fuchsia-300 font-medium">USE</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-purple-400/60">
                  <span className="text-2xl font-bold font-mono">?</span>
                  <span className="text-[8px] uppercase tracking-wider font-semibold">Super Box</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Zone: Evil Pumpkin Boss Status */}
        <div className="flex flex-col items-center max-w-xs md:max-w-md w-full">
          <div className="w-full bg-[#1e1333]/90 backdrop-blur-md rounded-2xl border border-rose-500/40 p-2.5 md:p-3 shadow-2xl flex items-center gap-3">
            {/* Boss Portrait */}
            <div className="relative shrink-0">
              <img
                src={BOSS_AVATAR_SRC}
                alt="Evil Pumpkin Boss"
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border-2 transition-all ${
                  boss.phase === 3
                    ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                    : 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                }`}
              />
              {boss.stunTimer > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-black font-bold px-1 rounded-full animate-spin">
                  ⭐
                </span>
              )}
            </div>

            {/* Boss Name & Health Gauge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm font-bold text-orange-200 truncate">
                    {boss.phase === 3 ? '🔥 JACK THE ENRAGED' : boss.phase === 2 ? '⚡ JACK THE DREAD' : '🎃 EVIL JACK'}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 border border-purple-500/30">
                    Phase {boss.phase}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-300 tabular-nums shrink-0">
                  {Math.round(boss.hp)} / {boss.maxHp}
                </span>
              </div>

              {/* Health Progress Bar */}
              <div className="relative w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-rose-900/60 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    boss.phase === 3
                      ? 'bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                      : boss.phase === 2
                      ? 'bg-gradient-to-r from-amber-600 to-orange-400'
                      : 'bg-gradient-to-r from-orange-500 to-amber-300'
                  }`}
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>

              {/* Distance Radar Indicator */}
              <div className="flex items-center justify-between text-[11px] mt-1.5 font-medium">
                <div className="flex items-center gap-1">
                  <Navigation size={12} className={isBossClose ? 'text-red-400 animate-spin' : 'text-purple-400'} />
                  <span className="text-slate-300">
                    Distance: <strong className="font-mono text-white">{distMeters}m</strong>
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isBossCritical
                      ? 'text-red-400 animate-pulse'
                      : isBossClose
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {isBossCritical ? '⚠️ DANGER! VERY CLOSE' : isBossClose ? 'Approaching!' : 'Safe Distance'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: Controls (Mute/Pause) & Minimap */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 bg-[#1e1333]/90 backdrop-blur-md p-1.5 rounded-2xl border border-purple-500/30 shadow-lg">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/50 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={onPause}
              className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-800/50 transition-colors"
              title="Pause Game"
            >
              <Pause size={18} />
            </button>
          </div>

          {/* Minimap Card */}
          <div className="relative bg-[#180f28]/90 backdrop-blur-md p-1.5 rounded-2xl border border-purple-500/30 shadow-xl overflow-hidden">
            <canvas
              ref={minimapCanvasRef}
              width={130}
              height={110}
              className="rounded-xl block"
            />
            <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[9px] text-purple-300 font-medium">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> You
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Boss
              </span>
            </div>
          </div>

          {/* Speedometer & Drift Turbo meter */}
          <div className="bg-[#1e1333]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-purple-500/30 shadow-lg text-right">
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Speed</div>
            <div className="text-base font-extrabold font-mono text-cyan-300">
              {Math.round(kart.speed * 28)}{' '}
              <span className="text-[10px] font-normal text-purple-300">km/h</span>
            </div>

            {/* Drift Tier indicator */}
            {kart.isDrifting && (
              <div className="mt-0.5 flex items-center justify-end gap-1">
                <Flame size={12} className={kart.driftTier === 3 ? 'text-emerald-400' : kart.driftTier === 2 ? 'text-pink-400' : 'text-sky-400'} />
                <span
                  className={`text-[9px] font-bold uppercase ${
                    kart.driftTier === 3
                      ? 'text-emerald-300 animate-pulse'
                      : kart.driftTier === 2
                      ? 'text-pink-300'
                      : 'text-sky-300'
                  }`}
                >
                  {kart.driftTier === 3 ? 'ULTRA BOOST!' : kart.driftTier === 2 ? 'SUPER BOOST' : 'DRIFTING'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ZONE: Mobile / Touch On-Screen Controls & Keyboard Controls Hint */}
      <div className="w-full flex flex-col items-center gap-2 pointer-events-auto select-none pb-1">
        {/* Clean Keyboard Hint Banner */}
        <div className="hidden sm:flex items-center gap-3 bg-[#180f28]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-500/30 text-[11px] text-purple-200 shadow-md">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-purple-400/40 text-[10px] text-white">SPACE</kbd> Gas
          </span>
          <span className="text-purple-600">·</span>
          <span className="flex items-center gap-1 font-semibold text-cyan-300">
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-purple-400/40 text-[10px] text-white">ARROWS</kbd> Move
          </span>
          <span className="text-purple-600">·</span>
          <span className="flex items-center gap-1 font-semibold text-yellow-300">
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-purple-400/40 text-[10px] text-white">F / CLICK</kbd> Shoot Corn 🌽
          </span>
          <span className="text-purple-600">·</span>
          <span className="flex items-center gap-1 font-semibold text-pink-300">
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-purple-400/40 text-[10px] text-white">SHIFT</kbd> Drift
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="w-full flex items-end justify-between gap-2 md:gap-4">
          {/* Left Steering Pad */}
          <div className="flex items-center gap-2">
            <button
              onTouchStart={(e) => { e.preventDefault(); onSteerTouch(-1); }}
              onTouchEnd={(e) => { e.preventDefault(); onSteerTouch(0); }}
              onMouseDown={() => onSteerTouch(-1)}
              onMouseUp={() => onSteerTouch(0)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-purple-900/60 active:bg-purple-600/80 backdrop-blur-md border border-purple-400/40 text-white flex items-center justify-center font-bold text-xl shadow-lg active:scale-95 transition-transform"
              title="Steer Left (Left Arrow)"
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); onSteerTouch(1); }}
              onTouchEnd={(e) => { e.preventDefault(); onSteerTouch(0); }}
              onMouseDown={() => onSteerTouch(1)}
              onMouseUp={() => onSteerTouch(0)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-purple-900/60 active:bg-purple-600/80 backdrop-blur-md border border-purple-400/40 text-white flex items-center justify-center font-bold text-xl shadow-lg active:scale-95 transition-transform"
              title="Steer Right (Right Arrow)"
            >
              ▶
            </button>
          </div>

          {/* Center Buttons: Shoot Corn & Super Weapon */}
          <div className="flex items-center gap-2">
            {/* Dedicated Shoot Corn Button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); onTouchShoot(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onTouchShoot(false); }}
              onMouseDown={() => onTouchShoot(true)}
              onMouseUp={() => onTouchShoot(false)}
              onClick={onShootCorn}
              className="px-4 py-3 md:px-6 md:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 border-2 border-amber-200 text-white font-extrabold text-sm md:text-base shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center gap-2 transition-transform cursor-pointer"
              title="Shoot Candy Corn at the Evil Pumpkin ([F] or Click)"
            >
              <span className="text-xl md:text-2xl animate-bounce">🌽</span>
              <div className="text-left leading-tight">
                <span className="block text-xs md:text-sm font-black">SHOOT CORN</span>
                <span className="block text-[9px] md:text-[10px] text-amber-100 font-normal">[F] or Click</span>
              </div>
            </button>

            {/* Super Weapon Fire Button (if active) */}
            {activeWeaponInfo && (
              <button
                onClick={onFireWeapon}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 active:scale-95 border-2 border-white/80 shadow-[0_0_20px_rgba(244,114,182,0.6)] text-white font-extrabold text-xs flex flex-col items-center justify-center gap-0.5 transition-transform"
                title="Fire Super Mystery Weapon"
              >
                <span className="text-lg">💥</span>
                <span>SUPER</span>
              </button>
            )}
          </div>

          {/* Right Driving Pedals (Gas, Brake, Drift) */}
          <div className="flex items-center gap-2">
            {/* Drift Button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); onDriftTouch(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onDriftTouch(false); }}
              onMouseDown={() => onDriftTouch(true)}
              onMouseUp={() => onDriftTouch(false)}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition-all ${
                kart.isDrifting
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                  : 'bg-purple-900/60 text-cyan-300 border-purple-400/40'
              }`}
              title="Drift & Turbo Boost (Shift)"
            >
              <Sparkles size={16} />
              <span>DRIFT</span>
            </button>

            {/* Reverse / Brake (Down Arrow) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); onBrakeTouch(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onBrakeTouch(false); }}
              onMouseDown={() => onBrakeTouch(true)}
              onMouseUp={() => onBrakeTouch(false)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-purple-950/70 active:bg-rose-900/80 border border-purple-500/30 text-rose-300 font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
              title="Brake / Reverse (Down Arrow)"
            >
              <span>BRAKE</span>
              <span className="text-[10px] text-purple-400">REV</span>
            </button>

            {/* Gas / Accelerate (Spacebar & Up Arrow) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); onGasTouch(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onGasTouch(false); }}
              onMouseDown={() => onGasTouch(true)}
              onMouseUp={() => onGasTouch(false)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-t from-emerald-600 to-teal-400 active:from-emerald-700 active:to-teal-500 border-2 border-emerald-300 text-white font-extrabold text-sm flex flex-col items-center justify-center gap-0.5 shadow-[0_0_20px_rgba(16,185,129,0.6)] active:scale-95 transition-transform"
              title="Accelerate / Gas (Spacebar or Up Arrow)"
            >
              <Zap size={22} className="fill-white" />
              <span>GAS</span>
              <span className="text-[9px] text-emerald-200 font-normal">SPACE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
