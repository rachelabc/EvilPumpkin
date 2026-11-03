export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export type Difficulty = 'CASUAL' | 'CLASSIC' | 'NIGHTMARE';

export type WeaponType = 
  | 'CANDY_MISSILE' 
  | 'GHOST_HOMING' 
  | 'PUMPKIN_TRAP' 
  | 'STAR_SHIELD' 
  | 'NITRO_ELIXIR' 
  | 'LIGHTNING_ZAP';

export interface RacerCharacter {
  id: string;
  name: string;
  title: string;
  description: string;
  speed: number;    // 1-5
  handling: number; // 1-5
  boost: number;    // 1-5
  health: number;   // 3 or 4 hearts
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    trail: string;
  };
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface ItemSlot {
  weapon: WeaponType | null;
  charges: number;
  isRolling: boolean;
  rouletteItem: WeaponType | null;
  rollEndTime: number;
}

export interface Kart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // in radians
  speed: number;
  maxSpeed: number;
  acceleration: number;
  reverseSpeed: number;
  turnSpeed: number;
  friction: number;
  isDrifting: boolean;
  driftDirection: -1 | 1 | 0;
  driftTime: number;
  driftTier: 0 | 1 | 2 | 3; // 0 = none, 1 = blue, 2 = pink, 3 = mint
  hp: number;
  maxHp: number;
  invulnerableTime: number;
  boostTimer: number;
  boostMultiplier: number;
  starShieldTimer: number;
  lightningEmpTimer: number;
  score: number;
  candies: number;
  characterId: string;
  cornAmmo: number;
  maxCornAmmo: number;
}

export interface Boss {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  baseSpeed: number;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  stunTimer: number;
  shrunkTimer: number;
  attackTimer: number;
  attackCooldown: number;
  currentAttack: 'NONE' | 'SEED_BARRAGE' | 'SHOCKWAVE' | 'SPIRIT_SPAWN';
  targetWayPointIndex: number;
  glowPhase: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  type: 'CANDY' | 'GHOST_HOMING' | 'BOSS_SEED' | 'BOSS_FIREBALL';
  damage: number;
  lifetime: number;
  maxLifetime: number;
  homing?: boolean;
}

export interface Trap {
  id: string;
  x: number;
  y: number;
  type: 'PUMPKIN_MINE' | 'SLIME_PUDDLE';
  active: boolean;
  lifetime: number;
}

export interface ItemBox {
  id: string;
  x: number;
  y: number;
  respawnTimer: number;
  rotation: number;
}

export interface CandyPickup {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
  respawnTimer: number;
  type: 'CANDY' | 'LOLLY' | 'STAR_CANDY';
}

export interface BoostPad {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  boostSpeed: number;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  type?: 'wall' | 'bookshelf' | 'altar' | 'pillar' | 'grave';
}

export interface RoomZone {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  themeColor: string;
  floorPattern: 'checker' | 'wood' | 'tiles' | 'cobblestone' | 'carpet';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  shape: 'circle' | 'spark' | 'star' | 'smoke' | 'text' | 'ring';
  text?: string;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: string;
}

export interface GameStats {
  timeElapsed: number; // in seconds
  damageDealt: number;
  candiesCollected: number;
  itemsUsed: number;
  driftBoostsTriggered: number;
  finalScore: number;
  rank: 'S' | 'A' | 'B' | 'C';
  difficulty: Difficulty;
  isVictory: boolean;
}

export interface HighScoreEntry {
  characterName: string;
  score: number;
  timeFormatted: string;
  difficulty: Difficulty;
  isVictory: boolean;
  date: string;
}
