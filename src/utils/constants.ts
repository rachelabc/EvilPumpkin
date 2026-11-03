import { RacerCharacter, WeaponType } from '../types/game';

export const RACERS: RacerCharacter[] = [
  {
    id: 'pip',
    name: 'Pip the Ghost',
    title: 'The Witchy Drifter',
    description: 'A friendly ghost who mastered drift-hop boost magic. Well balanced with extra turbo power.',
    speed: 4,
    handling: 4,
    boost: 5,
    health: 4,
    colorTheme: {
      primary: '#e9d5ff', // pastel purple
      secondary: '#6ee7b7', // pastel mint
      accent: '#f472b6', // pastel pink
      trail: 'rgba(216, 180, 254, 0.7)',
    },
  },
  {
    id: 'luna',
    name: 'Luna Whispers',
    title: 'Shadow Prowler',
    description: 'A nimble witch cat with ultra-sharp cornering agility and top acceleration.',
    speed: 5,
    handling: 5,
    boost: 3,
    health: 3,
    colorTheme: {
      primary: '#c084fc',
      secondary: '#38bdf8',
      accent: '#fbbf24',
      trail: 'rgba(192, 132, 252, 0.7)',
    },
  },
  {
    id: 'barnaby',
    name: 'Barnaby Bat',
    title: 'Gourd Crusher',
    description: 'A stout, winged bat racer who can withstand extra hits and charges full speed ahead.',
    speed: 3,
    handling: 4,
    boost: 4,
    health: 5,
    colorTheme: {
      primary: '#fdba74',
      secondary: '#a78bfa',
      accent: '#f43f5e',
      trail: 'rgba(253, 186, 116, 0.7)',
    },
  },
  {
    id: 'mummy',
    name: 'Candy Mummy',
    title: 'Sweet Glider',
    description: 'Wrapped in pastel ribbons and scented like cotton candy. Smooth drifting and extra points.',
    speed: 4,
    handling: 5,
    boost: 4,
    health: 4,
    colorTheme: {
      primary: '#fbcfe8',
      secondary: '#a7f3d0',
      accent: '#fb923c',
      trail: 'rgba(251, 207, 232, 0.7)',
    },
  },
];

export interface WeaponInfo {
  type: WeaponType;
  name: string;
  tagline: string;
  description: string;
  color: string;
  charges: number;
}

export const WEAPON_REGISTRY: Record<WeaponType, WeaponInfo> = {
  CANDY_MISSILE: {
    type: 'CANDY_MISSILE',
    name: 'Candy Corn Triple-Shot',
    tagline: 'Rapid Fire',
    description: 'Fires 3 explosive candy corn missiles in front of you.',
    color: '#fb923c',
    charges: 3,
  },
  GHOST_HOMING: {
    type: 'GHOST_HOMING',
    name: 'Spectral Ghost Torpedo',
    tagline: 'Homing Blast',
    description: 'Seeks out the Evil Pumpkin relentlessly and stuns him.',
    color: '#38bdf8',
    charges: 1,
  },
  PUMPKIN_TRAP: {
    type: 'PUMPKIN_TRAP',
    name: 'Cursed Jack-o-Trap',
    tagline: 'Rear Hazard',
    description: 'Drops a trap behind your kart that spins out the Evil Pumpkin.',
    color: '#f472b6',
    charges: 1,
  },
  STAR_SHIELD: {
    type: 'STAR_SHIELD',
    name: 'Star of Pastel Light',
    tagline: 'Invincibility',
    description: 'Grants rainbow speed, complete invulnerability, and ramming power.',
    color: '#fbbf24',
    charges: 1,
  },
  NITRO_ELIXIR: {
    type: 'NITRO_ELIXIR',
    name: "Witch's Nitro Elixir",
    tagline: 'Turbo Boost',
    description: 'Provides 3 massive nitro speed surges with purple exhaust flame.',
    color: '#a78bfa',
    charges: 3,
  },
  LIGHTNING_ZAP: {
    type: 'LIGHTNING_ZAP',
    name: 'Ecto-Zap Lightning',
    tagline: 'Boss Shrink',
    description: 'Calls down thunder from mansion ceilings to zap and shrink the boss.',
    color: '#4ade80',
    charges: 1,
  },
};

export const HIGH_SCORES_STORAGE_KEY = 'spooky_kart_high_scores_v1';
