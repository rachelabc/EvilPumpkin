import { BoostPad, CandyPickup, ItemBox, RoomZone, Vector2D, Wall } from '../types/game';

export const MAP_WIDTH = 2600;
export const MAP_HEIGHT = 2200;

export const ROOM_ZONES: RoomZone[] = [
  {
    id: 'foyer',
    name: 'Grand Foyer',
    x: 750,
    y: 1100,
    w: 1100,
    h: 950,
    themeColor: '#301c4a',
    floorPattern: 'checker',
  },
  {
    id: 'ballroom',
    name: 'Ghostly Ballroom',
    x: 100,
    y: 1100,
    w: 650,
    h: 950,
    themeColor: '#251b3d',
    floorPattern: 'carpet',
  },
  {
    id: 'library',
    name: 'Cobweb Library',
    x: 100,
    y: 100,
    w: 900,
    h: 1000,
    themeColor: '#1c2838',
    floorPattern: 'wood',
  },
  {
    id: 'potion_lab',
    name: "Witch's Laboratory",
    x: 1000,
    y: 100,
    w: 950,
    h: 1000,
    themeColor: '#1b382d',
    floorPattern: 'tiles',
  },
  {
    id: 'courtyard',
    name: 'Pumpkin Courtyard',
    x: 1950,
    y: 100,
    w: 550,
    h: 1950,
    themeColor: '#2d1d36',
    floorPattern: 'cobblestone',
  },
];

// Mansion walls and interior obstacles
export const MANSION_WALLS: Wall[] = [
  // Outer boundary walls
  { x: 80, y: 80, w: 2440, h: 25, type: 'wall' }, // Top
  { x: 80, y: 2050, w: 2440, h: 25, type: 'wall' }, // Bottom
  { x: 80, y: 80, w: 25, h: 1995, type: 'wall' }, // Left
  { x: 2500, y: 80, w: 25, h: 1995, type: 'wall' }, // Right

  // Dividing wall between Library/Ballroom and Foyer/Courtyard (vertical line x=750)
  { x: 740, y: 80, w: 25, h: 350, type: 'wall' }, // Upper portion
  // Doorway 1 at y=430 to 670 (open)
  { x: 740, y: 670, w: 25, h: 430, type: 'wall' },
  // Doorway 2 at y=1100 to 1340 (open into Ballroom)
  { x: 740, y: 1340, w: 25, h: 300, type: 'wall' },
  // Doorway 3 at y=1640 to 1840 (open)
  { x: 740, y: 1840, w: 25, h: 220, type: 'wall' },

  // Dividing wall horizontal between Library and Ballroom (horizontal line y=1100)
  { x: 80, y: 1090, w: 240, h: 25, type: 'wall' },
  // Doorway at x=320 to 520 (open)
  { x: 520, y: 1090, w: 230, h: 25, type: 'wall' },

  // Dividing wall between Library and Potion Lab (vertical line x=1000)
  { x: 990, y: 80, w: 25, h: 250, type: 'wall' },
  // Doorway at y=330 to 580 (open)
  { x: 990, y: 580, w: 25, h: 220, type: 'wall' },
  // Secret passage at y=800 to 950
  { x: 990, y: 950, w: 25, h: 150, type: 'wall' },

  // Dividing wall horizontal between Potion Lab and Foyer (horizontal line y=1100)
  { x: 750, y: 1090, w: 350, h: 25, type: 'wall' },
  // Grand Hall doorway at x=1100 to 1500 (wide open)
  { x: 1500, y: 1090, w: 450, h: 25, type: 'wall' },

  // Dividing wall between Mansion and Courtyard (vertical line x=1950)
  { x: 1940, y: 80, w: 25, h: 400, type: 'wall' },
  // Courtyard top gate at y=480 to 720 (open)
  { x: 1940, y: 720, w: 25, h: 600, type: 'wall' },
  // Courtyard bottom gate at y=1320 to 1560 (open)
  { x: 1940, y: 1560, w: 25, h: 500, type: 'wall' },

  // --- INTERIOR OBSTACLES & FURNITURE ---
  // Grand Foyer center chandelier / statue fountain (island for drifting around)
  { x: 1220, y: 1480, w: 160, h: 160, type: 'altar' },
  // Foyer Grand Staircase posts
  { x: 950, y: 1750, w: 70, h: 70, type: 'pillar' },
  { x: 1580, y: 1750, w: 70, h: 70, type: 'pillar' },

  // Ballroom Pillars (drift obstacle course)
  { x: 300, y: 1350, w: 80, h: 80, type: 'pillar' },
  { x: 520, y: 1350, w: 80, h: 80, type: 'pillar' },
  { x: 300, y: 1750, w: 80, h: 80, type: 'pillar' },
  { x: 520, y: 1750, w: 80, h: 80, type: 'pillar' },

  // Library Bookcase Aisles (chicane track)
  { x: 260, y: 260, w: 40, h: 320, type: 'bookshelf' },
  { x: 440, y: 460, w: 40, h: 340, type: 'bookshelf' },
  { x: 620, y: 260, w: 40, h: 320, type: 'bookshelf' },
  { x: 380, y: 880, w: 240, h: 40, type: 'bookshelf' },

  // Potion Lab Cauldrons & Tables
  { x: 1200, y: 350, w: 140, h: 90, type: 'altar' },
  { x: 1600, y: 350, w: 140, h: 90, type: 'altar' },
  { x: 1400, y: 680, w: 150, h: 150, type: 'altar' }, // Giant bubbling cauldron

  // Courtyard Tombs & Willow posts
  { x: 2150, y: 350, w: 80, h: 120, type: 'grave' },
  { x: 2320, y: 650, w: 80, h: 120, type: 'grave' },
  { x: 2100, y: 1000, w: 90, h: 90, type: 'pillar' },
  { x: 2300, y: 1350, w: 80, h: 120, type: 'grave' },
  { x: 2150, y: 1750, w: 80, h: 120, type: 'grave' },
];

// Boost Pads scattered strategically along straights and drift exits
export const INITIAL_BOOST_PADS: BoostPad[] = [
  // Foyer launch pads
  { x: 1100, y: 1300, width: 60, height: 100, angle: -Math.PI / 2, boostSpeed: 1.8 },
  { x: 1450, y: 1300, width: 60, height: 100, angle: -Math.PI / 2, boostSpeed: 1.8 },
  // Ballroom drift straightaway
  { x: 410, y: 1950, width: 100, height: 60, angle: 0, boostSpeed: 1.8 },
  // Potion Lab straightaway
  { x: 1400, y: 220, width: 100, height: 60, angle: 0, boostSpeed: 1.8 },
  // Courtyard long strip
  { x: 2200, y: 850, width: 60, height: 100, angle: Math.PI / 2, boostSpeed: 1.9 },
  // Library shortcut exit
  { x: 860, y: 870, width: 100, height: 60, angle: 0, boostSpeed: 1.8 },
];

// Mario Kart `?` Mystery Item Box Locations
export const INITIAL_ITEM_BOXES: ItemBox[] = [
  // Foyer
  { id: 'ib-1', x: 1000, y: 1550, respawnTimer: 0, rotation: 0 },
  { id: 'ib-2', x: 1600, y: 1550, respawnTimer: 0, rotation: 0 },
  { id: 'ib-3', x: 1300, y: 1850, respawnTimer: 0, rotation: 0 },
  // Ballroom
  { id: 'ib-4', x: 200, y: 1550, respawnTimer: 0, rotation: 0 },
  { id: 'ib-5', x: 620, y: 1550, respawnTimer: 0, rotation: 0 },
  // Library
  { id: 'ib-6', x: 350, y: 350, respawnTimer: 0, rotation: 0 },
  { id: 'ib-7', x: 530, y: 700, respawnTimer: 0, rotation: 0 },
  { id: 'ib-8', x: 850, y: 500, respawnTimer: 0, rotation: 0 },
  // Potion Lab
  { id: 'ib-9', x: 1150, y: 550, respawnTimer: 0, rotation: 0 },
  { id: 'ib-10', x: 1750, y: 550, respawnTimer: 0, rotation: 0 },
  { id: 'ib-11', x: 1475, y: 920, respawnTimer: 0, rotation: 0 },
  // Courtyard
  { id: 'ib-12', x: 2200, y: 480, respawnTimer: 0, rotation: 0 },
  { id: 'ib-13', x: 2200, y: 1200, respawnTimer: 0, rotation: 0 },
  { id: 'ib-14', x: 2200, y: 1850, respawnTimer: 0, rotation: 0 },
];

// Candy point pickups placed along the racing routes
export function generateCandies(): CandyPickup[] {
  const candies: CandyPickup[] = [];
  let id = 1;

  // Function to create a line of candies
  const addLine = (x1: number, y1: number, x2: number, y2: number, count: number, type: 'CANDY' | 'LOLLY' | 'STAR_CANDY' = 'CANDY') => {
    for (let i = 0; i <= count; i++) {
      const t = count === 0 ? 0 : i / count;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      candies.push({
        id: `candy-${id++}`,
        x,
        y,
        value: type === 'STAR_CANDY' ? 50 : type === 'LOLLY' ? 25 : 10,
        collected: false,
        respawnTimer: 0,
        type,
      });
    }
  };

  // Grand Foyer racing lines
  addLine(900, 1400, 1100, 1400, 4, 'CANDY');
  addLine(1500, 1400, 1700, 1400, 4, 'CANDY');
  addLine(1050, 1950, 1550, 1950, 6, 'LOLLY');
  // Center star
  candies.push({ id: `candy-${id++}`, x: 1300, y: 1350, value: 50, collected: false, respawnTimer: 0, type: 'STAR_CANDY' });

  // Ballroom circular ring
  addLine(250, 1250, 580, 1250, 4, 'CANDY');
  addLine(580, 1250, 580, 1850, 5, 'LOLLY');
  addLine(580, 1850, 250, 1850, 4, 'CANDY');
  addLine(250, 1850, 250, 1250, 5, 'CANDY');
  candies.push({ id: `candy-${id++}`, x: 410, y: 1550, value: 50, collected: false, respawnTimer: 0, type: 'STAR_CANDY' });

  // Library chicanes
  addLine(200, 450, 200, 850, 4, 'CANDY');
  addLine(350, 200, 550, 200, 4, 'LOLLY');
  addLine(520, 400, 520, 650, 3, 'CANDY');
  addLine(700, 400, 700, 850, 5, 'CANDY');

  // Potion Lab arc
  addLine(1100, 250, 1800, 250, 6, 'LOLLY');
  addLine(1300, 500, 1600, 500, 4, 'CANDY');
  addLine(1250, 850, 1700, 850, 5, 'CANDY');
  candies.push({ id: `candy-${id++}`, x: 1475, y: 350, value: 50, collected: false, respawnTimer: 0, type: 'STAR_CANDY' });

  // Courtyard strip
  addLine(2200, 200, 2200, 750, 6, 'CANDY');
  addLine(2200, 950, 2200, 1500, 6, 'LOLLY');
  addLine(2200, 1650, 2200, 2000, 4, 'CANDY');
  candies.push({ id: `candy-${id++}`, x: 2200, y: 1050, value: 50, collected: false, respawnTimer: 0, type: 'STAR_CANDY' });

  return candies;
}

// Boss AI Patrol Waypoints throughout the mansion
export const BOSS_WAYPOINTS: Vector2D[] = [
  // Foyer
  { x: 1300, y: 1850 },
  { x: 1000, y: 1500 },
  { x: 850, y: 1250 },
  // Into Ballroom
  { x: 450, y: 1250 },
  { x: 250, y: 1550 },
  { x: 450, y: 1900 },
  { x: 650, y: 1700 },
  // Back into Foyer
  { x: 850, y: 1500 },
  { x: 1250, y: 1300 },
  // Up into Library
  { x: 870, y: 850 },
  { x: 750, y: 500 },
  { x: 500, y: 300 },
  { x: 200, y: 650 },
  { x: 500, y: 900 },
  // Into Potion Lab
  { x: 880, y: 700 },
  { x: 1200, y: 500 },
  { x: 1475, y: 250 },
  { x: 1750, y: 500 },
  // Into Courtyard
  { x: 2200, y: 550 },
  { x: 2200, y: 1100 },
  { x: 2200, y: 1750 },
  // Return to Foyer
  { x: 1800, y: 1850 },
  { x: 1550, y: 1550 },
];
