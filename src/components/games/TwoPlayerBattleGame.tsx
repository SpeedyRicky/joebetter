import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Swords,
  Trophy,
  RotateCcw,
  Zap,
  Shield,
  Bot,
  Users,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Coins,
  Heart,
  Wind,
  Star,
  Lock,
  Target,
  Skull,
  Wand2,
} from 'lucide-react';
import { SoundManager } from '../chess/chessSounds';

const soundManager = new SoundManager();

export type GameMode = 'ai' | '2player';
export type AIDifficulty = 'easy' | 'normal' | 'hard';
export type MapType =
  | 'classic'
  | 'sky_islands'
  | 'cyber_rooftop'
  | 'magma_cavern'
  | 'ancient_colosseum'
  | 'quantum_void'
  | 'toxic_factory';
export type CharacterClass = 'vanguard' | 'marksman' | 'mage' | 'assassin' | 'special';
export type CharacterRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type AttackStyle = 'ranged' | 'melee' | 'teleport' | 'pull';

export type ProjectileType =
  | 'slash'
  | 'arrow'
  | 'fireball'
  | 'shuriken'
  | 'laser'
  | 'rocket'
  | 'ice_shard'
  | 'lightning'
  | 'poison_dart'
  | 'scythe'
  | 'holy_beam'
  | 'boomerang'
  | 'dual_laser'
  | 'wind_slash'
  | 'skull'
  | 'star_nova'
  | 'cluster_bomb'
  | 'quantum_pulse'
  | 'harpoon'
  | 'teleport_strike'
  | 'melee_slam'
  | 'tether_wire'
  | 'dragon_breath'
  | 'chrono_rift';

export interface Character {
  id: string;
  name: string;
  title: string;
  rarity: CharacterRarity;
  class: CharacterClass;
  color: string;
  secondaryColor: string;
  weapon: string;
  projectileType: ProjectileType;
  maxHp: number;
  speed: number;
  jumpForce: number;
  attackCooldown: number; // ms
  attackDamage: number;
  projectileSpeed: number;
  doubleJump?: boolean;
  tripleJump?: boolean;
  canFly?: boolean; // Can hover and soar in air when holding jump
  canTeleport?: boolean; // Warps behind enemy with dark rift strike
  pullsEnemy?: boolean; // Harpoons and pulls enemy into point-blank range
  isMelee?: boolean; // True close-range physical attack with screen shake
  attackStyle?: AttackStyle;
  unlockedByDefault: boolean;
  cost: number;
  description: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'knight',
    name: 'Iron Knight',
    title: 'Melee Vanguard',
    rarity: 'common',
    class: 'vanguard',
    color: '#3b82f6', // blue
    secondaryColor: '#60a5fa',
    weapon: 'Broadsword Slash',
    projectileType: 'slash',
    maxHp: 135,
    speed: 4.8,
    jumpForce: 13.5,
    attackCooldown: 340,
    attackDamage: 25,
    projectileSpeed: 9.5,
    doubleJump: false,
    unlockedByDefault: true,
    cost: 0,
    description: 'Stalwart armored tank with heavy slashing shockwaves and knockback.',
  },
  {
    id: 'archer',
    name: 'Forest Ranger',
    title: 'Deadeye Sharpshooter',
    rarity: 'common',
    class: 'marksman',
    color: '#10b981', // emerald
    secondaryColor: '#34d399',
    weapon: 'Recurve Bow',
    projectileType: 'arrow',
    maxHp: 100,
    speed: 5.6,
    jumpForce: 14.5,
    attackCooldown: 290,
    attackDamage: 18,
    projectileSpeed: 14.5,
    doubleJump: false,
    unlockedByDefault: true,
    cost: 0,
    description: 'Rapid-firing agile marksman launching long-range curved arrows.',
  },
  {
    id: 'mage',
    name: 'Pyromancer',
    title: 'Elemental Wizard',
    rarity: 'common',
    class: 'mage',
    color: '#ef4444', // red
    secondaryColor: '#f87171',
    weapon: 'Fireball Wand',
    projectileType: 'fireball',
    maxHp: 95,
    speed: 4.9,
    jumpForce: 14,
    attackCooldown: 410,
    attackDamage: 28,
    projectileSpeed: 10,
    doubleJump: false,
    unlockedByDefault: true,
    cost: 0,
    description: 'Fires explosive flaming orbs that detonate on impact with immense blast damage.',
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    title: 'Stealth Shinobi',
    rarity: 'rare',
    class: 'assassin',
    color: '#8b5cf6', // purple
    secondaryColor: '#a78bfa',
    weapon: 'Dual Shurikens',
    projectileType: 'shuriken',
    maxHp: 92,
    speed: 6.2,
    jumpForce: 15.5,
    attackCooldown: 260,
    attackDamage: 15,
    projectileSpeed: 15,
    doubleJump: true,
    unlockedByDefault: false,
    cost: 100,
    description: 'Acrobatic shinobi equipped with double-jump and rapid twin shuriken tosses.',
  },
  {
    id: 'valkyrie',
    name: 'Frost Valkyrie',
    title: 'Glacial Maiden',
    rarity: 'rare',
    class: 'vanguard',
    color: '#38bdf8', // sky blue
    secondaryColor: '#7dd3fc',
    weapon: 'Frost Ice Spear',
    projectileType: 'ice_shard',
    maxHp: 110,
    speed: 5.3,
    jumpForce: 14.5,
    attackCooldown: 310,
    attackDamage: 22,
    projectileSpeed: 15.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 120,
    description: 'Northern battle maiden throwing high-velocity piercing crystalline frost javelins.',
  },
  {
    id: 'venom',
    name: 'Venom Assassin',
    title: 'Toxic Stalker',
    rarity: 'rare',
    class: 'assassin',
    color: '#84cc16', // lime
    secondaryColor: '#a3e635',
    weapon: 'Poison Blowpipe',
    projectileType: 'poison_dart',
    maxHp: 88,
    speed: 6.4,
    jumpForce: 15.2,
    attackCooldown: 240,
    attackDamage: 14,
    projectileSpeed: 16,
    doubleJump: true,
    unlockedByDefault: false,
    cost: 130,
    description: 'Super-agile skirmisher firing twin venom needles with blinding move speed.',
  },
  {
    id: 'boomerang',
    name: 'Boomerang Hunter',
    title: 'Outback Tracker',
    rarity: 'rare',
    class: 'marksman',
    color: '#f59e0b', // amber
    secondaryColor: '#fbbf24',
    weapon: 'Razor Boomerang',
    projectileType: 'boomerang',
    maxHp: 105,
    speed: 5.4,
    jumpForce: 14.2,
    attackCooldown: 340,
    attackDamage: 23,
    projectileSpeed: 12,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 140,
    description: 'Skilled wilderness survivalist hurling heavy spinning curved blades.',
  },
  {
    id: 'blaster',
    name: 'Cyber Gunner',
    title: 'Plasma Operative',
    rarity: 'epic',
    class: 'marksman',
    color: '#06b6d4', // cyan
    secondaryColor: '#22d3ee',
    weapon: 'Plasma Cannon',
    projectileType: 'laser',
    maxHp: 110,
    speed: 5.2,
    jumpForce: 14,
    attackCooldown: 290,
    attackDamage: 21,
    projectileSpeed: 17,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 200,
    description: 'Futuristic soldier wielding a rapid high-tech piercing plasma laser beam.',
  },
  {
    id: 'ronin',
    name: 'Samurai Ronin',
    title: 'Blade Master',
    rarity: 'epic',
    class: 'assassin',
    color: '#dc2626', // crimson
    secondaryColor: '#f87171',
    weapon: 'Wind Katana',
    projectileType: 'wind_slash',
    maxHp: 115,
    speed: 5.8,
    jumpForce: 15,
    attackCooldown: 310,
    attackDamage: 24,
    projectileSpeed: 13.5,
    doubleJump: true,
    unlockedByDefault: false,
    cost: 220,
    description: 'Wandering master slicing through air to launch wide crimson sonic wind blades.',
  },
  {
    id: 'thor',
    name: 'Thunder Thor',
    title: 'Tempest Warrior',
    rarity: 'epic',
    class: 'vanguard',
    color: '#eab308', // gold/yellow
    secondaryColor: '#fde047',
    weapon: 'Storm Mjolnir',
    projectileType: 'lightning',
    maxHp: 125,
    speed: 5.0,
    jumpForce: 14.5,
    attackCooldown: 360,
    attackDamage: 27,
    projectileSpeed: 16.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 240,
    description: 'Harnesses thunder and tempest fury into crackling high-voltage lightning strikes.',
  },
  {
    id: 'android',
    name: 'Chrono Android',
    title: 'Neon Cyborg',
    rarity: 'epic',
    class: 'special',
    color: '#ec4899', // pink
    secondaryColor: '#f472b6',
    weapon: 'Twin Neon Pulse',
    projectileType: 'dual_laser',
    maxHp: 105,
    speed: 5.5,
    jumpForce: 14.8,
    attackCooldown: 270,
    attackDamage: 18,
    projectileSpeed: 16,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 250,
    description: 'Cybernetic operative releasing synchronized dual-beam energy volleys.',
  },
  {
    id: 'bomber',
    name: 'Demolition Goblin',
    title: 'Chaos Bomber',
    rarity: 'epic',
    class: 'special',
    color: '#ea580c', // deep orange
    secondaryColor: '#fb923c',
    weapon: 'Cluster Grenade',
    projectileType: 'cluster_bomb',
    maxHp: 98,
    speed: 5.7,
    jumpForce: 15.2,
    attackCooldown: 370,
    attackDamage: 30,
    projectileSpeed: 9.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 260,
    description: 'Mischievous pyrotechnic hurling arcing bouncy cluster grenades.',
  },
  {
    id: 'mech',
    name: 'Titan Golem',
    title: 'Armored Juggernaut',
    rarity: 'legendary',
    class: 'vanguard',
    color: '#d97706', // dark amber
    secondaryColor: '#fbbf24',
    weapon: 'Rocket Barrage',
    projectileType: 'rocket',
    maxHp: 150,
    speed: 4.3,
    jumpForce: 13,
    attackCooldown: 470,
    attackDamage: 34,
    projectileSpeed: 8.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 320,
    description: 'Colossal fortress machine launching heavy destructive explosive rockets.',
  },
  {
    id: 'reaper',
    name: 'Void Reaper',
    title: 'Abyssal Phantom',
    rarity: 'legendary',
    class: 'assassin',
    color: '#6366f1', // indigo
    secondaryColor: '#818cf8',
    weapon: 'Shadow Scythe',
    projectileType: 'scythe',
    maxHp: 110,
    speed: 5.6,
    jumpForce: 15.5,
    attackCooldown: 320,
    attackDamage: 26,
    projectileSpeed: 11,
    doubleJump: true,
    unlockedByDefault: false,
    cost: 340,
    description: 'Ghostly phantom slinging spinning dark crescent void blades through space.',
  },
  {
    id: 'paladin',
    name: 'Holy Paladin',
    title: 'Solar Crusader',
    rarity: 'legendary',
    class: 'vanguard',
    color: '#ca8a04', // golden sun
    secondaryColor: '#fef08a',
    weapon: 'Solar Lance',
    projectileType: 'holy_beam',
    maxHp: 145,
    speed: 4.6,
    jumpForce: 13.8,
    attackCooldown: 390,
    attackDamage: 31,
    projectileSpeed: 16.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 360,
    description: 'Sun-blessed holy warrior smiting opponents with radiant rays of divine light.',
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    title: 'Soul Harvester',
    rarity: 'legendary',
    class: 'mage',
    color: '#475569', // slate dark
    secondaryColor: '#94a3b8',
    weapon: 'Cursed Relic',
    projectileType: 'skull',
    maxHp: 108,
    speed: 5.1,
    jumpForce: 14.2,
    attackCooldown: 360,
    attackDamage: 27,
    projectileSpeed: 10.5,
    doubleJump: false,
    unlockedByDefault: false,
    cost: 380,
    description: 'Undead summoner launching floating cursed soul skulls that track life force.',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Sorceress',
    title: 'Starfall Weaver',
    rarity: 'legendary',
    class: 'mage',
    color: '#a855f7', // purple / magenta
    secondaryColor: '#e879f9',
    weapon: 'Star Wand',
    projectileType: 'star_nova',
    maxHp: 102,
    speed: 5.4,
    jumpForce: 15,
    attackCooldown: 310,
    attackDamage: 24,
    projectileSpeed: 13,
    doubleJump: true,
    unlockedByDefault: false,
    cost: 400,
    description: 'Stellar sorceress summoning sparkling supernovae bursting with cosmic stardust.',
  },
  {
    id: 'chain_warden',
    name: 'Chain Warden',
    title: 'Dread Harpooner',
    rarity: 'epic',
    class: 'vanguard',
    color: '#475569', // dark slate
    secondaryColor: '#f59e0b',
    weapon: 'Iron Chain Harpoon',
    projectileType: 'harpoon',
    maxHp: 140,
    speed: 4.7,
    jumpForce: 13.8,
    attackCooldown: 380,
    attackDamage: 28,
    projectileSpeed: 14,
    pullsEnemy: true,
    attackStyle: 'pull',
    doubleJump: false,
    unlockedByDefault: false,
    cost: 260,
    description: 'Heavy ironclad jailer launching a barbed chain hook that grabs and violently drags foes right to him!',
  },
  {
    id: 'phase_ninja',
    name: 'Phase Phantom',
    title: 'Void Infiltrator',
    rarity: 'legendary',
    class: 'assassin',
    color: '#7c3aed', // violet
    secondaryColor: '#c084fc',
    weapon: 'Void Blink Dagger',
    projectileType: 'teleport_strike',
    maxHp: 105,
    speed: 5.9,
    jumpForce: 15.5,
    attackCooldown: 350,
    attackDamage: 32,
    projectileSpeed: 0,
    canTeleport: true,
    isMelee: true,
    attackStyle: 'teleport',
    doubleJump: true,
    unlockedByDefault: false,
    cost: 360,
    description: 'Mysterious void assassin who warps behind opponents with dark rift particles to execute a lethal backstab!',
  },
  {
    id: 'sky_valkyrie',
    name: 'Aero Seraph',
    title: 'Sky Valkyrie',
    rarity: 'legendary',
    class: 'special',
    color: '#eab308', // golden amber
    secondaryColor: '#fef08a',
    weapon: 'Celestial Wings & Javelin',
    projectileType: 'holy_beam',
    maxHp: 118,
    speed: 5.7,
    jumpForce: 16.5,
    attackCooldown: 300,
    attackDamage: 27,
    projectileSpeed: 13.5,
    canFly: true,
    doubleJump: true,
    tripleJump: true,
    attackStyle: 'ranged',
    unlockedByDefault: false,
    cost: 380,
    description: 'Blessed with radiant golden feathered wings! Hold Jump to soar and hover in mid-air while firing holy javelins!',
  },
  {
    id: 'berserker',
    name: 'Titan Berserker',
    title: 'Earthbreaker Brawler',
    rarity: 'legendary',
    class: 'vanguard',
    color: '#991b1b', // dark crimson
    secondaryColor: '#f87171',
    weapon: 'Titanic Ground Slam',
    projectileType: 'melee_slam',
    maxHp: 165,
    speed: 5.0,
    jumpForce: 14.5,
    attackCooldown: 360,
    attackDamage: 42,
    projectileSpeed: 6,
    isMelee: true,
    attackStyle: 'melee',
    doubleJump: false,
    unlockedByDefault: false,
    cost: 390,
    description: 'Colossal pure melee juggernaut. Leaps forward to smash his warhammer into the earth with massive screen-shaking shockwaves!',
  },
  {
    id: 'cyber_grappler',
    name: 'Apex Grappler',
    title: 'Bounty Reel Hunter',
    rarity: 'epic',
    class: 'marksman',
    color: '#0284c7', // sky blue
    secondaryColor: '#38bdf8',
    weapon: 'Plasma Tether Gun',
    projectileType: 'tether_wire',
    maxHp: 115,
    speed: 5.5,
    jumpForce: 14.8,
    attackCooldown: 340,
    attackDamage: 26,
    projectileSpeed: 15,
    pullsEnemy: true,
    attackStyle: 'pull',
    doubleJump: true,
    unlockedByDefault: false,
    cost: 280,
    description: 'Tactical bounty hunter firing electrified plasma tether cables that shock and yank targets directly toward him.',
  },
  {
    id: 'dragonkin',
    name: 'Inferno Wyrmlord',
    title: 'Draconic Sovereign',
    rarity: 'mythic',
    class: 'special',
    color: '#b91c1c', // deep ruby red
    secondaryColor: '#f97316',
    weapon: 'Dragonflight & Magma Breath',
    projectileType: 'dragon_breath',
    maxHp: 155,
    speed: 5.6,
    jumpForce: 16.0,
    attackCooldown: 290,
    attackDamage: 36,
    projectileSpeed: 8,
    canFly: true,
    isMelee: true,
    attackStyle: 'melee',
    doubleJump: true,
    tripleJump: true,
    unlockedByDefault: false,
    cost: 480,
    description: 'Ancient draconic warrior equipped with expansive wings for gliding flight, unleashing wide torrents of scorched magma breath!',
  },
  {
    id: 'chronos',
    name: 'Chrono Weaver',
    title: 'Temporal Manipulator',
    rarity: 'mythic',
    class: 'special',
    color: '#0d9488', // teal
    secondaryColor: '#2dd4bf',
    weapon: 'Temporal Rift Warp',
    projectileType: 'chrono_rift',
    maxHp: 125,
    speed: 6.2,
    jumpForce: 16.2,
    attackCooldown: 280,
    attackDamage: 34,
    projectileSpeed: 0,
    canTeleport: true,
    attackStyle: 'teleport',
    doubleJump: true,
    tripleJump: true,
    unlockedByDefault: false,
    cost: 490,
    description: 'Master of the timeline who blinks instantaneously across space leaving behind temporal distortion shockwaves!',
  },
  {
    id: 'gret_prime',
    name: 'Gret Prime',
    title: 'AI Sovereign Boss',
    rarity: 'mythic',
    class: 'special',
    color: '#0ea5e9', // cyan-sky
    secondaryColor: '#38bdf8',
    weapon: 'Quantum Core Wave',
    projectileType: 'quantum_pulse',
    maxHp: 165,
    speed: 6.2,
    jumpForce: 16.5,
    attackCooldown: 260,
    attackDamage: 35,
    projectileSpeed: 15,
    doubleJump: true,
    tripleJump: true,
    canFly: true,
    unlockedByDefault: false,
    cost: 500,
    description: 'The supreme AI sovereign! Possesses celestial quantum flight, triple jumps, and emits hypersonic quantum pulse rings.',
  },
];

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  isJumpPad?: boolean;
}

interface Projectile {
  id: number;
  owner: 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: Character['projectileType'];
  color: string;
  life: number; // ticks remaining
  pullsEnemy?: boolean;
  isMeleeHitbox?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface DamageNumber {
  id: number;
  x: number;
  y: number;
  damage: number;
  life: number;
  color: string;
}

interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  hp: number;
  maxHp: number;
  character: Character;
  lastAttackTime: number;
  jumpsLeft: number;
  score: number;
  isHit: boolean;
  hitTimer: number;
}

// Background rendering per arena map
const renderArenaBackground = (
  ctx: CanvasRenderingContext2D,
  map: MapType,
  W: number,
  H: number,
  now: number
) => {
  if (map === 'sky_islands') {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.7, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Drifting clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const cloud1X = ((now * 0.02) % (W + 200)) - 100;
    const cloud2X = (((now * 0.015) + 300) % (W + 200)) - 100;
    [cloud1X, cloud2X].forEach((cx, idx) => {
      const cy = 70 + idx * 80;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.arc(cx + 26, cy - 10, 24, 0, Math.PI * 2);
      ctx.arc(cx + 46, cy, 28, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant floating island silhouettes
    ctx.fillStyle = 'rgba(12, 74, 110, 0.25)';
    ctx.beginPath();
    ctx.ellipse(180, 260, 90, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(620, 280, 110, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (map === 'cyber_rooftop') {
    const nightGrad = ctx.createLinearGradient(0, 0, 0, H);
    nightGrad.addColorStop(0, '#09090b');
    nightGrad.addColorStop(0.6, '#1e1b4b');
    nightGrad.addColorStop(1, '#31104b');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, W, H);

    // Distant Skyscrapers
    const buildings = [
      { x: 30, w: 70, h: 260, col: '#1e1b4b' },
      { x: 120, w: 90, h: 320, col: '#2e1065' },
      { x: 230, w: 60, h: 220, col: '#1e1b4b' },
      { x: 310, w: 100, h: 350, col: '#3b0764' },
      { x: 430, w: 80, h: 270, col: '#1e1b4b' },
      { x: 530, w: 110, h: 330, col: '#2e1065' },
      { x: 660, w: 90, h: 280, col: '#1e1b4b' },
    ];
    buildings.forEach((b) => {
      ctx.fillStyle = b.col;
      ctx.fillRect(b.x, H - b.h, b.w, b.h);
      // Windows
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      for (let wy = H - b.h + 20; wy < H - 40; wy += 25) {
        for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 16) {
          if (Math.sin(wx * 11 + wy * 7) > -0.2) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
    });

    // Cyber neon grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, H - 90);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  } else if (map === 'magma_cavern') {
    const lavaGrad = ctx.createLinearGradient(0, 0, 0, H);
    lavaGrad.addColorStop(0, '#1c1917');
    lavaGrad.addColorStop(0.6, '#450a0a');
    lavaGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, 0, W, H);

    // Glowing magma lake at the bottom
    const magmaGrad = ctx.createLinearGradient(0, H - 35, 0, H);
    magmaGrad.addColorStop(0, '#ea580c');
    magmaGrad.addColorStop(0.5, '#ef4444');
    magmaGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = magmaGrad;
    ctx.fillRect(0, H - 30, W, 30);

    // Rising magma sparks
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 15; i++) {
      const sparkX = ((i * 54 + (now * 0.05)) % W);
      const sparkY = H - 30 - ((i * 37 + (now * 0.08)) % 160);
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obsidian stalactites from ceiling
    ctx.fillStyle = '#292524';
    for (let i = 40; i < W; i += 90) {
      ctx.beginPath();
      ctx.moveTo(i - 20, 0);
      ctx.lineTo(i + 20, 0);
      ctx.lineTo(i, 35 + (i % 30));
      ctx.closePath();
      ctx.fill();
    }
  } else if (map === 'ancient_colosseum') {
    const colGrad = ctx.createLinearGradient(0, 0, 0, H);
    colGrad.addColorStop(0, '#451a03');
    colGrad.addColorStop(0.5, '#78350f');
    colGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = colGrad;
    ctx.fillRect(0, 0, W, H);

    // Marble roman pillars on sides
    [30, W - 65].forEach((px) => {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(px, 40, 35, H - 40);
      // Pillar ridges
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(px + 8, 40, 6, H - 40);
      ctx.fillRect(px + 21, 40, 6, H - 40);
      // Capital top
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 6, 30, 47, 14);
    });

    // Imperial golden sun in the center background
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    ctx.arc(W / 2, 160, 90, 0, Math.PI * 2);
    ctx.fill();
  } else if (map === 'quantum_void') {
    const voidGrad = ctx.createLinearGradient(0, 0, 0, H);
    voidGrad.addColorStop(0, '#030712');
    voidGrad.addColorStop(0.5, '#1e1b4b');
    voidGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, W, H);

    // Cosmic nebula clouds
    ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.beginPath();
    ctx.arc(W * 0.35, H * 0.45, 140, 0, Math.PI * 2);
    ctx.arc(W * 0.65, H * 0.35, 120, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling cosmos stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % W;
      const sy = (i * 61) % H;
      const flicker = (Math.sin(now * 0.003 + i) + 1) * 0.5;
      ctx.fillStyle = `rgba(244, 244, 245, ${0.3 + flicker * 0.7})`;
      ctx.beginPath();
      ctx.arc(sx, sy, i % 3 === 0 ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'toxic_factory') {
    const toxGrad = ctx.createLinearGradient(0, 0, 0, H);
    toxGrad.addColorStop(0, '#0f172a');
    toxGrad.addColorStop(0.6, '#14532d');
    toxGrad.addColorStop(1, '#052e16');
    ctx.fillStyle = toxGrad;
    ctx.fillRect(0, 0, W, H);

    // Acid vat at the bottom
    const acidGrad = ctx.createLinearGradient(0, H - 25, 0, H);
    acidGrad.addColorStop(0, '#84cc16');
    acidGrad.addColorStop(1, '#4d7c0f');
    ctx.fillStyle = acidGrad;
    ctx.fillRect(0, H - 25, W, 25);

    // Bubbles rising from acid
    ctx.fillStyle = '#bef264';
    for (let i = 0; i < 10; i++) {
      const bx = (i * 83 + now * 0.03) % W;
      const by = H - 25 - ((i * 47 + now * 0.05) % 80);
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Overhead industrial pipes
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 30, W, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 33, W, 4);
  } else {
    // Classic Retro Scratch grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }
};

// Render unique character visuals and distinct Player 1 vs Player 2 indicators
const renderCharacterSprite = (
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  playerNum: 1 | 2,
  isGret: boolean,
  now: number
) => {
  const dir = p.facing === 'right' ? 1 : -1;
  const isP1 = playerNum === 1;

  ctx.save();
  ctx.translate(p.x, p.y);

  // 1. Player Pedestal Ring under feet (Blue for P1, Red/Crimson for P2)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(p.width / 2, p.height + 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = isP1 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(239, 68, 68, 0.25)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isP1 ? '#3b82f6' : '#ef4444';
  ctx.stroke();
  ctx.restore();

  // 2. Player Distinction Mantle / Cape / Scarf
  // Player 1 has a flowing royal blue hero cape; Player 2 has a crimson rogue collar/sash
  const capeFlutter = Math.sin(now * 0.01 + playerNum) * 3;
  ctx.fillStyle = isP1 ? '#2563eb' : '#dc2626';
  ctx.beginPath();
  const capeStartX = p.width / 2 - dir * 4;
  ctx.moveTo(capeStartX, 12);
  ctx.lineTo(capeStartX - dir * 16, 26 + capeFlutter);
  ctx.lineTo(capeStartX - dir * 12, 34 + capeFlutter);
  ctx.lineTo(capeStartX + dir * 2, 20);
  ctx.closePath();
  ctx.fill();

  // 3. Wings for Flying Characters (Sky Valkyrie, Dragonkin, Gret Prime)
  if (p.character.canFly || p.character.id === 'sky_valkyrie' || p.character.id === 'dragonkin' || p.character.id === 'gret_prime') {
    const wingFlap = Math.sin(now * 0.012) * 12;
    ctx.save();
    if (p.character.id === 'dragonkin') {
      // Leathery Dragon Wings
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(p.width / 2, 14);
        ctx.lineTo(p.width / 2 + side * 24, 6 + wingFlap * side);
        ctx.lineTo(p.width / 2 + side * 18, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    } else if (p.character.id === 'gret_prime') {
      // Holographic Cyber Wings
      ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(p.width / 2, 12);
        ctx.lineTo(p.width / 2 + side * 26, 4 + wingFlap * side);
        ctx.lineTo(p.width / 2 + side * 16, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    } else {
      // Angelic Feathered Wings (Sky Valkyrie)
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(p.width / 2, 14);
        ctx.quadraticCurveTo(p.width / 2 + side * 28, 0 + wingFlap * side, p.width / 2 + side * 22, 24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  // 4. Base Body / Torso
  const bodyColor = p.isHit ? '#ffffff' : p.character.color;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(0, 10, p.width, p.height - 10, 6);
  ctx.fill();

  // Armor Plates & Accents
  ctx.fillStyle = p.isHit ? '#ffffff' : p.character.secondaryColor;
  ctx.fillRect(4, 16, p.width - 8, 12);

  // 5. Head
  const headColor = p.isHit ? '#ffffff' : p.character.secondaryColor;
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(p.width / 2, 9, 9, 0, Math.PI * 2);
  ctx.fill();

  // 6. Eyes / Visor
  ctx.fillStyle = '#0f172a';
  const eyeX = dir === 1 ? p.width / 2 + 3 : p.width / 2 - 5;
  ctx.beginPath();
  ctx.arc(eyeX, 9, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Distinct Character Gear & Equipment
  const cid = p.character.id;

  if (cid === 'knight') {
    // Silver Knight Helmet Crest & Visor Slit
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(p.width / 2 - 8, 2, 16, 5);
    ctx.fillStyle = isP1 ? '#3b82f6' : '#ef4444';
    ctx.fillRect(p.width / 2 - 3, -4, 6, 7); // helmet plume
    // Broadsword in hand
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(p.width / 2 + dir * 8, 12, dir * 18, 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(p.width / 2 + dir * 8, 8, dir * 3, 12); // crossguard
  } else if (cid === 'archer') {
    // Green Ranger Beret & Feather
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(p.width / 2, 4, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(p.width / 2 - dir * 4, -5, 3, 8); // feather
    // Longbow
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.width / 2 + dir * 14, 20, 14, dir === 1 ? -Math.PI * 0.4 : Math.PI * 0.6, dir === 1 ? Math.PI * 0.4 : Math.PI * 1.4);
    ctx.stroke();
  } else if (cid === 'mage') {
    // Wizard Conical Hat
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 12, 5);
    ctx.lineTo(p.width / 2 + 12, 5);
    ctx.lineTo(p.width / 2 + dir * 6, -12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(p.width / 2 + dir * 6, -12, 3, 0, Math.PI * 2);
    ctx.fill(); // star rune tip
    // Wand with fire orb
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.width / 2, 22);
    ctx.lineTo(p.width / 2 + dir * 18, 14);
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(p.width / 2 + dir * 18, 14, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'ninja') {
    // Ninja Headband ribbons blowing in wind
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(p.width / 2 - 8, 5, 16, 4);
    const ribbonWave = Math.sin(now * 0.015) * 4;
    ctx.fillRect(p.width / 2 - dir * 10, 6, -dir * 14, 3 + ribbonWave);
    // Kunai
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(p.width / 2 + dir * 6, 20, dir * 10, 3);
  } else if (cid === 'cyborg') {
    // Cyber Terminator Eye & Arm Cannon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(eyeX, 9, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Heavy Arm Cannon
    ctx.fillStyle = '#475569';
    ctx.fillRect(p.width / 2 + dir * 6, 16, dir * 18, 7);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(p.width / 2 + dir * 18, 17, dir * 4, 5);
  } else if (cid === 'cleric') {
    // Golden Holy Angelic Halo
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(p.width / 2, -3, 11, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (cid === 'frost_mage') {
    // Ice Crystal Crown
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 8, 3);
    ctx.lineTo(p.width / 2 - 4, -4);
    ctx.lineTo(p.width / 2, 2);
    ctx.lineTo(p.width / 2 + 4, -5);
    ctx.lineTo(p.width / 2 + 8, 3);
    ctx.closePath();
    ctx.fill();
  } else if (cid === 'sniper') {
    // Camo Beret & Red Targeting Laser
    ctx.fillStyle = '#334155';
    ctx.fillRect(p.width / 2 - 9, 2, 18, 5);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.width / 2 + dir * 10, 9);
    ctx.lineTo(p.width / 2 + dir * 80, 9);
    ctx.stroke();
  } else if (cid === 'brawler') {
    // Spiked Boxing Wraps on Fists
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(p.width / 2 + dir * 8, 16, 8, 8);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(p.width / 2 + dir * 12, 14, 4, 4);
  } else if (cid === 'mech') {
    // Square Robot Chassis with Cyclops Eye & Smokestacks
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(p.width / 2 - 6, 7, 12, 4); // horizontal eye
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, 6, 4, 8); // stack 1
    ctx.fillRect(p.width - 6, 6, 4, 8); // stack 2
  } else if (cid === 'reaper') {
    // Grim Reaper Hood & Giant Curved Scythe
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(p.width / 2, 8, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(eyeX - 1, 8, 3, 2); // glowing purple eye
    // Giant Scythe
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(p.width / 2 - dir * 4, 8, 16, 0, Math.PI * 0.9);
    ctx.stroke();
  } else if (cid === 'chain_warden') {
    // Iron Cage Executioner Helm & Chains
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 16);
    ctx.lineTo(p.width - 4, 28);
    ctx.moveTo(4, 28);
    ctx.lineTo(p.width - 4, 16);
    ctx.stroke(); // chains across chest
    // Harpoon
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(p.width / 2 + dir * 8, 18, dir * 16, 3);
  } else if (cid === 'phase_ninja') {
    // Void Assassin with Void Mist Aura
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(eyeX, 9, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'berserker') {
    // Horned Viking Skullcrusher Helm & Giant Warhammer
    ctx.fillStyle = '#991b1b';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(p.width / 2 + side * 6, 4);
      ctx.lineTo(p.width / 2 + side * 14, -5);
      ctx.lineTo(p.width / 2 + side * 8, 8);
      ctx.closePath();
      ctx.fill();
    });
    // Massive Warhammer
    ctx.fillStyle = '#78350f';
    ctx.fillRect(p.width / 2 + dir * 8, 14, dir * 18, 4); // handle
    ctx.fillStyle = '#475569';
    ctx.fillRect(p.width / 2 + dir * 20, 6, dir * 10, 20); // heavy hammer head
  } else if (cid === 'cyber_grappler') {
    // Tactical Visor & Winch
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(p.width / 2 - 5, 7, 10, 4);
  } else if (cid === 'dragonkin') {
    // Dragon Horns
    ctx.fillStyle = '#f97316';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(p.width / 2 + side * 5, 4);
      ctx.lineTo(p.width / 2 + side * 12, -7);
      ctx.lineTo(p.width / 2 + side * 8, 8);
      ctx.closePath();
      ctx.fill();
    });
  } else if (cid === 'chronos') {
    // Rotating Clockwork Gear Halo
    ctx.save();
    ctx.translate(p.width / 2, 6);
    ctx.rotate(now * 0.002);
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillStyle = '#2dd4bf';
      ctx.fillRect(-2, -17, 4, 4);
    }
    ctx.restore();
  } else if (cid === 'gret_prime') {
    // Quantum Sovereign Hologram Crown & Core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 8, 2);
    ctx.lineTo(p.width / 2, -6);
    ctx.lineTo(p.width / 2 + 8, 2);
    ctx.closePath();
    ctx.fill();
    // Pulsing chest reactor
    const pulse = (Math.sin(now * 0.01) + 1) * 0.5;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(p.width / 2, 22, 5 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // 8. Overhead Player Badges & Health Bar
  const hpBarW = 46;
  const hpBarH = 5;
  const hpPercent = Math.max(0, p.hp / p.maxHp);

  // Health bar background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(p.x + p.width / 2 - hpBarW / 2, p.y - 14, hpBarW, hpBarH);

  // Health bar fill
  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(p.x + p.width / 2 - hpBarW / 2, p.y - 14, hpBarW * hpPercent, hpBarH);

  // Distinct Overhead Badge: [ P1 ] in Blue, [ P2 ] or [ GRET ⚡ ] in Red
  const badgeLabel = isP1 ? 'P1 🛡️' : isGret ? 'GRET ⚡' : 'P2 ⚔️';
  ctx.fillStyle = isP1 ? '#3b82f6' : '#ef4444';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeLabel, p.x + p.width / 2, p.y - 18);
};

export const TwoPlayerBattleGame: React.FC = () => {
  // Game Configuration State
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const [selectedMap, setSelectedMap] = useState<MapType>('classic');
  const [p1Char, setP1Char] = useState<Character>(CHARACTERS[0]);
  const [p2Char, setP2Char] = useState<Character>(CHARACTERS[1]);
  const [roundTarget, setRoundTarget] = useState<number>(3); // First to 3

  // Economy & Unlocks (from Scratch 292728003 chest system!)
  const [gold, setGold] = useState<number>(() => {
    const saved = localStorage.getItem('gret_battle_gold');
    return saved ? parseInt(saved, 10) : 120;
  });
  const [unlockedCharIds, setUnlockedCharIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gret_battle_unlocked');
    return saved ? JSON.parse(saved) : ['knight', 'archer', 'mage'];
  });

  // Filter state for character rosters
  const [p1ClassFilter, setP1ClassFilter] = useState<string>('all');
  const [p2ClassFilter, setP2ClassFilter] = useState<string>('all');

  // Game Lifecycle State
  const [gameState, setGameState] = useState<'menu' | 'character_select' | 'playing' | 'round_over' | 'game_over' | 'chests'>('menu');
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null);
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);
  const [roundCount, setRoundCount] = useState<number>(1);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [gretCommentary, setGretCommentary] = useState<string>("Ready for the 2 Player Battle arena! Pick your character and jump in!");
  const [chestOpeningResult, setChestOpeningResult] = useState<string | null>(null);

  // Canvas & Game Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Match entities
  const p1Ref = useRef<PlayerState | null>(null);
  const p2Ref = useRef<PlayerState | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const screenShakeRef = useRef<number>(0);

  // Save Gold and Unlocks
  useEffect(() => {
    localStorage.setItem('gret_battle_gold', gold.toString());
  }, [gold]);

  useEffect(() => {
    localStorage.setItem('gret_battle_unlocked', JSON.stringify(unlockedCharIds));
  }, [unlockedCharIds]);

  // Generate Map Platforms
  const getPlatforms = useCallback((map: MapType): Platform[] => {
    const W = 800;
    const H = 460;
    if (map === 'sky_islands') {
      return [
        { x: 50, y: H - 40, width: 220, height: 20, color: '#059669' },
        { x: W - 270, y: H - 40, width: 220, height: 20, color: '#059669' },
        { x: 310, y: H - 120, width: 180, height: 18, color: '#10b981', isJumpPad: true },
        { x: 140, y: H - 210, width: 160, height: 16, color: '#34d399' },
        { x: 500, y: H - 210, width: 160, height: 16, color: '#34d399' },
        { x: 300, y: H - 310, width: 200, height: 16, color: '#6ee7b7' },
      ];
    } else if (map === 'cyber_rooftop') {
      return [
        { x: 40, y: H - 30, width: W - 80, height: 20, color: '#0891b2' },
        { x: 100, y: H - 110, width: 160, height: 16, color: '#06b6d4' },
        { x: W - 260, y: H - 110, width: 160, height: 16, color: '#06b6d4' },
        { x: 310, y: H - 170, width: 180, height: 18, color: '#38bdf8', isJumpPad: true },
        { x: 180, y: H - 250, width: 140, height: 16, color: '#22d3ee' },
        { x: 480, y: H - 250, width: 140, height: 16, color: '#22d3ee' },
        { x: 330, y: H - 330, width: 140, height: 16, color: '#67e8f9' },
      ];
    } else if (map === 'magma_cavern') {
      return [
        { x: 40, y: H - 35, width: 220, height: 20, color: '#451a03' },
        { x: W - 260, y: H - 35, width: 220, height: 20, color: '#451a03' },
        { x: 290, y: H - 110, width: 220, height: 18, color: '#78350f', isJumpPad: true },
        { x: 130, y: H - 200, width: 160, height: 16, color: '#9a3412' },
        { x: 510, y: H - 200, width: 160, height: 16, color: '#9a3412' },
        { x: 280, y: H - 290, width: 240, height: 16, color: '#ea580c' },
      ];
    } else if (map === 'ancient_colosseum') {
      return [
        { x: 50, y: H - 30, width: W - 100, height: 22, color: '#b45309' },
        { x: 80, y: H - 125, width: 170, height: 18, color: '#fef3c7' },
        { x: W - 250, y: H - 125, width: 170, height: 18, color: '#fef3c7' },
        { x: 310, y: H - 180, width: 180, height: 18, color: '#f59e0b', isJumpPad: true },
        { x: 230, y: H - 280, width: 340, height: 18, color: '#fef08a' },
      ];
    } else if (map === 'quantum_void') {
      return [
        { x: 60, y: H - 45, width: 190, height: 18, color: '#581c87' },
        { x: W - 250, y: H - 45, width: 190, height: 18, color: '#581c87' },
        { x: 320, y: H - 120, width: 160, height: 18, color: '#a855f7', isJumpPad: true },
        { x: 130, y: H - 215, width: 150, height: 16, color: '#7c3aed' },
        { x: 520, y: H - 215, width: 150, height: 16, color: '#7c3aed' },
        { x: 280, y: H - 315, width: 240, height: 16, color: '#c084fc' },
      ];
    } else if (map === 'toxic_factory') {
      return [
        { x: 40, y: H - 35, width: 230, height: 20, color: '#1e293b' },
        { x: W - 270, y: H - 35, width: 230, height: 20, color: '#1e293b' },
        { x: 310, y: H - 115, width: 180, height: 18, color: '#65a30d', isJumpPad: true },
        { x: 120, y: H - 205, width: 160, height: 16, color: '#475569' },
        { x: 520, y: H - 205, width: 160, height: 16, color: '#475569' },
        { x: 290, y: H - 305, width: 220, height: 16, color: '#84cc16' },
      ];
    }
    // Classic (Scratch style)
    return [
      { x: 30, y: H - 30, width: W - 60, height: 22, color: '#475569' },
      { x: 120, y: H - 110, width: 170, height: 16, color: '#64748b' },
      { x: W - 290, y: H - 110, width: 170, height: 16, color: '#64748b' },
      { x: 320, y: H - 165, width: 160, height: 18, color: '#eab308', isJumpPad: true },
      { x: 190, y: H - 240, width: 150, height: 16, color: '#94a3b8' },
      { x: 460, y: H - 240, width: 150, height: 16, color: '#94a3b8' },
      { x: 310, y: H - 315, width: 180, height: 16, color: '#cbd5e1' },
    ];
  }, []);

  // Spawn Match/Round
  const initRound = useCallback((resetScores: boolean = false) => {
    const W = 800;
    const H = 460;

    p1Ref.current = {
      x: 120,
      y: H - 120,
      vx: 0,
      vy: 0,
      width: 28,
      height: 42,
      facing: 'right',
      isGrounded: false,
      hp: p1Char.maxHp,
      maxHp: p1Char.maxHp,
      character: p1Char,
      lastAttackTime: 0,
      jumpsLeft: p1Char.tripleJump ? 2 : p1Char.doubleJump ? 1 : 0,
      score: resetScores ? 0 : p1Score,
      isHit: false,
      hitTimer: 0,
    };

    p2Ref.current = {
      x: W - 150,
      y: H - 120,
      vx: 0,
      vy: 0,
      width: 28,
      height: 42,
      facing: 'left',
      isGrounded: false,
      hp: p2Char.maxHp,
      maxHp: p2Char.maxHp,
      character: p2Char,
      lastAttackTime: 0,
      jumpsLeft: p2Char.tripleJump ? 2 : p2Char.doubleJump ? 1 : 0,
      score: resetScores ? 0 : p2Score,
      isHit: false,
      hitTimer: 0,
    };

    projectilesRef.current = [];
    particlesRef.current = [];
    damageNumbersRef.current = [];
    screenShakeRef.current = 0;

    if (resetScores) {
      setP1Score(0);
      setP2Score(0);
      setRoundCount(1);
    }

    setRoundWinner(null);
    setMatchWinner(null);
    setGameState('playing');

    soundManager.playMove();
    setGretCommentary(
      gameMode === 'ai'
        ? `Round ${resetScores ? 1 : roundCount}! Can your ${p1Char.name} beat Gret's ${p2Char.name}?`
        : `Round ${resetScores ? 1 : roundCount}! Player 1 (${p1Char.name}) vs Player 2 (${p2Char.name}) - Fight!`
    );
  }, [p1Char, p2Char, p1Score, p2Score, roundCount, gameMode]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Prevent page scrolling on Arrow keys and Space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (gameState === 'playing') {
          e.preventDefault();
        }
      }

      // Quick restart with 'R'
      if (e.code === 'KeyR' && (gameState === 'round_over' || gameState === 'game_over')) {
        initRound(gameState === 'game_over');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, initRound]);

  // Spawn Attack Projectile
  const executeAttack = (playerNum: 1 | 2) => {
    const player = playerNum === 1 ? p1Ref.current : p2Ref.current;
    if (!player) return;

    const now = performance.now();
    if (now - player.lastAttackTime < player.character.attackCooldown) {
      return; // On cooldown
    }
    player.lastAttackTime = now;

    const dir = player.facing === 'right' ? 1 : -1;
    const speed = player.character.projectileSpeed;
    const char = player.character;

    // 1. Teleport Ability (Blinks behind enemy and strikes)
    if (char.canTeleport || char.attackStyle === 'teleport' || char.projectileType === 'teleport_strike' || char.projectileType === 'chrono_rift') {
      const opponent = playerNum === 1 ? p2Ref.current : p1Ref.current;
      if (opponent) {
        // Origin rift particles
        for (let i = 0; i < 14; i++) {
          particlesRef.current.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7,
            color: char.projectileType === 'chrono_rift' ? '#2dd4bf' : '#a855f7',
            size: 4,
            life: 18,
            maxLife: 18,
          });
        }

        // Warp behind opponent
        const behindDist = 36;
        const targetX = opponent.facing === 'right' ? opponent.x - behindDist : opponent.x + opponent.width + 6;
        player.x = Math.max(25, Math.min(800 - 55, targetX));
        player.y = opponent.y;
        player.facing = opponent.x > player.x ? 'right' : 'left';
        player.vx = 0;
        player.vy = -1.5;

        // Destination rift particles
        for (let i = 0; i < 16; i++) {
          particlesRef.current.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: char.secondaryColor,
            size: 4.5,
            life: 20,
            maxLife: 20,
          });
        }

        soundManager.playLaser();

        // Deliver instant backstab critical strike
        opponent.hp -= char.attackDamage;
        opponent.isHit = true;
        opponent.hitTimer = 12;
        opponent.vx = (player.facing === 'right' ? 1 : -1) * 9.5;
        opponent.vy = -4.5;
        screenShakeRef.current = 11;
        soundManager.playHit();

        damageNumbersRef.current.push({
          id: Math.random(),
          x: opponent.x + opponent.width / 2,
          y: opponent.y - 14,
          damage: char.attackDamage,
          life: 30,
          color: char.projectileType === 'chrono_rift' ? '#2dd4bf' : '#c084fc',
        });

        if (opponent.hp <= 0) {
          opponent.hp = 0;
          handleRoundEnd(playerNum);
        }
        return;
      }
    }

    // 2. Pure Melee Ability (Titan Ground Slam, Brawler Fist Rush, Dragon Breath)
    if (char.isMelee || char.attackStyle === 'melee' || char.projectileType === 'melee_slam' || char.projectileType === 'dragon_breath') {
      player.vx = dir * 7.5;
      soundManager.playExplosion();
      screenShakeRef.current = char.projectileType === 'melee_slam' ? 14 : 8;

      const hitW = char.projectileType === 'dragon_breath' ? 90 : 75;
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -hitW + 4),
        y: player.y + player.height / 2 - 14,
        vx: dir * (char.projectileType === 'dragon_breath' ? 5.5 : 2.5),
        vy: 0,
        radius: hitW / 2,
        damage: char.attackDamage,
        type: char.projectileType,
        color: char.color,
        life: char.projectileType === 'dragon_breath' ? 18 : 10,
        isMeleeHitbox: true,
      });
      return;
    }

    // 3. Pull Ability (Chain Harpoon, Plasma Tether Reel)
    if (char.pullsEnemy || char.attackStyle === 'pull' || char.projectileType === 'harpoon' || char.projectileType === 'tether_wire') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -20),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed * 1.35,
        vy: 0,
        radius: 12,
        damage: char.attackDamage,
        type: char.projectileType,
        color: char.secondaryColor,
        life: 48,
        pullsEnemy: true,
      });
      return;
    }

    soundManager.playAttack();

    if (char.projectileType === 'slash') {
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -18),
        y: player.y + player.height / 2 - 12,
        vx: dir * speed,
        vy: 0,
        radius: 18,
        damage: char.attackDamage,
        type: 'slash',
        color: char.color,
        life: 22,
      });
    } else if (char.projectileType === 'arrow') {
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 4 : -10),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed,
        vy: -1.2,
        radius: 6,
        damage: char.attackDamage,
        type: 'arrow',
        color: char.color,
        life: 65,
      });
    } else if (char.projectileType === 'fireball') {
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -14),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: 0,
        radius: 12,
        damage: char.attackDamage,
        type: 'fireball',
        color: '#f97316',
        life: 55,
      });
    } else if (char.projectileType === 'shuriken') {
      soundManager.playLaser();
      [-1, 1].forEach((angleOffset) => {
        projectilesRef.current.push({
          id: Math.random(),
          owner: playerNum,
          x: player.x + (dir === 1 ? player.width + 6 : -10),
          y: player.y + player.height / 2 - 4,
          vx: dir * speed,
          vy: angleOffset * 1.6,
          radius: 7,
          damage: Math.round(char.attackDamage * 0.75),
          type: 'shuriken',
          color: char.secondaryColor,
          life: 45,
        });
      });
    } else if (char.projectileType === 'laser') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -16),
        y: player.y + player.height / 2 - 5,
        vx: dir * speed * 1.2,
        vy: 0,
        radius: 8,
        damage: char.attackDamage,
        type: 'laser',
        color: '#22d3ee',
        life: 40,
      });
    } else if (char.projectileType === 'rocket') {
      soundManager.playExplosion();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -16),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed * 0.9,
        vy: -0.5,
        radius: 13,
        damage: char.attackDamage,
        type: 'rocket',
        color: '#fbbf24',
        life: 70,
      });
    } else if (char.projectileType === 'ice_shard') {
      soundManager.playCapture();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -12),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed,
        vy: -0.4,
        radius: 8,
        damage: char.attackDamage,
        type: 'ice_shard',
        color: '#38bdf8',
        life: 50,
      });
    } else if (char.projectileType === 'lightning') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 10 : -16),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed * 1.15,
        vy: 0,
        radius: 9,
        damage: char.attackDamage,
        type: 'lightning',
        color: '#facc15',
        life: 36,
      });
    } else if (char.projectileType === 'poison_dart') {
      soundManager.playAttack();
      [-0.8, 0.8].forEach((offsetY) => {
        projectilesRef.current.push({
          id: Math.random(),
          owner: playerNum,
          x: player.x + (dir === 1 ? player.width + 4 : -8),
          y: player.y + player.height / 2 + offsetY * 5 - 4,
          vx: dir * speed,
          vy: offsetY * 0.6,
          radius: 5,
          damage: Math.round(char.attackDamage * 0.65),
          type: 'poison_dart',
          color: '#84cc16',
          life: 48,
        });
      });
    } else if (char.projectileType === 'scythe') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -16),
        y: player.y + player.height / 2 - 10,
        vx: dir * speed,
        vy: -0.2,
        radius: 15,
        damage: char.attackDamage,
        type: 'scythe',
        color: '#818cf8',
        life: 52,
      });
    } else if (char.projectileType === 'holy_beam') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 10 : -20),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed * 1.2,
        vy: 0,
        radius: 11,
        damage: char.attackDamage,
        type: 'holy_beam',
        color: '#fbbf24',
        life: 42,
      });
    } else if (char.projectileType === 'boomerang') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -14),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: -0.6,
        radius: 12,
        damage: char.attackDamage,
        type: 'boomerang',
        color: '#f59e0b',
        life: 58,
      });
    } else if (char.projectileType === 'dual_laser') {
      soundManager.playLaser();
      [-5, 5].forEach((offsetY) => {
        projectilesRef.current.push({
          id: Math.random(),
          owner: playerNum,
          x: player.x + (dir === 1 ? player.width + 6 : -14),
          y: player.y + player.height / 2 + offsetY - 3,
          vx: dir * speed * 1.1,
          vy: 0,
          radius: 6,
          damage: Math.round(char.attackDamage * 0.6),
          type: 'dual_laser',
          color: '#ec4899',
          life: 40,
        });
      });
    } else if (char.projectileType === 'wind_slash') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -18),
        y: player.y + player.height / 2 - 14,
        vx: dir * speed,
        vy: 0,
        radius: 20,
        damage: char.attackDamage,
        type: 'wind_slash',
        color: '#ef4444',
        life: 26,
      });
    } else if (char.projectileType === 'skull') {
      soundManager.playCapture();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -14),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: 0,
        radius: 13,
        damage: char.attackDamage,
        type: 'skull',
        color: '#a855f7',
        life: 56,
      });
    } else if (char.projectileType === 'star_nova') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -16),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: -0.3,
        radius: 12,
        damage: char.attackDamage,
        type: 'star_nova',
        color: '#d946ef',
        life: 50,
      });
    } else if (char.projectileType === 'cluster_bomb') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -14),
        y: player.y + player.height / 2 - 10,
        vx: dir * speed * 0.9,
        vy: -3.2,
        radius: 10,
        damage: char.attackDamage,
        type: 'cluster_bomb',
        color: '#ea580c',
        life: 60,
      });
    } else if (char.projectileType === 'quantum_pulse') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 10 : -22),
        y: player.y + player.height / 2 - 10,
        vx: dir * speed * 1.15,
        vy: 0,
        radius: 16,
        damage: char.attackDamage,
        type: 'quantum_pulse',
        color: '#06b6d4',
        life: 48,
      });
    }
  };

  // Main Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 460;
    canvas.width = W;
    canvas.height = H;

    const platforms = getPlatforms(selectedMap);
    const GRAVITY = 0.58;
    const FRICTION = 0.84;

    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      if (!p1 || !p2) return;

      // 1. Process Player 1 Input (A, D to move; W to jump; S to attack)
      const keys = keysPressed.current;

      if (keys['KeyA']) {
        p1.vx -= 1.1;
        p1.facing = 'left';
      }
      if (keys['KeyD']) {
        p1.vx += 1.1;
        p1.facing = 'right';
      }
      if (keys['KeyW']) {
        if (p1.character.canFly) {
          p1.vy = Math.max(p1.vy - 0.78, -5.5);
          p1.isGrounded = false;
          if (Math.random() < 0.3) {
            particlesRef.current.push({
              x: p1.x + p1.width / 2 + (Math.random() - 0.5) * 16,
              y: p1.y + p1.height,
              vx: (Math.random() - 0.5) * 2,
              vy: 2.2,
              color: p1.character.secondaryColor,
              size: 3,
              life: 12,
              maxLife: 12,
            });
          }
        } else if (p1.isGrounded) {
          p1.vy = -p1.character.jumpForce;
          p1.isGrounded = false;
          p1.jumpsLeft = p1.character.tripleJump ? 2 : p1.character.doubleJump ? 1 : 0;
          soundManager.playJump();
          keys['KeyW'] = false; // require release
        } else if (p1.jumpsLeft > 0) {
          p1.vy = -p1.character.jumpForce * 0.92;
          p1.jumpsLeft--;
          soundManager.playJump();
          keys['KeyW'] = false;
        }
      }
      if (keys['KeyS']) {
        executeAttack(1);
      }

      // 2. Process Player 2 Input (Keys or Gret AI)
      if (gameMode === '2player') {
        if (keys['ArrowLeft']) {
          p2.vx -= 1.1;
          p2.facing = 'left';
        }
        if (keys['ArrowRight']) {
          p2.vx += 1.1;
          p2.facing = 'right';
        }
        if (keys['ArrowUp']) {
          if (p2.character.canFly) {
            p2.vy = Math.max(p2.vy - 0.78, -5.5);
            p2.isGrounded = false;
            if (Math.random() < 0.3) {
              particlesRef.current.push({
                x: p2.x + p2.width / 2 + (Math.random() - 0.5) * 16,
                y: p2.y + p2.height,
                vx: (Math.random() - 0.5) * 2,
                vy: 2.2,
                color: p2.character.secondaryColor,
                size: 3,
                life: 12,
                maxLife: 12,
              });
            }
          } else if (p2.isGrounded) {
            p2.vy = -p2.character.jumpForce;
            p2.isGrounded = false;
            p2.jumpsLeft = p2.character.tripleJump ? 2 : p2.character.doubleJump ? 1 : 0;
            soundManager.playJump();
            keys['ArrowUp'] = false;
          } else if (p2.jumpsLeft > 0) {
            p2.vy = -p2.character.jumpForce * 0.92;
            p2.jumpsLeft--;
            soundManager.playJump();
            keys['ArrowUp'] = false;
          }
        }
        if (keys['ArrowDown']) {
          executeAttack(2);
        }
      } else {
        // Gret AI Logic
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Facing
        p2.facing = dx > 0 ? 'right' : 'left';

        // Difficulty modifiers
        const speedMod = aiDifficulty === 'easy' ? 0.7 : aiDifficulty === 'normal' ? 0.95 : 1.25;
        const jumpChance = aiDifficulty === 'easy' ? 0.015 : aiDifficulty === 'normal' ? 0.035 : 0.06;
        const attackRange = p2.character.isMelee ? 130 : p2.character.projectileType === 'slash' ? 140 : 380;

        // Flight logic for AI
        if (p2.character.canFly && p2.y > 170 && (dy < -25 || Math.random() < 0.09)) {
          p2.vy = Math.max(p2.vy - 0.72, -4.8);
        }

        // Movement towards player or maintaining optimal combat distance
        if (dist > attackRange * 0.7) {
          p2.vx += (dx > 0 ? 0.9 : -0.9) * speedMod;
        } else if (dist < 60) {
          // Back up if too close for ranged characters
          if (!p2.character.isMelee && p2.character.projectileType !== 'slash') {
            p2.vx += (dx > 0 ? -0.8 : 0.8) * speedMod;
          }
        }

        // Jump logic: jump over platforms or if player is above
        if (p2.isGrounded && (dy < -40 || Math.random() < jumpChance)) {
          p2.vy = -p2.character.jumpForce;
          p2.isGrounded = false;
          soundManager.playJump();
        }

        // Attack trigger
        if (dist < attackRange && Math.abs(dy) < 80) {
          const attackAggression = aiDifficulty === 'easy' ? 0.04 : aiDifficulty === 'normal' ? 0.08 : 0.14;
          if (Math.random() < attackAggression) {
            executeAttack(2);
          }
        }
      }

      // 3. Physics & Boundaries Update for Players
      [p1, p2].forEach((p) => {
        // Max horizontal speed clamp
        const maxSpd = p.character.speed;
        p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));
        p.x += p.vx;
        p.vx *= FRICTION;

        // Apply gravity (reduced for flying characters)
        const grav = p.character.canFly ? GRAVITY * 0.38 : GRAVITY;
        p.vy += grav;
        p.y += p.vy;

        // Wall collisions
        if (p.x < 10) {
          p.x = 10;
          p.vx = 0;
        }
        if (p.x + p.width > W - 10) {
          p.x = W - 10 - p.width;
          p.vx = 0;
        }

        // Hit timer decay
        if (p.isHit) {
          p.hitTimer--;
          if (p.hitTimer <= 0) p.isHit = false;
        }

        // Bottom boundary (floor / void rescue)
        p.isGrounded = false;
        if (p.y + p.height > H - 10) {
          p.y = H - 10 - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.jumpsLeft = p.character.doubleJump ? 2 : 1;
        }

        // Platform collisions (one-way jumping from below)
        platforms.forEach((plat) => {
          const prevY = p.y - p.vy;
          if (
            p.x + p.width > plat.x &&
            p.x < plat.x + plat.width &&
            prevY + p.height <= plat.y + 4 &&
            p.y + p.height >= plat.y &&
            p.vy >= 0
          ) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
            p.jumpsLeft = p.character.doubleJump ? 2 : 1;

            if (plat.isJumpPad) {
              p.vy = -18;
              p.isGrounded = false;
              soundManager.playJump();
              // Spawn jump sparks
              for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                  x: plat.x + plat.width / 2,
                  y: plat.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 4 - 2,
                  color: '#facc15',
                  size: 3,
                  life: 20,
                  maxLife: 20,
                });
              }
            }
          }
        });
      });

      // 4. Update Projectiles
      const nextProjectiles: Projectile[] = [];
      projectilesRef.current.forEach((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        // Arrow gravity arc
        if (proj.type === 'arrow') {
          proj.vy += 0.12;
        }

        // Particle trail
        if (Math.random() < 0.6) {
          particlesRef.current.push({
            x: proj.x,
            y: proj.y,
            vx: -proj.vx * 0.15 + (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            color: proj.color,
            size: proj.type === 'fireball' ? 4 : 2.5,
            life: 14,
            maxLife: 14,
          });
        }

        // Check platform hits (absorb or destroy projectile, but melee hitboxes pass through)
        let hitPlatform = false;
        if (!proj.isMeleeHitbox) {
          platforms.forEach((plat) => {
            if (
              proj.x > plat.x &&
              proj.x < plat.x + plat.width &&
              proj.y > plat.y &&
              proj.y < plat.y + plat.height
            ) {
              hitPlatform = true;
            }
          });
        }

        // Target check
        const target = proj.owner === 1 ? p2 : p1;
        const hitTarget =
          proj.x + proj.radius > target.x &&
          proj.x - proj.radius < target.x + target.width &&
          proj.y + proj.radius > target.y &&
          proj.y - proj.radius < target.y + target.height;

        if (hitTarget) {
          // Apply damage & knockback
          target.hp -= proj.damage;
          target.isHit = true;
          target.hitTimer = 12;

          if (proj.pullsEnemy) {
            // Drag enemy towards the attacker!
            const attacker = proj.owner === 1 ? p1 : p2;
            const pullDir = attacker.x > target.x ? 1 : -1;
            target.vx = pullDir * 14.5;
            target.vy = -4.5;
            screenShakeRef.current = 10;
            soundManager.playAttack();

            // Spawn chain links / electric tether particles connecting target and attacker
            for (let i = 0; i < 16; i++) {
              const t = i / 16;
              particlesRef.current.push({
                x: target.x + (attacker.x - target.x) * t,
                y: target.y + target.height / 2 + (attacker.y - target.y) * t,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: proj.color,
                size: 3.5,
                life: 14,
                maxLife: 14,
              });
            }
          } else {
            target.vx += Math.sign(proj.vx) * (proj.damage > 20 ? 8.5 : 5.5);
            target.vy = -3.5;
            screenShakeRef.current = proj.damage > 22 ? 9 : 5;
          }
          soundManager.playHit();

          // Damage text
          damageNumbersRef.current.push({
            id: Math.random(),
            x: target.x + target.width / 2,
            y: target.y - 12,
            damage: proj.damage,
            life: 28,
            color: proj.color,
          });

          // Impact particles
          for (let i = 0; i < 12; i++) {
            particlesRef.current.push({
              x: target.x + target.width / 2,
              y: target.y + target.height / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: proj.color,
              size: Math.random() * 4 + 2,
              life: 20,
              maxLife: 20,
            });
          }

          // Check if K.O.
          if (target.hp <= 0) {
            target.hp = 0;
            const winner = proj.owner;
            handleRoundEnd(winner);
          }
        } else if (!hitPlatform && proj.life > 0 && proj.x > 0 && proj.x < W) {
          nextProjectiles.push(proj);
        } else if (hitPlatform) {
          // Impact dust
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
              x: proj.x,
              y: proj.y,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3,
              color: '#94a3b8',
              size: 2.5,
              life: 12,
              maxLife: 12,
            });
          }
        }
      });
      projectilesRef.current = nextProjectiles;

      // 5. Update Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      // 6. Update Damage Numbers
      damageNumbersRef.current = damageNumbersRef.current.filter((d) => {
        d.y -= 1.2;
        d.life--;
        return d.life > 0;
      });

      // 7. Render Everything on Canvas
      ctx.save();

      // Screen Shake
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current *= 0.85;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // Render Dynamic Arena Background
      renderArenaBackground(ctx, selectedMap, W, H, Date.now());

      // Render Platforms
      platforms.forEach((plat) => {
        ctx.fillStyle = plat.color || '#475569';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
        ctx.fill();

        // Platform top border highlight
        ctx.fillStyle = plat.isJumpPad ? '#fef08a' : 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);

        // Jump pad pulsing glow
        if (plat.isJumpPad) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
          ctx.fillRect(plat.x, plat.y - 6, plat.width, 6);
          ctx.fillStyle = '#ca8a04';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▲ JUMP ▲', plat.x + plat.width / 2, plat.y + 13);
        }
      });

      // Render Players with distinct P1 vs P2 styling & unique character gear
      renderCharacterSprite(ctx, p1, 1, false, Date.now());
      renderCharacterSprite(ctx, p2, 2, gameMode === 'ai', Date.now());

      // Render Projectiles
      projectilesRef.current.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 8;

        if (proj.type === 'harpoon') {
          // Heavy barbed harpoon anchor with chain
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(proj.vx >= 0 ? 10 : -10, 0);
          ctx.lineTo(proj.vx >= 0 ? -6 : 6, -7);
          ctx.lineTo(proj.vx >= 0 ? -3 : 3, 0);
          ctx.lineTo(proj.vx >= 0 ? -6 : 6, 7);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'melee_slam') {
          // Massive shockwave slam ripple
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'dragon_breath') {
          // Roaring fire cone
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (proj.type === 'tether_wire') {
          // Electrified plasma grapple wire
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(-8, -3, 16, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-5, -1.5, 10, 3);
          ctx.restore();
        } else if (proj.type === 'chrono_rift') {
          // Temporal rift shock ring
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.02);
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'slash') {
          // Curved sword slash wave
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, Math.PI * 0.25, Math.PI * 1.75, proj.vx < 0);
          ctx.lineWidth = 4;
          ctx.strokeStyle = proj.color;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (proj.type === 'arrow') {
          // Sharp arrow with shaft and tip
          const angle = Math.atan2(proj.vy, proj.vx);
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(angle);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-10, -1.5, 18, 3);
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(4, -5);
          ctx.lineTo(4, 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (proj.type === 'fireball') {
          // Glowing explosive fireball
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(proj.x - (proj.vx > 0 ? 3 : -3), proj.y, proj.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (proj.type === 'shuriken') {
          // Spinning four-pointed ninja star
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.025);
          ctx.fillRect(-proj.radius, -2, proj.radius * 2, 4);
          ctx.fillRect(-2, -proj.radius, 4, proj.radius * 2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (proj.type === 'laser') {
          // Intense plasma laser beam
          ctx.fillRect(proj.x - 14, proj.y - 3, 28, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(proj.x - 10, proj.y - 1.5, 20, 3);
        } else if (proj.type === 'rocket') {
          // High-explosive missile
          ctx.save();
          ctx.translate(proj.x, proj.y);
          if (proj.vx < 0) ctx.scale(-1, 1);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-8, -4, 16, 8);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(8, -5);
          ctx.lineTo(8, 5);
          ctx.closePath();
          ctx.fill();
          // Thruster flame
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-13, -2, 5, 4);
          ctx.restore();
        } else if (proj.type === 'ice_shard') {
          // Glacial crystalline spear
          ctx.save();
          ctx.translate(proj.x, proj.y);
          const angle = Math.atan2(proj.vy, proj.vx);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(-6, -4);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-6, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (proj.type === 'lightning') {
          // High-voltage lightning bolt
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const s = proj.vx >= 0 ? 1 : -1;
          ctx.moveTo(-10 * s, -4);
          ctx.lineTo(-2 * s, 3);
          ctx.lineTo(2 * s, -2);
          ctx.lineTo(12 * s, 2);
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'poison_dart') {
          // Sleek toxic needle
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(-7, -1.5, 14, 3);
          ctx.fillStyle = '#d9f99d';
          ctx.fillRect(proj.vx >= 0 ? 4 : -7, -2, 3, 4);
          ctx.restore();
        } else if (proj.type === 'scythe') {
          // Spinning dark crescent scythe blade
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.02);
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 1.3);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#818cf8';
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'holy_beam') {
          // Sun-blessed divine lance
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-12, -4, 24, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-8, -2, 16, 4);
          ctx.restore();
        } else if (proj.type === 'boomerang') {
          // Spinning curved boomerang
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.03);
          ctx.beginPath();
          ctx.moveTo(-10, -8);
          ctx.quadraticCurveTo(0, 0, 10, -8);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'dual_laser') {
          // Twin neon pink pulse pellets
          ctx.fillRect(proj.x - 8, proj.y - 2, 16, 4);
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(proj.x - 5, proj.y - 1, 10, 2);
        } else if (proj.type === 'wind_slash') {
          // Crimson sweeping air wave
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, Math.PI * 0.4, Math.PI * 1.6, proj.vx < 0);
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#dc2626';
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'skull') {
          // Floating cursed soul skull
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(proj.x - 3, proj.y - 2, 2, 3);
          ctx.fillRect(proj.x + 1, proj.y - 2, 2, 3);
        } else if (proj.type === 'star_nova') {
          // Sparkling 4-point star nova
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.02);
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(proj.radius, 0);
            ctx.lineTo(2, 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (proj.type === 'cluster_bomb') {
          // Demolition grenade sphere with burning fuse
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(proj.x + 4, proj.y - 4, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (proj.type === 'quantum_pulse') {
          // Concentric hypersonic quantum shock rings
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#e0f2fe';
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render Particles
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Render Floating Damage Numbers
      damageNumbersRef.current.forEach((d) => {
        ctx.fillStyle = d.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`-${d.damage}`, d.x, d.y);
        ctx.shadowBlur = 0;
      });

      ctx.restore();

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameMode, aiDifficulty, selectedMap, getPlatforms]);

  // Handle Round End
  const handleRoundEnd = (winner: 1 | 2) => {
    soundManager.playVictory();
    setRoundWinner(winner);

    const newP1Score = winner === 1 ? p1Score + 1 : p1Score;
    const newP2Score = winner === 2 ? p2Score + 1 : p2Score;
    setP1Score(newP1Score);
    setP2Score(newP2Score);

    // Reward gold for playing
    const earnedGold = winner === 1 ? 40 : 15;
    setGold((prev) => prev + earnedGold);

    // Commentary
    if (winner === 1) {
      setGretCommentary(
        gameMode === 'ai'
          ? `Solid hit! You took this round! (+${earnedGold} Gold)`
          : `Player 1 wins Round ${roundCount}! Fantastic reflexes!`
      );
    } else {
      setGretCommentary(
        gameMode === 'ai'
          ? `K.O.! Gret wins this round! Watch out for the attack timing!`
          : `Player 2 takes Round ${roundCount}!`
      );
    }

    // Check if match won
    if (newP1Score >= roundTarget) {
      setMatchWinner(1);
      setGameState('game_over');
      soundManager.playGameOver();
    } else if (newP2Score >= roundTarget) {
      setMatchWinner(2);
      setGameState('game_over');
      if (gameMode === 'ai') {
        soundManager.playLoss();
      } else {
        soundManager.playGameOver();
      }
    } else {
      setGameState('round_over');
      setRoundCount((prev) => prev + 1);
    }
  };

  // Open Chest (From Scratch project 292728003!)
  const handleOpenChest = (tier: 'small' | 'big' | 'legendary') => {
    const costs = { small: 60, big: 140, legendary: 260 };
    const cost = costs[tier];

    if (gold < cost) {
      setChestOpeningResult(`Not enough Gold! You need ${cost} Gold.`);
      return;
    }

    setGold((prev) => prev - cost);
    soundManager.playCapture();

    // Determine characters to unlock
    const lockedChars = CHARACTERS.filter((c) => !unlockedCharIds.includes(c.id));

    if (lockedChars.length === 0) {
      const bonusGold = cost * 1.5;
      setGold((prev) => prev + bonusGold);
      setChestOpeningResult(`All characters unlocked! Chest converted to +${bonusGold} Gold!`);
      return;
    }

    // Unlock a character
    const unlocked = lockedChars[Math.floor(Math.random() * lockedChars.length)];
    setUnlockedCharIds((prev) => [...prev, unlocked.id]);
    setChestOpeningResult(`🎉 UNLOCKED: ${unlocked.name}! (${unlocked.title})`);
  };

  // Direct recruit with gold
  const handleUnlockWithGold = (char: Character) => {
    if (unlockedCharIds.includes(char.id)) return;
    if (gold < char.cost) {
      setChestOpeningResult(`Not enough Gold! You need ${char.cost} Gold to recruit ${char.name}.`);
      return;
    }
    setGold((prev) => prev - char.cost);
    soundManager.playCapture();
    setUnlockedCharIds((prev) => [...prev, char.id]);
    setChestOpeningResult(`🎉 RECRUITED: ${char.name}! (${char.title}) is now available in your team.`);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-2 sm:p-4 text-neutral-900 dark:text-neutral-100 overflow-y-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                2 Player Battle
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                Scratch Remastered
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Inspired by Scratch project 292728003 • 2 Player Versus & AI Battle
            </p>
          </div>
        </div>

        {/* Mode Selector & Gold Balance */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{gold} Gold</span>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setGameMode('ai');
                if (gameState === 'playing') initRound(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                gameMode === 'ai'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>VS Gret (AI)</span>
            </button>
            <button
              onClick={() => {
                setGameMode('2player');
                if (gameState === 'playing') initRound(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                gameMode === '2player'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Players (Local)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gret Live Commentary Banner */}
      <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400">Gret:</span>
          <span>{gretCommentary}</span>
        </div>
        <button
          onClick={() => setGameState('chests')}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <Award className="w-3 h-3" />
          <span>Chests & Unlocks</span>
        </button>
      </div>

      {/* Main Game Interface based on state */}
      {gameState === 'playing' || gameState === 'round_over' || gameState === 'game_over' ? (
        <div className="flex flex-col gap-3">
          {/* Top In-Game Scoreboard */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-800">
            {/* Player 1 Details */}
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: p1Char.color }}
              />
              <span className="font-bold text-xs sm:text-sm">{p1Char.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 font-bold">
                {p1Score}
              </span>
            </div>

            {/* Match Status / Target */}
            <div className="text-xs font-semibold text-neutral-400">
              Round {roundCount} • First to {roundTarget}
            </div>

            {/* Player 2 Details */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-red-600 font-bold">
                {p2Score}
              </span>
              <span className="font-bold text-xs sm:text-sm">
                {gameMode === 'ai' ? `Gret (${p2Char.name})` : p2Char.name}
              </span>
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: p2Char.color }}
              />
            </div>
          </div>

          {/* Interactive Battle Canvas Container */}
          <div className="relative w-full aspect-16/9 max-h-[500px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-lg flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />

            {/* Round Over Modal Overlay */}
            {gameState === 'round_over' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  {roundWinner === 1 ? `${p1Char.name} WINS ROUND!` : `${gameMode === 'ai' ? 'Gret' : p2Char.name} WINS ROUND!`}
                </h3>
                <p className="text-xs text-neutral-400 mb-4 max-w-sm">
                  Score: {p1Score} - {p2Score} • First player to reach {roundTarget} wins the championship!
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => initRound(false)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    Next Round (or press 'R')
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Exit to Menu
                  </button>
                </div>
              </div>
            )}

            {/* Game Over / Champion Modal Overlay */}
            {gameState === 'game_over' && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-14 h-14 rounded-full bg-amber-500/25 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/40">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {matchWinner === 1 ? '🎉 PLAYER 1 IS THE CHAMPION!' : gameMode === 'ai' ? '👑 GRET WON THE BATTLE!' : '🎉 PLAYER 2 IS THE CHAMPION!'}
                </h3>
                <p className="text-xs text-neutral-300 mb-5 max-w-md leading-relaxed">
                  Final Score: {p1Score} - {p2Score}! Gold earned from match rewards has been added to your vault.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => initRound(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rematch (or press 'R')</span>
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar & Mobile/Touch Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-2xl text-xs">
            {/* Player 1 Controls Card */}
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Player 1: {p1Char.name}
                </span>
                <span className="text-[11px] text-neutral-500">Keyboard & Touch</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">A/D</span> Move
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">W</span> Jump
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">S</span> Attack
              </div>

              {/* On-screen touch buttons for mobile/tablet */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onMouseDown={() => (keysPressed.current['KeyA'] = true)}
                  onMouseUp={() => (keysPressed.current['KeyA'] = false)}
                  onTouchStart={() => (keysPressed.current['KeyA'] = true)}
                  onTouchEnd={() => (keysPressed.current['KeyA'] = false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-blue-600 active:text-white font-bold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onMouseDown={() => (keysPressed.current['KeyD'] = true)}
                  onMouseUp={() => (keysPressed.current['KeyD'] = false)}
                  onTouchStart={() => (keysPressed.current['KeyD'] = true)}
                  onTouchEnd={() => (keysPressed.current['KeyD'] = false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-blue-600 active:text-white font-bold transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    keysPressed.current['KeyW'] = true;
                    setTimeout(() => (keysPressed.current['KeyW'] = false), 120);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-blue-600 active:text-white font-bold transition"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeAttack(1)}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-95 transition"
                >
                  Attack (S)
                </button>
              </div>
            </div>

            {/* Player 2 / Gret Controls Card */}
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-600 dark:text-red-400">
                  {gameMode === 'ai' ? `Gret AI: ${p2Char.name}` : `Player 2: ${p2Char.name}`}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {gameMode === 'ai' ? `AI Difficulty: ${aiDifficulty}` : 'Keyboard & Touch'}
                </span>
              </div>

              {gameMode === '2player' ? (
                <>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">←/→</span> Move
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">↑</span> Jump
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">↓</span> Attack
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      onMouseDown={() => (keysPressed.current['ArrowLeft'] = true)}
                      onMouseUp={() => (keysPressed.current['ArrowLeft'] = false)}
                      onTouchStart={() => (keysPressed.current['ArrowLeft'] = true)}
                      onTouchEnd={() => (keysPressed.current['ArrowLeft'] = false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-red-600 active:text-white font-bold transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onMouseDown={() => (keysPressed.current['ArrowRight'] = true)}
                      onMouseUp={() => (keysPressed.current['ArrowRight'] = false)}
                      onTouchStart={() => (keysPressed.current['ArrowRight'] = true)}
                      onTouchEnd={() => (keysPressed.current['ArrowRight'] = false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-red-600 active:text-white font-bold transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        keysPressed.current['ArrowUp'] = true;
                        setTimeout(() => (keysPressed.current['ArrowUp'] = false), 120);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 active:bg-red-600 active:text-white font-bold transition"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => executeAttack(2)}
                      className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition"
                    >
                      Attack (↓)
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center h-[62px] text-neutral-500 dark:text-neutral-400 text-xs">
                  <p>Gret controls this warrior autonomously with platform pathfinding and projectile aiming.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : gameState === 'chests' ? (
        /* Chests & Unlocks Screen (Signature Scratch 292728003 Feature) */
        <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Battle Chests & Character Vault</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Earn gold from battle victories to open chests and unlock legendary warriors!
              </p>
            </div>
            <button
              onClick={() => setGameState('menu')}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
            >
              Back to Menu
            </button>
          </div>

          {chestOpeningResult && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
              {chestOpeningResult}
            </div>
          )}

          {/* Chest Tiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Small Chest */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm mb-1">Small Chest</h4>
              <p className="text-xs text-neutral-500 mb-3">Standard chance to unlock warriors.</p>
              <button
                onClick={() => handleOpenChest('small')}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
              >
                Open (60 Gold)
              </button>
            </div>

            {/* Big Chest */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm mb-1">Big Chest</h4>
              <p className="text-xs text-neutral-500 mb-3">High rate of rare character unlocks.</p>
              <button
                onClick={() => handleOpenChest('big')}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Open (140 Gold)
              </button>
            </div>

            {/* Legendary Chest */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm mb-1">Legendary Mythic Chest</h4>
              <p className="text-xs text-neutral-500 mb-3">Guaranteed top tier unlock or massive gold.</p>
              <button
                onClick={() => handleOpenChest('legendary')}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Open (260 Gold)
              </button>
            </div>
          </div>

          {/* Unlocked Characters Roster */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs text-neutral-500 uppercase tracking-wider">
                Hero Vault ({unlockedCharIds.length}/{CHARACTERS.length} Recruited)
              </h4>
              <span className="text-[11px] text-neutral-400">
                You can open chests or recruit directly with gold
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {CHARACTERS.map((char) => {
                const isUnlocked = unlockedCharIds.includes(char.id);
                return (
                  <div
                    key={char.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                      isUnlocked
                        ? 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xs'
                        : 'border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          char.rarity === 'mythic'
                            ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40 animate-pulse'
                            : char.rarity === 'legendary'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                            : char.rarity === 'epic'
                            ? 'border-purple-500/40 text-purple-400 bg-purple-950/30'
                            : char.rarity === 'rare'
                            ? 'border-blue-500/40 text-blue-400 bg-blue-950/30'
                            : 'border-neutral-500/30 text-neutral-400 bg-neutral-800/40'
                        }`}>
                          {char.rarity}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-semibold capitalize">
                          {char.class}
                        </span>
                      </div>

                      <div
                        className="w-9 h-9 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white font-black text-xs shadow-xs"
                        style={{ backgroundColor: isUnlocked ? char.color : '#475569' }}
                      >
                        {char.name[0]}
                      </div>
                      <div className="font-bold text-xs truncate text-center">{char.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate text-center mb-1">
                        {char.weapon}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-neutral-200 dark:border-neutral-800/80">
                      {isUnlocked ? (
                        <div className="text-[10px] font-bold text-emerald-500 text-center py-0.5">
                          ✓ Recruited
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUnlockWithGold(char)}
                          disabled={gold < char.cost}
                          className={`w-full py-1 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                            gold >= char.cost
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3 h-3" />
                          <span>{char.cost} Gold</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Main Lobby / Setup Menu Screen */
        <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 rounded-2xl">
          {/* Character Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 Selection */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Player 1 Warrior</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      {p1Char.rarity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                      {p1Char.name}
                    </span>
                  </div>
                </div>

                {/* Class Filter Tabs for P1 */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2.5 text-[10px]">
                  {['all', 'vanguard', 'marksman', 'mage', 'assassin', 'special'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setP1ClassFilter(cls)}
                      className={`px-2 py-0.5 rounded-md font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                        p1ClassFilter === cls
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* P1 Roster Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 max-h-[290px] overflow-y-auto pr-1">
                  {CHARACTERS.filter(
                    (c) => p1ClassFilter === 'all' || c.class === p1ClassFilter
                  ).map((char) => {
                    const isUnlocked = unlockedCharIds.includes(char.id);
                    const isSelected = p1Char.id === char.id;
                    return (
                      <button
                        key={char.id}
                        disabled={!isUnlocked}
                        onClick={() => {
                          setP1Char(char);
                          soundManager.playMove();
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'border-blue-500 bg-white dark:bg-neutral-800 shadow-xs ring-2 ring-blue-500/20'
                            : isUnlocked
                            ? 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 bg-white/70 dark:bg-neutral-800/70'
                            : 'border-dashed border-neutral-300 dark:border-neutral-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ backgroundColor: isUnlocked ? char.color : '#64748b' }}
                          >
                            {char.name[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold block truncate">{char.name}</span>
                            <span className="text-[9px] text-neutral-500 block truncate capitalize">
                              {isUnlocked ? char.class : 'Locked'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-neutral-500">
                          <span>HP {char.maxHp}</span>
                          <span>ATK {char.attackDamage}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Warrior Live Stats Display */}
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/60 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {p1Char.title} • {p1Char.weapon}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    {p1Char.canFly && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                        🕊️ Fly
                      </span>
                    )}
                    {p1Char.canTeleport && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ⚡ Teleport
                      </span>
                    )}
                    {p1Char.pullsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        🪝 Pull
                      </span>
                    )}
                    {p1Char.isMelee && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                        🥊 Melee
                      </span>
                    )}
                    {p1Char.tripleJump && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                        ⚡ Triple Jump
                      </span>
                    )}
                    {p1Char.doubleJump && !p1Char.tripleJump && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                        ✨ Double Jump
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-neutral-600 dark:text-neutral-400">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">HEALTH</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p1Char.maxHp}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">SPEED</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p1Char.speed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">DAMAGE</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p1Char.attackDamage}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">COOLDOWN</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p1Char.attackCooldown}ms</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-tight">
                  {p1Char.description}
                </p>
              </div>
            </div>

            {/* Player 2 / Gret Selection */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" />
                    <span>{gameMode === 'ai' ? 'Gret AI Warrior' : 'Player 2 Warrior'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                      {p2Char.rarity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                      {p2Char.name}
                    </span>
                  </div>
                </div>

                {/* Class Filter Tabs for P2 */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2.5 text-[10px]">
                  {['all', 'vanguard', 'marksman', 'mage', 'assassin', 'special'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setP2ClassFilter(cls)}
                      className={`px-2 py-0.5 rounded-md font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                        p2ClassFilter === cls
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* P2 Roster Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 max-h-[290px] overflow-y-auto pr-1">
                  {CHARACTERS.filter(
                    (c) => p2ClassFilter === 'all' || c.class === p2ClassFilter
                  ).map((char) => {
                    const isUnlocked = unlockedCharIds.includes(char.id);
                    const isSelected = p2Char.id === char.id;
                    return (
                      <button
                        key={char.id}
                        disabled={!isUnlocked}
                        onClick={() => {
                          setP2Char(char);
                          soundManager.playMove();
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'border-red-500 bg-white dark:bg-neutral-800 shadow-xs ring-2 ring-red-500/20'
                            : isUnlocked
                            ? 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 bg-white/70 dark:bg-neutral-800/70'
                            : 'border-dashed border-neutral-300 dark:border-neutral-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ backgroundColor: isUnlocked ? char.color : '#64748b' }}
                          >
                            {char.name[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold block truncate">{char.name}</span>
                            <span className="text-[9px] text-neutral-500 block truncate capitalize">
                              {isUnlocked ? char.class : 'Locked'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-neutral-500">
                          <span>HP {char.maxHp}</span>
                          <span>ATK {char.attackDamage}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Warrior Live Stats Display */}
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/60 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {p2Char.title} • {p2Char.weapon}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    {p2Char.canFly && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                        🕊️ Fly
                      </span>
                    )}
                    {p2Char.canTeleport && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ⚡ Teleport
                      </span>
                    )}
                    {p2Char.pullsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        🪝 Pull
                      </span>
                    )}
                    {p2Char.isMelee && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                        🥊 Melee
                      </span>
                    )}
                    {p2Char.tripleJump && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                        ⚡ Triple Jump
                      </span>
                    )}
                    {p2Char.doubleJump && !p2Char.tripleJump && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                        ✨ Double Jump
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-neutral-600 dark:text-neutral-400">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">HEALTH</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p2Char.maxHp}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">SPEED</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p2Char.speed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">DAMAGE</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p2Char.attackDamage}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500">COOLDOWN</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{p2Char.attackCooldown}ms</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-tight">
                  {p2Char.description}
                </p>
              </div>
            </div>
          </div>

          {/* Match Settings Row (Map & Difficulty) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Arena Map */}
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider block mb-1.5">
                Arena Map
              </label>
              <select
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value as MapType)}
                className="w-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="classic">Classic Battle Arena</option>
                <option value="sky_islands">Sky Floating Islands</option>
                <option value="cyber_rooftop">Neon Cyber Rooftops</option>
                <option value="magma_core">Magma Core Caverns</option>
                <option value="deep_ocean">Deep Abyss Ocean</option>
                <option value="chrono_sanctum">Chrono Spire Sanctum</option>
                <option value="haunted_graveyard">Haunted Crypt Graveyard</option>
                <option value="frozen_summit">Frozen Summit Peaks</option>
              </select>
            </div>

            {/* AI Difficulty */}
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider block mb-1.5">
                Gret AI Difficulty
              </label>
              <select
                value={aiDifficulty}
                disabled={gameMode === '2player'}
                onChange={(e) => setAiDifficulty(e.target.value as AIDifficulty)}
                className="w-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 disabled:opacity-50"
              >
                <option value="easy">Casual Gret (Easy)</option>
                <option value="normal">Tactical Gret (Normal)</option>
                <option value="hard">Insane Boss Gret (Hard)</option>
              </select>
            </div>

            {/* Match Length */}
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider block mb-1.5">
                Rounds to Win
              </label>
              <select
                value={roundTarget}
                onChange={(e) => setRoundTarget(parseInt(e.target.value, 10))}
                className="w-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5"
              >
                <option value={1}>Sudden Death (1 Round)</option>
                <option value={3}>Best of 5 (First to 3)</option>
                <option value={5}>Championship (First to 5)</option>
              </select>
            </div>
          </div>

          {/* Launch Match Button */}
          <button
            onClick={() => initRound(true)}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START 2 PLAYER BATTLE</span>
          </button>
        </div>
      )}
    </div>
  );
};
