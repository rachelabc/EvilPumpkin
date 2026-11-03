import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Boss, 
  BoostPad, 
  CandyPickup, 
  Difficulty, 
  GameStats, 
  ItemBox, 
  ItemSlot, 
  Kart, 
  Particle, 
  Projectile, 
  RacerCharacter, 
  SkidMark, 
  Trap, 
  WeaponType 
} from '../types/game';
import { 
  BOSS_WAYPOINTS, 
  generateCandies, 
  INITIAL_BOOST_PADS, 
  INITIAL_ITEM_BOXES, 
  MANSION_WALLS, 
  MAP_HEIGHT, 
  MAP_WIDTH 
} from '../utils/mansionMap';
import { soundManager } from '../utils/audio';
import { WEAPON_REGISTRY } from '../utils/constants';
import { renderGameScene } from '../utils/renderer';
import { HUD } from './HUD';

interface GameCanvasProps {
  racer: RacerCharacter;
  difficulty: Difficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onFinishGame: (stats: GameStats) => void;
  onReturnToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  racer,
  difficulty,
  isMuted,
  onToggleMute,
  onFinishGame,
  onReturnToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Stats tracking for finish screen
  const statsRef = useRef<{
    startTime: number;
    damageDealt: number;
    candiesCollected: number;
    itemsUsed: number;
    driftBoosts: number;
  }>({
    startTime: Date.now(),
    damageDealt: 0,
    candiesCollected: 0,
    itemsUsed: 0,
    driftBoosts: 0,
  });

  // State representations for HUD syncing
  const [hudKart, setHudKart] = useState<Kart>({
    x: 1300,
    y: 1850,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    speed: 0,
    maxSpeed: 7 + racer.speed * 0.7,
    acceleration: 0.18,
    reverseSpeed: 3,
    turnSpeed: 0.05 + racer.handling * 0.006,
    friction: 0.965,
    isDrifting: false,
    driftDirection: 0,
    driftTime: 0,
    driftTier: 0,
    hp: racer.health,
    maxHp: racer.health,
    invulnerableTime: 0,
    boostTimer: 0,
    boostMultiplier: 1,
    starShieldTimer: 0,
    lightningEmpTimer: 0,
    score: 0,
    candies: 0,
    characterId: racer.id,
    cornAmmo: 15,
    maxCornAmmo: 15,
  });

  const [hudBoss, setHudBoss] = useState<Boss>({
    x: 450,
    y: 1550,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 4,
    baseSpeed: difficulty === 'CASUAL' ? 4.2 : difficulty === 'CLASSIC' ? 5.2 : 6.2,
    hp: 500,
    maxHp: 500,
    phase: 1,
    stunTimer: 0,
    shrunkTimer: 0,
    attackTimer: 0,
    attackCooldown: difficulty === 'CASUAL' ? 5.0 : difficulty === 'CLASSIC' ? 3.5 : 2.5,
    currentAttack: 'NONE',
    targetWayPointIndex: 0,
    glowPhase: 0,
  });

  const [hudItemSlot, setHudItemSlot] = useState<ItemSlot>({
    weapon: null,
    charges: 0,
    isRolling: false,
    rouletteItem: null,
    rollEndTime: 0,
  });

  // Mutable Game State Ref for 60fps Loop
  const gameStateRef = useRef<{
    kart: Kart;
    boss: Boss;
    itemSlot: ItemSlot;
    itemBoxes: ItemBox[];
    candies: CandyPickup[];
    boostPads: BoostPad[];
    traps: Trap[];
    projectiles: Projectile[];
    particles: Particle[];
    skidMarks: SkidMark[];
    keys: { [key: string]: boolean };
    touchGas: boolean;
    touchBrake: boolean;
    touchSteer: -1 | 0 | 1;
    touchDrift: boolean;
    touchShoot: boolean;
    cornCooldown: number;
    cornAmmoRegen: number;
    lastFrameTime: number;
    gameTime: number;
    isGameOver: boolean;
  }>({
    kart: {
      x: 1300,
      y: 1850,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 7 + racer.speed * 0.7,
      acceleration: 0.18,
      reverseSpeed: 3,
      turnSpeed: 0.05 + racer.handling * 0.006,
      friction: 0.965,
      isDrifting: false,
      driftDirection: 0,
      driftTime: 0,
      driftTier: 0,
      hp: racer.health,
      maxHp: racer.health,
      invulnerableTime: 0,
      boostTimer: 0,
      boostMultiplier: 1,
      starShieldTimer: 0,
      lightningEmpTimer: 0,
      score: 0,
      candies: 0,
      characterId: racer.id,
      cornAmmo: 15,
      maxCornAmmo: 15,
    },
    boss: {
      x: 450,
      y: 1550,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 4,
      baseSpeed: difficulty === 'CASUAL' ? 4.2 : difficulty === 'CLASSIC' ? 5.2 : 6.2,
      hp: 500,
      maxHp: 500,
      phase: 1,
      stunTimer: 0,
      shrunkTimer: 0,
      attackTimer: 0,
      attackCooldown: difficulty === 'CASUAL' ? 5.0 : difficulty === 'CLASSIC' ? 3.5 : 2.5,
      currentAttack: 'NONE',
      targetWayPointIndex: 0,
      glowPhase: 0,
    },
    itemSlot: {
      weapon: null,
      charges: 0,
      isRolling: false,
      rouletteItem: null,
      rollEndTime: 0,
    },
    itemBoxes: JSON.parse(JSON.stringify(INITIAL_ITEM_BOXES)),
    candies: generateCandies(),
    boostPads: INITIAL_BOOST_PADS,
    traps: [],
    projectiles: [],
    particles: [],
    skidMarks: [],
    keys: {},
    touchGas: false,
    touchBrake: false,
    touchSteer: 0,
    touchDrift: false,
    touchShoot: false,
    cornCooldown: 0,
    cornAmmoRegen: 0,
    lastFrameTime: performance.now(),
    gameTime: 0,
    isGameOver: false,
  });

  // Shoot Candy Corn at the chasing Evil Pumpkin
  const shootCandyCorn = useCallback(() => {
    const state = gameStateRef.current;
    const { kart, boss } = state;

    if (state.cornCooldown > 0) return;
    if (kart.cornAmmo <= 0) return;

    state.cornCooldown = 0.16; // rapid fire
    kart.cornAmmo = Math.max(0, kart.cornAmmo - 1);
    statsRef.current.itemsUsed++;
    soundManager.playCornShoot();

    // Calculate aim direction:
    // If Evil Pumpkin is chasing behind or nearby (within 850px),
    // target directly at the Evil Pumpkin so the player can shoot back while fleeing!
    const dx = boss.x - kart.x;
    const dy = boss.y - kart.y;
    const distToBoss = Math.hypot(dx, dy);

    let projAngle = kart.angle;
    const isTargetingBoss = distToBoss < 850;

    if (isTargetingBoss) {
      projAngle = Math.atan2(dy, dx);
    }

    state.projectiles.push({
      id: `corn-${Date.now()}-${Math.random()}`,
      x: kart.x + Math.cos(projAngle) * 32,
      y: kart.y + Math.sin(projAngle) * 32,
      vx: Math.cos(projAngle) * 17,
      vy: Math.sin(projAngle) * 17,
      angle: projAngle,
      type: 'CANDY',
      damage: 18,
      lifetime: 0,
      maxLifetime: 2.5,
      homing: isTargetingBoss,
    });

    // Muzzle sparks
    for (let i = 0; i < 4; i++) {
      state.particles.push({
        x: kart.x + Math.cos(projAngle) * 26,
        y: kart.y + Math.sin(projAngle) * 26,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: '#facc15',
        size: 4,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 0.25,
        shape: 'spark',
      });
    }

    setHudKart({ ...kart });
  }, []);

  // Weapon fire handler (Super Mystery Box weapons or fallback to Corn)
  const fireCurrentWeapon = useCallback(() => {
    const state = gameStateRef.current;
    const { kart, boss, itemSlot } = state;

    // If no super weapon is ready, fire candy corn!
    if (!itemSlot.weapon || itemSlot.isRolling || itemSlot.charges <= 0) {
      shootCandyCorn();
      return;
    }

    statsRef.current.itemsUsed++;

    const wType = itemSlot.weapon;

    if (wType === 'CANDY_MISSILE') {
      soundManager.playFireMissile();
      // Fire candy rocket
      const projAngle = kart.angle;
      state.projectiles.push({
        id: `candy-${Date.now()}-${Math.random()}`,
        x: kart.x + Math.cos(projAngle) * 35,
        y: kart.y + Math.sin(projAngle) * 35,
        vx: Math.cos(projAngle) * 16,
        vy: Math.sin(projAngle) * 16,
        angle: projAngle,
        type: 'CANDY',
        damage: 25,
        lifetime: 0,
        maxLifetime: 2.2,
      });
      // Fire sparks
      for (let i = 0; i < 6; i++) {
        state.particles.push({
          x: kart.x + Math.cos(projAngle) * 30,
          y: kart.y + Math.sin(projAngle) * 30,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: '#fb923c',
          size: 4,
          alpha: 1,
          lifetime: 0,
          maxLifetime: 0.3,
          shape: 'spark',
        });
      }
    } else if (wType === 'GHOST_HOMING') {
      soundManager.playFireMissile();
      const projAngle = kart.angle;
      state.projectiles.push({
        id: `ghost-${Date.now()}`,
        x: kart.x + Math.cos(projAngle) * 35,
        y: kart.y + Math.sin(projAngle) * 35,
        vx: Math.cos(projAngle) * 13,
        vy: Math.sin(projAngle) * 13,
        angle: projAngle,
        type: 'GHOST_HOMING',
        damage: 65,
        lifetime: 0,
        maxLifetime: 4.0,
        homing: true,
      });
    } else if (wType === 'PUMPKIN_TRAP') {
      soundManager.playDropTrap();
      // Drop behind kart
      const dropAngle = kart.angle + Math.PI;
      state.traps.push({
        id: `trap-${Date.now()}`,
        x: kart.x + Math.cos(dropAngle) * 45,
        y: kart.y + Math.sin(dropAngle) * 45,
        type: 'PUMPKIN_MINE',
        active: true,
        lifetime: 0,
      });
    } else if (wType === 'STAR_SHIELD') {
      soundManager.playTurboBoost();
      kart.starShieldTimer = 7.0; // 7 seconds
      state.particles.push({
        x: kart.x,
        y: kart.y,
        vx: 0,
        vy: 0,
        color: '#facc15',
        size: 20,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 1.0,
        shape: 'text',
        text: 'STAR SHIELD!',
      });
    } else if (wType === 'NITRO_ELIXIR') {
      soundManager.playTurboBoost();
      kart.boostTimer = 1.6;
      kart.boostMultiplier = 2.1;
      state.particles.push({
        x: kart.x,
        y: kart.y,
        vx: 0,
        vy: 0,
        color: '#a855f7',
        size: 18,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 0.8,
        shape: 'text',
        text: 'NITRO BOOST!',
      });
    } else if (wType === 'LIGHTNING_ZAP') {
      soundManager.playLightning();
      boss.hp = Math.max(0, boss.hp - 50);
      boss.shrunkTimer = 4.5;
      boss.stunTimer = 1.8;
      statsRef.current.damageDealt += 50;
      state.particles.push({
        x: boss.x,
        y: boss.y,
        vx: 0,
        vy: 0,
        color: '#38bdf8',
        size: 22,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 1.2,
        shape: 'text',
        text: 'LIGHTNING ZAP! -50',
      });
      // Flash shock rings
      state.particles.push({
        x: boss.x,
        y: boss.y,
        vx: 0,
        vy: 0,
        color: '#67e8f9',
        size: 60,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 0.4,
        shape: 'ring',
      });
    }

    itemSlot.charges--;
    if (itemSlot.charges <= 0) {
      itemSlot.weapon = null;
    }

    setHudItemSlot({ ...itemSlot });
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
      gameStateRef.current.keys[e.code] = true;

      // Quick trigger for shooting corn or firing weapon
      if (['f', 'e', 'z', 'x', 'c', 'enter'].includes(e.key.toLowerCase())) {
        shootCandyCorn();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
      gameStateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootCandyCorn]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (currentTime: number) => {
      const state = gameStateRef.current;
      const dt = Math.min(0.05, (currentTime - state.lastFrameTime) / 1000); // delta time clamped
      state.lastFrameTime = currentTime;

      if (!isPaused && !state.isGameOver) {
        state.gameTime += dt;
        updateGame(dt);
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Camera follow kart smoothly
          const targetCamX = state.kart.x - canvas.width / 2;
          const targetCamY = state.kart.y - canvas.height / 2;
          // Clamp camera to map boundaries
          const camX = Math.max(0, Math.min(MAP_WIDTH - canvas.width, targetCamX));
          const camY = Math.max(0, Math.min(MAP_HEIGHT - canvas.height, targetCamY));

          renderGameScene({
            ctx,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            cameraX: camX,
            cameraY: camY,
            kart: state.kart,
            boss: state.boss,
            racer,
            itemBoxes: state.itemBoxes,
            candies: state.candies,
            boostPads: state.boostPads,
            traps: state.traps,
            projectiles: state.projectiles,
            particles: state.particles,
            skidMarks: state.skidMarks,
            gameTime: state.gameTime,
          });
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      soundManager.stopEngineSound();
    };
  }, [isPaused, racer]);

  // Core Game Physics & Logic Update
  const updateGame = (dt: number) => {
    const state = gameStateRef.current;
    const { kart, boss, itemSlot, keys } = state;

    // --- 1. KART CONTROLS & DRIFTING PHYSICS ---
    // Spacebar is Gas, Arrow keys move directionally (Up=Gas, Down=Brake, Left/Right=Steer)
    const isUp = keys[' '] || keys['space'] || keys['arrowup'] || keys['w'] || state.touchGas;
    const isDown = keys['arrowdown'] || keys['s'] || state.touchBrake;
    const isLeft = keys['arrowleft'] || keys['a'] || state.touchSteer === -1;
    const isRight = keys['arrowright'] || keys['d'] || state.touchSteer === 1;
    const isDriftKey = keys['shift'] || keys['shiftleft'] || keys['shiftright'] || state.touchDrift;

    // Corn Ammo auto-regeneration (recharges 4 corn per second)
    if (kart.cornAmmo < kart.maxCornAmmo) {
      state.cornAmmoRegen += dt;
      if (state.cornAmmoRegen >= 0.22) {
        kart.cornAmmo = Math.min(kart.maxCornAmmo, kart.cornAmmo + 1);
        state.cornAmmoRegen = 0;
      }
    }
    if (state.cornCooldown > 0) {
      state.cornCooldown -= dt;
    }

    // Continuous fire if shooting key is held down or touch shoot is pressed
    if (keys['f'] || keys['e'] || keys['z'] || keys['x'] || keys['c'] || state.touchShoot) {
      shootCandyCorn();
    }

    // Acceleration & Braking
    if (isUp) {
      const topSpeed = (kart.maxSpeed + kart.candies * 0.04) * (kart.boostTimer > 0 ? kart.boostMultiplier : 1) * (kart.starShieldTimer > 0 ? 1.7 : 1);
      if (kart.speed < topSpeed) {
        kart.speed += kart.acceleration;
      }
    } else if (isDown) {
      if (kart.speed > -kart.reverseSpeed) {
        kart.speed -= kart.acceleration * 0.8;
      }
    } else {
      kart.speed *= kart.friction;
      if (Math.abs(kart.speed) < 0.05) kart.speed = 0;
    }

    // Steering
    let steerDir: -1 | 0 | 1 = 0;
    if (isLeft && !isRight) steerDir = -1;
    else if (isRight && !isLeft) steerDir = 1;

    // Drifting logic (Mario Kart Style)
    if (isDriftKey && Math.abs(kart.speed) > 2.5 && steerDir !== 0 && !kart.isDrifting) {
      // Initiate drift hop
      kart.isDrifting = true;
      kart.driftDirection = steerDir;
      kart.driftTime = 0;
      kart.driftTier = 0;
    }

    if (kart.isDrifting) {
      if (!isDriftKey || Math.abs(kart.speed) < 1.5) {
        // Release drift -> TRIGGER TURBO BOOST!
        if (kart.driftTier > 0) {
          statsRef.current.driftBoosts++;
          soundManager.playTurboBoost();

          const boostMult = kart.driftTier === 1 ? 1.4 : kart.driftTier === 2 ? 1.7 : 2.1;
          const boostDur = kart.driftTier === 1 ? 1.2 : kart.driftTier === 2 ? 1.8 : 2.4;

          kart.boostTimer = boostDur;
          kart.boostMultiplier = boostMult;
          kart.score += kart.driftTier * 100;

          const boostLabel =
            kart.driftTier === 3
              ? 'ULTRA TURBO! +300'
              : kart.driftTier === 2
              ? 'SUPER TURBO! +200'
              : 'MINI TURBO! +100';

          state.particles.push({
            x: kart.x,
            y: kart.y,
            vx: 0,
            vy: -15,
            color: kart.driftTier === 3 ? '#6ee7b7' : kart.driftTier === 2 ? '#f472b6' : '#38bdf8',
            size: 16,
            alpha: 1,
            lifetime: 0,
            maxLifetime: 0.9,
            shape: 'text',
            text: boostLabel,
          });
        }

        kart.isDrifting = false;
        kart.driftTime = 0;
        kart.driftTier = 0;
      } else {
        // Continue drifting: turn with bonus drift bite
        kart.driftTime += dt;
        kart.angle += kart.driftDirection * kart.turnSpeed * 1.35;

        // Drift Tiers
        const prevTier = kart.driftTier;
        if (kart.driftTime > 2.6) {
          kart.driftTier = 3; // Mint
        } else if (kart.driftTime > 1.6) {
          kart.driftTier = 2; // Pink
        } else if (kart.driftTime > 0.7) {
          kart.driftTier = 1; // Blue
        }

        if (kart.driftTier !== prevTier) {
          soundManager.playDriftSpark();
        }

        // Leave skid mark
        if (Math.random() < 0.6) {
          const rearLeftX = kart.x - Math.cos(kart.angle) * 18 - Math.sin(kart.angle) * 14;
          const rearLeftY = kart.y - Math.sin(kart.angle) * 18 + Math.cos(kart.angle) * 14;
          state.skidMarks.push({
            x1: rearLeftX,
            y1: rearLeftY,
            x2: rearLeftX - Math.cos(kart.angle) * 4,
            y2: rearLeftY - Math.sin(kart.angle) * 4,
            alpha: 0.5,
            color: 'rgba(30, 20, 50, 0.4)',
          });
          if (state.skidMarks.length > 120) state.skidMarks.shift();
        }
      }
    } else {
      // Normal turning
      if (steerDir !== 0 && Math.abs(kart.speed) > 0.2) {
        kart.angle += steerDir * kart.turnSpeed * (kart.speed > 0 ? 1 : -1);
      }
    }

    // Move Kart
    const forwardX = Math.cos(kart.angle) * kart.speed;
    const forwardY = Math.sin(kart.angle) * kart.speed;
    let nextX = kart.x + forwardX;
    let nextY = kart.y + forwardY;

    // Wall Collisions for Kart
    const kartRadius = 20;
    MANSION_WALLS.forEach((wall) => {
      // Nearest point on wall rectangle
      const closestX = Math.max(wall.x, Math.min(nextX, wall.x + wall.w));
      const closestY = Math.max(wall.y, Math.min(nextY, wall.y + wall.h));
      const distX = nextX - closestX;
      const distY = nextY - closestY;
      const distance = Math.hypot(distX, distY);

      if (distance < kartRadius) {
        // Collision response: push kart away
        const overlap = kartRadius - distance;
        const normX = distance > 0 ? distX / distance : 1;
        const normY = distance > 0 ? distY / distance : 0;
        nextX += normX * overlap;
        nextY += normY * overlap;
        kart.speed *= 0.65; // friction on wall bounce
      }
    });

    kart.x = nextX;
    kart.y = nextY;

    // Update Timers
    if (kart.boostTimer > 0) kart.boostTimer -= dt;
    if (kart.starShieldTimer > 0) kart.starShieldTimer -= dt;
    if (kart.invulnerableTime > 0) kart.invulnerableTime -= dt;

    // Audio Engine Update
    const speedRatio = Math.abs(kart.speed) / kart.maxSpeed;
    soundManager.updateEngineSound(speedRatio, isUp);

    // --- 2. BOOST PADS ---
    state.boostPads.forEach((pad) => {
      const halfW = pad.width / 2;
      const halfH = pad.height / 2;
      if (
        kart.x > pad.x - halfW &&
        kart.x < pad.x + halfW &&
        kart.y > pad.y - halfH &&
        kart.y < pad.y + halfH
      ) {
        if (kart.boostTimer < 1.0) {
          soundManager.playTurboBoost();
          kart.boostTimer = 1.4;
          kart.boostMultiplier = pad.boostSpeed;
          state.particles.push({
            x: kart.x,
            y: kart.y,
            vx: 0,
            vy: -10,
            color: '#38bdf8',
            size: 14,
            alpha: 1,
            lifetime: 0,
            maxLifetime: 0.6,
            shape: 'text',
            text: 'BOOST PAD!',
          });
        }
      }
    });

    // --- 3. CANDIES PICKUP ---
    state.candies.forEach((candy) => {
      if (candy.collected) {
        candy.respawnTimer -= dt;
        if (candy.respawnTimer <= 0) candy.collected = false;
        return;
      }

      const cDist = Math.hypot(kart.x - candy.x, kart.y - candy.y);
      if (cDist < 28) {
        candy.collected = true;
        candy.respawnTimer = 14;
        kart.candies++;
        kart.score += candy.value;
        statsRef.current.candiesCollected++;
        soundManager.playCandyPickup();

        state.particles.push({
          x: candy.x,
          y: candy.y,
          vx: 0,
          vy: -15,
          color: candy.type === 'STAR_CANDY' ? '#facc15' : '#fb923c',
          size: 14,
          alpha: 1,
          lifetime: 0,
          maxLifetime: 0.6,
          shape: 'text',
          text: `+${candy.value}`,
        });
      }
    });

    // --- 4. MARIO KART ITEM BOXES & ROULETTE ---
    state.itemBoxes.forEach((box) => {
      if (box.respawnTimer > 0) {
        box.respawnTimer -= dt;
        return;
      }

      const bDist = Math.hypot(kart.x - box.x, kart.y - box.y);
      if (bDist < 35) {
        box.respawnTimer = 7.0; // 7 sec respawn
        soundManager.playCollectItemBox();

        // Shatter particles
        for (let i = 0; i < 8; i++) {
          state.particles.push({
            x: box.x,
            y: box.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#c084fc',
            size: 5,
            alpha: 1,
            lifetime: 0,
            maxLifetime: 0.5,
            shape: 'spark',
          });
        }

        // Trigger Item Roulette
        if (!itemSlot.weapon) {
          itemSlot.isRolling = true;
          itemSlot.rollEndTime = state.gameTime + 1.2;
        }
      }
    });

    // Handle Active Roulette Spinning
    if (itemSlot.isRolling) {
      const weapons: WeaponType[] = [
        'CANDY_MISSILE',
        'GHOST_HOMING',
        'PUMPKIN_TRAP',
        'STAR_SHIELD',
        'NITRO_ELIXIR',
        'LIGHTNING_ZAP',
      ];

      // Fast random cycling
      const randomW = weapons[Math.floor(Math.random() * weapons.length)];
      itemSlot.rouletteItem = randomW;

      if (Math.random() < 0.25) {
        soundManager.playRouletteTick();
      }

      if (state.gameTime >= itemSlot.rollEndTime) {
        itemSlot.isRolling = false;
        // Bias roulette slightly based on player situation (catch up logic)
        const chosen = randomW;
        itemSlot.weapon = chosen;
        itemSlot.charges = WEAPON_REGISTRY[chosen].charges;
        soundManager.playItemAcquired();

        state.particles.push({
          x: kart.x,
          y: kart.y,
          vx: 0,
          vy: -20,
          color: WEAPON_REGISTRY[chosen].color,
          size: 16,
          alpha: 1,
          lifetime: 0,
          maxLifetime: 1.0,
          shape: 'text',
          text: `ITEM: ${WEAPON_REGISTRY[chosen].name}!`,
        });
      }
    }

    // --- 5. EVIL PUMPKIN BOSS AI & PURSUIT ---
    if (boss.stunTimer > 0) {
      boss.stunTimer -= dt;
      boss.speed = 0;
    } else {
      // Dynamic Rubber-band chase speed
      const bdx = kart.x - boss.x;
      const bdy = kart.y - boss.y;
      const distToPlayer = Math.hypot(bdx, bdy);

      // Check boss phase based on HP
      if (boss.hp <= boss.maxHp * 0.3) {
        boss.phase = 3; // Enraged
      } else if (boss.hp <= boss.maxHp * 0.6) {
        boss.phase = 2; // Charged
      }

      const phaseSpeedBonus = boss.phase === 3 ? 1.8 : boss.phase === 2 ? 0.9 : 0;
      let targetSpeed = boss.baseSpeed + phaseSpeedBonus;
      if (boss.shrunkTimer > 0) targetSpeed *= 0.55;

      // Rubber banding: if player is very far away, boss speeds up to maintain suspense!
      if (distToPlayer > 800) {
        targetSpeed *= 1.4;
      } else if (distToPlayer < 200) {
        targetSpeed *= 0.85;
      }

      boss.speed = targetSpeed;

      // Waypoint vs Direct Pursuit
      // If line of sight is roughly open (dist < 400), head straight to player, otherwise follow waypoints
      let targetX = kart.x;
      let targetY = kart.y;

      if (distToPlayer > 450) {
        const wp = BOSS_WAYPOINTS[boss.targetWayPointIndex];
        targetX = wp.x;
        targetY = wp.y;
        const distToWp = Math.hypot(wp.x - boss.x, wp.y - boss.y);
        if (distToWp < 70) {
          boss.targetWayPointIndex = (boss.targetWayPointIndex + 1) % BOSS_WAYPOINTS.length;
        }
      }

      const targetAngle = Math.atan2(targetY - boss.y, targetX - boss.x);
      // Smooth angular turning towards target
      let diffAngle = targetAngle - boss.angle;
      while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
      while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
      boss.angle += diffAngle * 0.08;

      boss.x += Math.cos(boss.angle) * boss.speed;
      boss.y += Math.sin(boss.angle) * boss.speed;

      // Boss Wall Sliding
      const bossRadius = 38 * (boss.shrunkTimer > 0 ? 0.6 : 1);
      MANSION_WALLS.forEach((wall) => {
        const closestX = Math.max(wall.x, Math.min(boss.x, wall.x + wall.w));
        const closestY = Math.max(wall.y, Math.min(boss.y, wall.y + wall.h));
        const bDistX = boss.x - closestX;
        const bDistY = boss.y - closestY;
        const dist = Math.hypot(bDistX, bDistY);
        if (dist < bossRadius) {
          const overlap = bossRadius - dist;
          const normX = dist > 0 ? bDistX / dist : 1;
          const normY = dist > 0 ? bDistY / dist : 0;
          boss.x += normX * overlap;
          boss.y += normY * overlap;
        }
      });

      // Boss Attacks (Seed barrage or Shockwave)
      boss.attackTimer += dt;
      if (boss.attackTimer >= boss.attackCooldown && distToPlayer < 650) {
        boss.attackTimer = 0;
        soundManager.playBossRoar();

        if (boss.phase === 3) {
          // Triple seed barrage
          for (let i = -1; i <= 1; i++) {
            const spreadAngle = boss.angle + i * 0.35;
            state.projectiles.push({
              id: `boss-seed-${Date.now()}-${i}`,
              x: boss.x + Math.cos(spreadAngle) * 40,
              y: boss.y + Math.sin(spreadAngle) * 40,
              vx: Math.cos(spreadAngle) * 9.5,
              vy: Math.sin(spreadAngle) * 9.5,
              angle: spreadAngle,
              type: 'BOSS_SEED',
              damage: 1,
              lifetime: 0,
              maxLifetime: 3.0,
            });
          }
        } else {
          // Single aimed seed
          state.projectiles.push({
            id: `boss-seed-${Date.now()}`,
            x: boss.x + Math.cos(boss.angle) * 40,
            y: boss.y + Math.sin(boss.angle) * 40,
            vx: Math.cos(boss.angle) * 8.5,
            vy: Math.sin(boss.angle) * 8.5,
            angle: boss.angle,
            type: 'BOSS_SEED',
            damage: 1,
            lifetime: 0,
            maxLifetime: 3.0,
          });
        }
      }
    }

    if (boss.shrunkTimer > 0) boss.shrunkTimer -= dt;

    // --- 6. PROJECTILE SIMULATION & COLLISIONS ---
    state.projectiles = state.projectiles.filter((p) => {
      p.lifetime += dt;
      if (p.lifetime >= p.maxLifetime) return false;

      // Homing behavior
      if (p.homing && (p.type === 'GHOST_HOMING' || p.type === 'CANDY')) {
        const targetAngle = Math.atan2(boss.y - p.y, boss.x - p.x);
        let diff = targetAngle - p.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        const steerSpeed = p.type === 'GHOST_HOMING' ? 0.16 : 0.08;
        p.angle += diff * steerSpeed;
        const flightSpeed = p.type === 'GHOST_HOMING' ? 14 : 17;
        p.vx = Math.cos(p.angle) * flightSpeed;
        p.vy = Math.sin(p.angle) * flightSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Projectile hit Boss
      if (p.type === 'CANDY' || p.type === 'GHOST_HOMING') {
        const hitDist = Math.hypot(p.x - boss.x, p.y - boss.y);
        const bossRadius = 40 * (boss.shrunkTimer > 0 ? 0.6 : 1);
        if (hitDist < bossRadius) {
          // HIT BOSS!
          if (p.type === 'CANDY') {
            soundManager.playCornPop();
            boss.stunTimer = Math.max(boss.stunTimer, 0.22);
            // Push boss back slightly from corn force
            boss.x -= Math.cos(p.angle) * 16;
            boss.y -= Math.sin(p.angle) * 16;
          } else {
            soundManager.playHitBoss();
            boss.stunTimer = 2.0; // Stun boss with ghost torpedo
          }

          boss.hp = Math.max(0, boss.hp - p.damage);
          statsRef.current.damageDealt += p.damage;
          kart.score += p.damage * 10;

          // Popcorn or ghost explosion particles
          for (let i = 0; i < (p.type === 'CANDY' ? 8 : 12); i++) {
            state.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: p.type === 'GHOST_HOMING' ? '#38bdf8' : '#fef08a',
              size: p.type === 'CANDY' ? 5 : 6,
              alpha: 1,
              lifetime: 0,
              maxLifetime: 0.45,
              shape: 'spark',
            });
          }

          state.particles.push({
            x: p.x,
            y: p.y,
            vx: 0,
            vy: -16,
            color: p.type === 'CANDY' ? '#facc15' : '#38bdf8',
            size: 16,
            alpha: 1,
            lifetime: 0,
            maxLifetime: 0.7,
            shape: 'text',
            text: p.type === 'CANDY' ? '🌽 POP! -18' : '👻 GHOST BLAST! -65',
          });

          return false; // remove projectile
        }
      }

      // Boss projectile hit Player
      if (p.type === 'BOSS_SEED') {
        const hitDist = Math.hypot(p.x - kart.x, p.y - kart.y);
        if (hitDist < 25) {
          if (kart.starShieldTimer > 0) {
            // Deflected by star shield!
            return false;
          }
          if (kart.invulnerableTime <= 0) {
            damagePlayer(1);
          }
          return false;
        }
      }

      return true;
    });

    // --- 7. TRAP COLLISIONS WITH BOSS ---
    state.traps.forEach((trap) => {
      if (!trap.active) return;
      const tDist = Math.hypot(boss.x - trap.x, boss.y - trap.y);
      if (tDist < 45) {
        trap.active = false;
        soundManager.playHitBoss();
        boss.hp = Math.max(0, boss.hp - 45);
        boss.stunTimer = 2.5; // Stun & spinout
        statsRef.current.damageDealt += 45;
        kart.score += 450;

        state.particles.push({
          x: trap.x,
          y: trap.y,
          vx: 0,
          vy: -18,
          color: '#f472b6',
          size: 18,
          alpha: 1,
          lifetime: 0,
          maxLifetime: 0.8,
          shape: 'text',
          text: 'JACK-O-TRAP TRIGGERED! -45',
        });
      }
    });

    // --- 8. DIRECT COLLISION: KART VS BOSS ---
    const bossKartDist = Math.hypot(kart.x - boss.x, kart.y - boss.y);
    const minCollisionDist = 48;
    if (bossKartDist < minCollisionDist) {
      if (kart.starShieldTimer > 0) {
        // Ram into boss with Star Shield!
        soundManager.playHitBoss();
        boss.hp = Math.max(0, boss.hp - 80);
        boss.stunTimer = 1.8;
        statsRef.current.damageDealt += 80;
        kart.score += 800;

        // Push boss back
        boss.x -= Math.cos(boss.angle) * 80;
        boss.y -= Math.sin(boss.angle) * 80;

        state.particles.push({
          x: boss.x,
          y: boss.y,
          vx: 0,
          vy: -20,
          color: '#facc15',
          size: 20,
          alpha: 1,
          lifetime: 0,
          maxLifetime: 0.9,
          shape: 'text',
          text: 'STAR RAM! -80',
        });
      } else if (kart.invulnerableTime <= 0) {
        damagePlayer(1);
        // Knockback kart
        kart.speed = -4;
        kart.angle += Math.PI * 0.4; // spinout stumble
      }
    }

    // --- 9. PARTICLES SIMULATION ---
    state.particles = state.particles.filter((p) => {
      p.lifetime += dt;
      if (p.lifetime >= p.maxLifetime) return false;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - p.lifetime / p.maxLifetime;
      return true;
    });

    // --- 10. CHECK WIN / LOSS CONDITIONS ---
    if (boss.hp <= 0 && !state.isGameOver) {
      state.isGameOver = true;
      triggerGameOver(true);
    } else if (kart.hp <= 0 && !state.isGameOver) {
      state.isGameOver = true;
      triggerGameOver(false);
    }

    // Sync HUD state throttled
    setHudKart({ ...kart });
    setHudBoss({ ...boss });
  };

  const damagePlayer = (amount: number) => {
    const state = gameStateRef.current;
    soundManager.playPlayerHurt();
    state.kart.hp -= amount;
    state.kart.invulnerableTime = 2.2; // 2.2 seconds grace period

    // Drop some candies on hit
    const dropCount = Math.min(state.kart.candies, 3);
    state.kart.candies -= dropCount;

    state.particles.push({
      x: state.kart.x,
      y: state.kart.y,
      vx: 0,
      vy: -15,
      color: '#f43f5e',
      size: 16,
      alpha: 1,
      lifetime: 0,
      maxLifetime: 0.8,
      shape: 'text',
      text: '-1 HEART! 💔',
    });
  };

  const triggerGameOver = (isVictory: boolean) => {
    soundManager.stopEngineSound();
    if (isVictory) {
      soundManager.playVictory();
    } else {
      soundManager.playDefeat();
    }

    const elapsed = (Date.now() - statsRef.current.startTime) / 1000;
    const finalScore =
      gameStateRef.current.kart.score +
      (isVictory ? 5000 : 0) +
      gameStateRef.current.kart.candies * 20 +
      (difficulty === 'NIGHTMARE' ? 2500 : difficulty === 'CLASSIC' ? 1000 : 0);

    // Compute rank
    let rank: 'S' | 'A' | 'B' | 'C' = 'C';
    if (isVictory && elapsed < 90 && gameStateRef.current.kart.hp >= 3) {
      rank = 'S';
    } else if (isVictory) {
      rank = 'A';
    } else if (statsRef.current.damageDealt > 300) {
      rank = 'B';
    }

    const finalStats: GameStats = {
      timeElapsed: elapsed,
      damageDealt: statsRef.current.damageDealt,
      candiesCollected: statsRef.current.candiesCollected,
      itemsUsed: statsRef.current.itemsUsed,
      driftBoostsTriggered: statsRef.current.driftBoosts,
      finalScore,
      rank,
      difficulty,
      isVictory,
    };

    setTimeout(() => {
      onFinishGame(finalStats);
    }, 1200);
  };

  // Canvas resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#0d071a]">
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={shootCandyCorn}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Mario Kart Game HUD Overlay */}
      <HUD
        kart={hudKart}
        boss={hudBoss}
        racer={racer}
        itemSlot={hudItemSlot}
        difficulty={difficulty}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onPause={() => setIsPaused(!isPaused)}
        onFireWeapon={fireCurrentWeapon}
        onShootCorn={shootCandyCorn}
        onSteerTouch={(dir) => {
          gameStateRef.current.touchSteer = dir;
        }}
        onGasTouch={(gas) => {
          gameStateRef.current.touchGas = gas;
        }}
        onBrakeTouch={(brake) => {
          gameStateRef.current.touchBrake = brake;
        }}
        onDriftTouch={(drift) => {
          gameStateRef.current.touchDrift = drift;
        }}
        onTouchShoot={(shooting) => {
          gameStateRef.current.touchShoot = shooting;
          if (shooting) shootCandyCorn();
        }}
      />

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#1b1030] rounded-3xl border border-purple-500/40 p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-xs text-purple-300 mb-6">Take a breather, the Evil Pumpkin is frozen!</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md"
              >
                RESUME CHASE
              </button>
              <button
                onClick={onReturnToMenu}
                className="w-full py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 font-bold text-sm border border-purple-500/30"
              >
                RETURN TO START MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
