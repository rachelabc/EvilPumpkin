import { Boss, BoostPad, CandyPickup, ItemBox, Kart, Particle, Projectile, RacerCharacter, SkidMark, Trap } from '../types/game';
import { MANSION_WALLS, MAP_HEIGHT, MAP_WIDTH, ROOM_ZONES } from './mansionMap';

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  cameraX: number;
  cameraY: number;
  kart: Kart;
  boss: Boss;
  racer: RacerCharacter;
  itemBoxes: ItemBox[];
  candies: CandyPickup[];
  boostPads: BoostPad[];
  traps: Trap[];
  projectiles: Projectile[];
  particles: Particle[];
  skidMarks: SkidMark[];
  gameTime: number;
}

export function renderGameScene(opts: RenderOptions) {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    cameraX,
    cameraY,
    kart,
    boss,
    racer,
    itemBoxes,
    candies,
    boostPads,
    traps,
    projectiles,
    particles,
    skidMarks,
    gameTime,
  } = opts;

  ctx.save();
  // Clear full canvas
  ctx.fillStyle = '#0f081d';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Apply Camera Translation
  ctx.translate(-cameraX, -cameraY);

  // 1. Draw Mansion Rooms and Floors
  drawRooms(ctx, gameTime);

  // 2. Draw Skid Marks
  drawSkidMarks(ctx, skidMarks);

  // 3. Draw Boost Pads
  drawBoostPads(ctx, boostPads, gameTime);

  // 4. Draw Candies
  drawCandies(ctx, candies, gameTime);

  // 5. Draw Item Boxes
  drawItemBoxes(ctx, itemBoxes, gameTime);

  // 6. Draw Traps
  drawTraps(ctx, traps, gameTime);

  // 7. Draw Walls & Interior Decor
  drawWalls(ctx);

  // 8. Draw Projectiles
  drawProjectiles(ctx, projectiles);

  // 9. Draw Evil Pumpkin Boss
  drawBoss(ctx, boss, gameTime);

  // 10. Draw Player Kart
  drawKart(ctx, kart, racer, gameTime);

  // 11. Draw Particles
  drawParticles(ctx, particles);

  // Restore camera translation
  ctx.restore();

  // 12. Draw Screen-Space Ambient Lighting & Proximity Pulse
  drawVignetteAndHeadlights(ctx, canvasWidth, canvasHeight, kart, boss, cameraX, cameraY);
}

// Draw rooms with pastel textures
function drawRooms(ctx: CanvasRenderingContext2D, gameTime: number) {
  ROOM_ZONES.forEach((room) => {
    ctx.save();
    ctx.fillStyle = room.themeColor;
    ctx.fillRect(room.x, room.y, room.w, room.h);

    // Floor pattern details
    if (room.floorPattern === 'checker') {
      ctx.fillStyle = 'rgba(216, 180, 254, 0.05)';
      const tileSize = 60;
      for (let x = room.x; x < room.x + room.w; x += tileSize) {
        for (let y = room.y; y < room.y + room.h; y += tileSize) {
          if (((x / tileSize) ^ (y / tileSize)) & 1) {
            ctx.fillRect(x, y, tileSize, tileSize);
          }
        }
      }
      // Center carpet runner in Foyer
      ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
      ctx.fillRect(room.x + room.w / 2 - 120, room.y + 40, 240, room.h - 80);
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(room.x + room.w / 2 - 120, room.y + 40, 240, room.h - 80);
    } else if (room.floorPattern === 'wood') {
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.04)';
      ctx.lineWidth = 2;
      for (let y = room.y; y < room.y + room.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(room.x, y);
        ctx.lineTo(room.x + room.w, y);
        ctx.stroke();
      }
    } else if (room.floorPattern === 'tiles') {
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.05)';
      ctx.lineWidth = 1.5;
      for (let x = room.x; x < room.x + room.w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, room.y);
        ctx.lineTo(x, room.y + room.h);
        ctx.stroke();
      }
    } else if (room.floorPattern === 'cobblestone') {
      ctx.fillStyle = 'rgba(253, 186, 116, 0.03)';
      const step = 80;
      for (let x = room.x; x < room.x + room.w; x += step) {
        for (let y = room.y; y < room.y + room.h; y += step) {
          ctx.beginPath();
          ctx.arc(x + 30, y + 30, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Room name subtle floor lettering
    ctx.font = 'bold 24px "Fredoka", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.textAlign = 'center';
    ctx.fillText(room.name.toUpperCase(), room.x + room.w / 2, room.y + 80);

    ctx.restore();
  });
}

function drawSkidMarks(ctx: CanvasRenderingContext2D, skidMarks: SkidMark[]) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  skidMarks.forEach((m) => {
    ctx.strokeStyle = m.color;
    ctx.globalAlpha = m.alpha;
    ctx.beginPath();
    ctx.moveTo(m.x1, m.y1);
    ctx.lineTo(m.x2, m.y2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBoostPads(ctx: CanvasRenderingContext2D, pads: BoostPad[], gameTime: number) {
  pads.forEach((pad) => {
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.rotate(pad.angle);

    const pulse = Math.sin(gameTime * 8) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.25 * pulse})`;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Pad outline
    const halfW = pad.width / 2;
    const halfH = pad.height / 2;
    ctx.fillRect(-halfW, -halfH, pad.width, pad.height);
    ctx.strokeRect(-halfW, -halfH, pad.width, pad.height);

    // Chevron arrows
    ctx.fillStyle = '#67e8f9';
    const offset = ((gameTime * 120) % 30) - 15;
    for (let i = -1; i <= 1; i++) {
      const cy = i * 25 + offset;
      if (cy > -halfH + 5 && cy < halfH - 15) {
        ctx.beginPath();
        ctx.moveTo(0, cy - 10);
        ctx.lineTo(16, cy + 8);
        ctx.lineTo(0, cy + 2);
        ctx.lineTo(-16, cy + 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  });
}

function drawCandies(ctx: CanvasRenderingContext2D, candies: CandyPickup[], gameTime: number) {
  candies.forEach((candy) => {
    if (candy.collected) return;
    ctx.save();
    const bob = Math.sin(gameTime * 4 + candy.x * 0.01) * 4;
    ctx.translate(candy.x, candy.y + bob);

    // Glow aura
    ctx.shadowBlur = 10;

    if (candy.type === 'CANDY') {
      // Pastel Candy Corn
      ctx.shadowColor = '#fb923c';
      ctx.rotate(Math.sin(gameTime * 2 + candy.y) * 0.2);

      // Top white tip
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(5, -4);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();

      // Middle orange
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(-5, -4);
      ctx.lineTo(5, -4);
      ctx.lineTo(8, 4);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();

      // Bottom yellow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-8, 4);
      ctx.lineTo(8, 4);
      ctx.lineTo(11, 12);
      ctx.lineTo(-11, 12);
      ctx.closePath();
      ctx.fill();
    } else if (candy.type === 'LOLLY') {
      // Pastel Swirl Lollipop
      ctx.shadowColor = '#f472b6';
      // Stick
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 14);
      ctx.stroke();

      // Candy disc
      ctx.rotate(gameTime * 3);
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      // Star Candy (50 pts)
      ctx.shadowColor = '#facc15';
      ctx.rotate(gameTime * 2);
      ctx.fillStyle = '#fde047';
      drawStar(ctx, 0, 0, 5, 14, 7);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerR;
    y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerR;
    y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
}

function drawItemBoxes(ctx: CanvasRenderingContext2D, boxes: ItemBox[], gameTime: number) {
  boxes.forEach((box) => {
    if (box.respawnTimer > 0) return; // broken, respawning

    ctx.save();
    const bob = Math.sin(gameTime * 3 + box.x) * 5;
    ctx.translate(box.x, box.y + bob);

    const rot = gameTime * 2 + box.rotation;
    ctx.rotate(rot * 0.5);

    // Glowing iridescent aura
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#c084fc';

    // Box body (pastel glass cube)
    ctx.fillStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.strokeStyle = '#f3e8ff';
    ctx.lineWidth = 3;
    const size = 34;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Inner question mark
    ctx.rotate(-rot * 0.5); // keep question mark upright
    ctx.font = 'bold 22px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);

    ctx.restore();
  });
}

function drawTraps(ctx: CanvasRenderingContext2D, traps: Trap[], gameTime: number) {
  traps.forEach((trap) => {
    if (!trap.active) return;
    ctx.save();
    ctx.translate(trap.x, trap.y);

    if (trap.type === 'PUMPKIN_MINE') {
      // Cursed miniature Jack-o-trap
      const pulse = Math.sin(gameTime * 6) * 0.1 + 1;
      ctx.scale(pulse, pulse);

      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f472b6';

      // Pumpkin body
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(-3, -20, 6, 6);

      // Spooky glowing eyes & grin
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-2, -8);
      ctx.lineTo(-2, -4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(2, -8);
      ctx.lineTo(2, -4);
      ctx.fill();

      // Jagged grin
      ctx.beginPath();
      ctx.arc(0, 4, 8, 0, Math.PI);
      ctx.stroke();
    } else {
      // Slime Puddle
      ctx.fillStyle = 'rgba(110, 231, 183, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  MANSION_WALLS.forEach((wall) => {
    ctx.save();

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(wall.x + 4, wall.y + 6, wall.w, wall.h);

    if (wall.type === 'bookshelf') {
      // Wooden bookshelf with colorful pastel book spines
      ctx.fillStyle = '#3f2b4c';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#6b467d';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Book stripes
      const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a7f3d0'];
      for (let i = 0; i < Math.max(wall.w, wall.h); i += 12) {
        ctx.fillStyle = colors[(i / 12) % colors.length];
        if (wall.w > wall.h) {
          ctx.fillRect(wall.x + i, wall.y + 3, 8, wall.h - 6);
        } else {
          ctx.fillRect(wall.x + 3, wall.y + i, wall.w - 6, 8);
        }
      }
    } else if (wall.type === 'pillar') {
      // Stone pillar with torch
      ctx.fillStyle = '#332742';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Center glowing rune
      ctx.fillStyle = '#f472b6';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(wall.x + wall.w / 2, wall.y + wall.h / 2, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (wall.type === 'altar') {
      // Marble potion altar or fountain
      ctx.fillStyle = '#221a36';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 3;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Bubbling cauldron pool
      ctx.fillStyle = '#6ee7b7';
      ctx.shadowColor = '#6ee7b7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(wall.x + wall.w / 2, wall.y + wall.h / 2, Math.min(wall.w, wall.h) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (wall.type === 'grave') {
      // Tombstone
      ctx.fillStyle = '#374151';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = '#d1d5db';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('RIP', wall.x + wall.w / 2 - 10, wall.y + wall.h / 2);
    } else {
      // Standard masonry wall
      ctx.fillStyle = '#201633';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = '#4c3568';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

      // Pastel vine accents
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wall.x, wall.y);
      ctx.lineTo(wall.x + Math.min(wall.w, 40), wall.y + Math.min(wall.h, 40));
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  projectiles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.type === 'CANDY') {
      // Tri-color Candy Corn Missile (White tip, Orange center, Yellow base)
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;

      // Base yellow section
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(-2, -6);
      ctx.lineTo(-2, 6);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.fill();

      // Middle orange section
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(6, -3.5);
      ctx.lineTo(6, 3.5);
      ctx.lineTo(-2, 6);
      ctx.closePath();
      ctx.fill();

      // Front white point tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(6, -3.5);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 3.5);
      ctx.closePath();
      ctx.fill();

      // Golden kernel kernel lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (p.type === 'GHOST_HOMING') {
      // Cute screaming blue ghost torpedo
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(6, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-14, 8);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();

      // Ghost eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, -3, 2, 0, Math.PI * 2);
      ctx.arc(8, 3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'BOSS_SEED') {
      // Evil Pumpkin projectile
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // Fiery aura
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

// Draw the terrifying yet stylized Evil Pumpkin Boss
function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, gameTime: number) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.rotate(boss.angle);

  const scale = boss.shrunkTimer > 0 ? 0.55 : (boss.phase === 3 ? 1.25 : 1.15);
  ctx.scale(scale, scale);

  // Floating purple aura fog
  const auraGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 65);
  auraGlow.addColorStop(0, boss.phase === 3 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.35)');
  auraGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = auraGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.fill();

  // Stun flash
  if (boss.stunTimer > 0 && Math.floor(gameTime * 20) % 2 === 0) {
    ctx.filter = 'brightness(2.5)';
  }

  // Giant Pumpkin Head
  ctx.shadowColor = boss.phase === 3 ? '#ef4444' : '#a855f7';
  ctx.shadowBlur = 20;

  // Outer ribbed pumpkin body
  ctx.fillStyle = boss.phase === 3 ? '#dc2626' : '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pumpkin vertical rib grooves
  ctx.strokeStyle = boss.phase === 3 ? '#991b1b' : '#c2410c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 38, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 38, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Sinister Thorny Crown & Vine Hands
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  // Left vine hand reaching forward
  ctx.beginPath();
  ctx.moveTo(-35, -10);
  ctx.quadraticCurveTo(-55, 10 + Math.sin(gameTime * 6) * 6, -45, 30);
  ctx.stroke();
  // Right vine hand
  ctx.beginPath();
  ctx.moveTo(35, -10);
  ctx.quadraticCurveTo(55, 10 + Math.sin(gameTime * 6 + 1) * 6, 45, 30);
  ctx.stroke();

  // Crown on head
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-25, -34);
  ctx.lineTo(-12, -48);
  ctx.lineTo(0, -38);
  ctx.lineTo(12, -48);
  ctx.lineTo(25, -34);
  ctx.closePath();
  ctx.fill();

  // Glowing Eyes (Cyan/Magenta terrifying glow)
  ctx.shadowColor = boss.phase === 3 ? '#facc15' : '#38bdf8';
  ctx.shadowBlur = 18;
  ctx.fillStyle = boss.phase === 3 ? '#fef08a' : '#67e8f9';

  // Left eye (angled triangular slant)
  ctx.beginPath();
  ctx.moveTo(-22, -6);
  ctx.lineTo(-6, -12);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.moveTo(22, -6);
  ctx.lineTo(6, -12);
  ctx.lineTo(12, 0);
  ctx.closePath();
  ctx.fill();

  // Glowing Carved Jagged Mouth
  ctx.fillStyle = boss.phase === 3 ? '#fef08a' : '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-24, 12);
  ctx.lineTo(-16, 20);
  ctx.lineTo(-10, 14);
  ctx.lineTo(0, 22);
  ctx.lineTo(10, 14);
  ctx.lineTo(16, 20);
  ctx.lineTo(24, 12);
  ctx.lineTo(18, 24);
  ctx.lineTo(0, 26);
  ctx.lineTo(-18, 24);
  ctx.closePath();
  ctx.fill();

  // Stun stars orbiting if stunned
  if (boss.stunTimer > 0) {
    for (let i = 0; i < 3; i++) {
      const starAngle = gameTime * 8 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(starAngle) * 45;
      const sy = Math.sin(starAngle) * 20 - 45;
      ctx.fillStyle = '#facc15';
      drawStar(ctx, sx, sy, 4, 7, 3);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Draw the Player's Cute Pastel Kart
function drawKart(ctx: CanvasRenderingContext2D, kart: Kart, racer: RacerCharacter, gameTime: number) {
  ctx.save();
  ctx.translate(kart.x, kart.y);
  ctx.rotate(kart.angle);

  // Invulnerability blink
  if (kart.invulnerableTime > 0 && Math.floor(gameTime * 25) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Star Shield rainbow aura
  if (kart.starShieldTimer > 0) {
    const rainbowColors = ['#f472b6', '#c084fc', '#38bdf8', '#4ade80', '#facc15'];
    const col = rainbowColors[Math.floor(gameTime * 15) % rainbowColors.length];
    ctx.shadowColor = col;
    ctx.shadowBlur = 24;
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting stars
    for (let i = 0; i < 3; i++) {
      const sa = gameTime * 6 + (i * Math.PI * 2) / 3;
      drawStar(ctx, Math.cos(sa) * 38, Math.sin(sa) * 38, 5, 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  // 1. Wheels (4 candy swirl wheels)
  const drawWheel = (wx: number, wy: number, steer: number = 0) => {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(steer);
    // Tire
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(-6, -11, 12, 22, 4);
    ctx.fill();
    // Pastel rim
    ctx.fillStyle = racer.colorTheme.secondary;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Front wheels with steering angle
  const steerAngle = kart.isDrifting ? kart.driftDirection * 0.4 : 0;
  drawWheel(18, -16, steerAngle);
  drawWheel(18, 16, steerAngle);
  // Rear wheels
  drawWheel(-18, -17, 0);
  drawWheel(-18, 17, 0);

  // 2. Drift Sparks from rear wheels
  if (kart.isDrifting && kart.driftTier > 0) {
    const sparkColor =
      kart.driftTier === 1 ? '#38bdf8' : kart.driftTier === 2 ? '#f472b6' : '#6ee7b7';
    ctx.save();
    ctx.shadowColor = sparkColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = sparkColor;

    for (let i = 0; i < 4; i++) {
      const sx = -22 - Math.random() * 12;
      const sy = (Math.random() - 0.5) * 36;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Exhaust Flames during Boost / Nitro
  if (kart.boostTimer > 0) {
    ctx.save();
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#a855f7';
    const flameLen = 18 + Math.random() * 12;
    // Left exhaust flame
    ctx.beginPath();
    ctx.moveTo(-22, -8);
    ctx.lineTo(-22 - flameLen, -8);
    ctx.lineTo(-22, -4);
    ctx.fill();
    // Right exhaust flame
    ctx.beginPath();
    ctx.moveTo(-22, 4);
    ctx.lineTo(-22 - flameLen, 8);
    ctx.lineTo(-22, 8);
    ctx.fill();
    ctx.restore();
  }

  // 4. Kart Chassis (Main body)
  ctx.shadowColor = racer.colorTheme.primary;
  ctx.shadowBlur = 8;
  ctx.fillStyle = racer.colorTheme.primary;
  ctx.beginPath();
  // Aerodynamic rounded nose to squarish spoiler rear
  ctx.moveTo(26, 0);
  ctx.bezierCurveTo(24, -14, 8, -15, -16, -15);
  ctx.lineTo(-22, -15);
  ctx.lineTo(-22, 15);
  ctx.lineTo(-16, 15);
  ctx.bezierCurveTo(8, 15, 24, 14, 26, 0);
  ctx.closePath();
  ctx.fill();

  // Racing Stripe
  ctx.fillStyle = racer.colorTheme.secondary;
  ctx.fillRect(-20, -3.5, 42, 7);

  // Cute Rear Spoiler
  ctx.fillStyle = racer.colorTheme.accent;
  ctx.fillRect(-24, -14, 4, 28);

  // Cockpit seat
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Driver Character
  if (racer.id === 'pip') {
    // Cute Ghost Pip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Cute blush
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(4, -5, 2, 0, Math.PI * 2);
    ctx.arc(4, 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(6, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(6, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Witch hat
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.ellipse(-3, 0, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d28d9';
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-2, 4);
    ctx.closePath();
    ctx.fill();
  } else if (racer.id === 'luna') {
    // Luna Cat Driver
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    // Cat ears
    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.lineTo(6, -14);
    ctx.lineTo(-2, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 8);
    ctx.lineTo(6, 14);
    ctx.lineTo(-2, 10);
    ctx.fill();
    // Glowing eyes
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(5, -3, 2, 0, Math.PI * 2);
    ctx.arc(5, 3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Barnaby / Mummy driver
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(6, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(6, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);

    if (p.shape === 'text' && p.text) {
      ctx.font = 'bold 16px "Fredoka", sans-serif';
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, 0, 0);
    } else if (p.shape === 'spark') {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    } else if (p.shape === 'star') {
      ctx.fillStyle = p.color;
      drawStar(ctx, 0, 0, 4, p.size, p.size * 0.4);
      ctx.fill();
    } else if (p.shape === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Circle smoke / dust
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

// Atmospheric headlights and spooky vignette with boss proximity heartbeat
function drawVignetteAndHeadlights(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kart: Kart,
  boss: Boss,
  cameraX: number,
  cameraY: number
) {
  ctx.save();

  // Screen-space kart position
  const screenKartX = kart.x - cameraX;
  const screenKartY = kart.y - cameraY;

  // Headlight cone from kart
  ctx.save();
  ctx.translate(screenKartX, screenKartY);
  ctx.rotate(kart.angle);
  const headlightGrad = ctx.createRadialGradient(20, 0, 10, 180, 0, 240);
  headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
  headlightGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.08)');
  headlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = headlightGrad;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.arc(20, 0, 240, -Math.PI / 5, Math.PI / 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Boss distance calculation
  const dx = kart.x - boss.x;
  const dy = kart.y - boss.y;
  const dist = Math.hypot(dx, dy);

  // Proximity red heartbeat pulse if boss is near
  if (dist < 650) {
    const danger = 1 - dist / 650;
    const pulse = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
    const edgeAlpha = danger * pulse * 0.45;

    const dangerGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.65);
    dangerGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    dangerGrad.addColorStop(1, `rgba(239, 68, 68, ${edgeAlpha})`);
    ctx.fillStyle = dangerGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Soft atmospheric corner vignette
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(10, 5, 20, 0.6)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
