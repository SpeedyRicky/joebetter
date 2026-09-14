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

export type GameMode = 'ai' | '2player' | 'boss_solo' | 'boss_coop';
export type AIDifficulty = 'easy' | 'normal' | 'hard';
export type MapType =
  | 'classic'
  | 'sky_islands'
  | 'cyber_rooftop'
  | 'magma_cavern'
  | 'ancient_colosseum'
  | 'quantum_void'
  | 'toxic_factory'
  | 'frozen_summit'
  | 'haunted_crypt'
  | 'neon_downtown'
  | 'desert_ruins'
  | 'boss_citadel'
  | 'boss_titan_citadel'
  | 'boss_reaper_crypt'
  | 'boss_dragon_fortress';
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
  | 'chrono_rift'
  | 'radiant_shockwave'
  | 'glacial_spike'
  | 'mirror_slash'
  | 'time_paradox'
  | 'frost_freeze'
  | 'web_trap'
  | 'stasis_sphere';

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
  canBlock?: boolean; // Holds a tower shield that completely blocks frontal projectile attacks
  reversesAttacks?: boolean; // Reflects/reverses hostile projectiles with amplified speed and bonus damage
  freezesEnemy?: boolean; // Encases target in glacial ice, stopping all movement and jumping
  rootsEnemy?: boolean; // Traps target feet with adhesive webs, locking horizontal movement
  timeStopsEnemy?: boolean; // Traps target in a quantum stasis sphere, stopping movement in mid-air
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
  {
    id: 'solar_phoenix',
    name: 'Solar Phoenix',
    title: 'Blazing Sun Sovereign',
    rarity: 'mythic',
    class: 'special',
    color: '#ea580c',
    secondaryColor: '#fef08a',
    weapon: 'Blazing Solar Wings & Talons',
    projectileType: 'dragon_breath',
    maxHp: 145,
    speed: 6.0,
    jumpForce: 16.5,
    attackCooldown: 280,
    attackDamage: 38,
    projectileSpeed: 9,
    canFly: true,
    isMelee: true,
    attackStyle: 'melee',
    doubleJump: true,
    tripleJump: true,
    unlockedByDefault: false,
    cost: 450,
    description: 'Mythical fiery bird holding jump to soar across the arena and dive down with blazing claw shockwaves!',
  },
  {
    id: 'shadow_warper',
    name: 'Void Shinobi',
    title: 'Shadow Warp Stalker',
    rarity: 'epic',
    class: 'assassin',
    color: '#4c1d95',
    secondaryColor: '#a855f7',
    weapon: 'Twin Shadow Blink Kunai',
    projectileType: 'teleport_strike',
    maxHp: 105,
    speed: 6.3,
    jumpForce: 15.8,
    attackCooldown: 300,
    attackDamage: 33,
    projectileSpeed: 0,
    canTeleport: true,
    isMelee: true,
    attackStyle: 'teleport',
    doubleJump: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Stealth shinobi who blinks instantly behind the foe through a purple void rift to deliver a critical backstab!',
  },
  {
    id: 'kraken_hunter',
    name: 'Kraken Harpooner',
    title: 'Abyssal Deep Dredger',
    rarity: 'rare',
    class: 'vanguard',
    color: '#0e7490',
    secondaryColor: '#f59e0b',
    weapon: 'Heavy Bronze Anchor Chain',
    projectileType: 'harpoon',
    maxHp: 148,
    speed: 4.6,
    jumpForce: 13.6,
    attackCooldown: 350,
    attackDamage: 27,
    projectileSpeed: 14,
    pullsEnemy: true,
    attackStyle: 'pull',
    doubleJump: false,
    unlockedByDefault: true,
    cost: 0,
    description: 'Heavy armored deep-sea diver firing a spiked anchor cable that snags and yanks opponents into point-blank range!',
  },
  {
    id: 'thunder_monk',
    name: 'Thunder Pugilist',
    title: 'Lightning Fist Master',
    rarity: 'epic',
    class: 'vanguard',
    color: '#ca8a04',
    secondaryColor: '#38bdf8',
    weapon: 'Thunder Gauntlet Cleave',
    projectileType: 'melee_slam',
    maxHp: 138,
    speed: 5.5,
    jumpForce: 15.0,
    attackCooldown: 290,
    attackDamage: 36,
    projectileSpeed: 7,
    isMelee: true,
    attackStyle: 'melee',
    doubleJump: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Close-quarters martial brawler lunging forward with explosive electric shockwave punches that shake the entire screen!',
  },
  {
    id: 'graviton_mage',
    name: 'Graviton Sorcerer',
    title: 'Singularity Weaver',
    rarity: 'legendary',
    class: 'mage',
    color: '#312e81',
    secondaryColor: '#818cf8',
    weapon: 'Black Hole Gravity Tether',
    projectileType: 'tether_wire',
    maxHp: 112,
    speed: 5.3,
    jumpForce: 15.5,
    attackCooldown: 330,
    attackDamage: 29,
    projectileSpeed: 15,
    canFly: true,
    pullsEnemy: true,
    attackStyle: 'pull',
    doubleJump: true,
    tripleJump: true,
    unlockedByDefault: false,
    cost: 380,
    description: 'Celestial sorcerer who levitates gracefully in the air while casting gravitational vortex waves that yank targets upward!',
  },
  {
    id: 'chrono_blade',
    name: 'Chrono Duelist',
    title: 'Temporal Flash Blade',
    rarity: 'legendary',
    class: 'assassin',
    color: '#0f766e',
    secondaryColor: '#5eead4',
    weapon: 'Temporal Blink Rapier',
    projectileType: 'chrono_rift',
    maxHp: 115,
    speed: 6.1,
    jumpForce: 16.0,
    attackCooldown: 290,
    attackDamage: 34,
    projectileSpeed: 0,
    canTeleport: true,
    isMelee: true,
    attackStyle: 'teleport',
    doubleJump: true,
    unlockedByDefault: false,
    cost: 410,
    description: 'Master fencer who blinks through the timeline behind adversaries to deliver an unavoidable temporal rapier strike!',
  },
  {
    id: 'aegis_paladin',
    name: 'Aegis Paladin',
    title: 'Sacred Shield Templar',
    rarity: 'epic',
    class: 'vanguard',
    color: '#ca8a04', // golden armor
    secondaryColor: '#fde047',
    weapon: 'Tower Shield & Holy Bash',
    projectileType: 'radiant_shockwave',
    maxHp: 155,
    speed: 4.8,
    jumpForce: 13.8,
    attackCooldown: 330,
    attackDamage: 28,
    projectileSpeed: 12,
    doubleJump: false,
    canBlock: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Holy templar holding the Sacred Light Barrier. Blocks frontal projectile attacks (4s cooldown) and counters with radiant crescent shockwaves!',
  },
  {
    id: 'glacial_titan',
    name: 'Glacial Titan',
    title: 'Cryo Greatshield Colossus',
    rarity: 'legendary',
    class: 'vanguard',
    color: '#0284c7', // frost cyan
    secondaryColor: '#38bdf8',
    weapon: 'Glacial Greatshield & Ice Boulder',
    projectileType: 'glacial_spike',
    maxHp: 168,
    speed: 4.3,
    jumpForce: 13.2,
    attackCooldown: 390,
    attackDamage: 38,
    projectileSpeed: 11,
    doubleJump: false,
    canBlock: true,
    freezesEnemy: true,
    unlockedByDefault: false,
    cost: 320,
    description: 'Ancient frozen behemoth whose impenetrable ice wall shield absorbs incoming attacks (4s cooldown) while hurling glacial spikes that freeze foes in ice (3s cooldown, breaks after 4 hits, CC targets take 1/4 damage)!',
  },
  {
    id: 'mirage_blademaster',
    name: 'Mirage Blademaster',
    title: 'Celestial Mirror Blade',
    rarity: 'legendary',
    class: 'assassin',
    color: '#0891b2', // mirror cyan
    secondaryColor: '#67e8f9',
    weapon: 'Prismatic Mirror Katana',
    projectileType: 'mirror_slash',
    maxHp: 110,
    speed: 6.2,
    jumpForce: 15.6,
    attackCooldown: 290,
    attackDamage: 32,
    projectileSpeed: 14,
    doubleJump: true,
    reversesAttacks: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Master swordsman wielding the Prismatic Mirror Katana. Reverses incoming enemy projectiles right back at the attacker (4s cooldown) with amplified velocity and +30% bonus damage!',
  },
  {
    id: 'chrono_reflector',
    name: 'Chrono Reflector',
    title: 'Temporal Paradox Mage',
    rarity: 'epic',
    class: 'mage',
    color: '#7c3aed', // deep violet
    secondaryColor: '#c084fc',
    weapon: 'Paradox Time Spindle',
    projectileType: 'time_paradox',
    maxHp: 105,
    speed: 5.4,
    jumpForce: 14.8,
    attackCooldown: 320,
    attackDamage: 30,
    projectileSpeed: 13,
    doubleJump: true,
    reversesAttacks: true,
    unlockedByDefault: false,
    cost: 340,
    description: 'Mystic chronomancer that bends causality, reversing hostile projectiles back toward their source (4s cooldown) through temporal distortion rings!',
  },
  {
    id: 'blizzard_archon',
    name: 'Blizzard Archon',
    title: 'Absolute Zero Sovereign',
    rarity: 'epic',
    class: 'mage',
    color: '#0369a1',
    secondaryColor: '#bae6fd',
    weapon: 'Absolute Zero Frost Orbs',
    projectileType: 'frost_freeze',
    maxHp: 102,
    speed: 5.0,
    jumpForce: 14.5,
    attackCooldown: 340,
    attackDamage: 26,
    projectileSpeed: 12,
    doubleJump: true,
    freezesEnemy: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Northern elemental ruler firing absolute zero frost spheres that encase adversaries in solid ice (3s cooldown, breaks after 4 hits, CC targets take 1/4 damage)!',
  },
  {
    id: 'web_stalker',
    name: 'Web Stalker',
    title: 'Arachnid Net Trapper',
    rarity: 'rare',
    class: 'assassin',
    color: '#3f6212', // arachnid green
    secondaryColor: '#a3e635',
    weapon: 'Adhesive Silk Web Net',
    projectileType: 'web_trap',
    maxHp: 112,
    speed: 5.9,
    jumpForce: 15.2,
    attackCooldown: 300,
    attackDamage: 24,
    projectileSpeed: 13.5,
    doubleJump: true,
    rootsEnemy: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Arachnid skirmisher firing adhesive web nets that glue opponents to the arena floor (3s cooldown, breaks after 4 hits, CC targets take 1/4 damage)!',
  },
  {
    id: 'stasis_warden',
    name: 'Stasis Warden',
    title: 'Quantum Time-Lock Warden',
    rarity: 'mythic',
    class: 'special',
    color: '#b45309', // cosmic amber
    secondaryColor: '#fde047',
    weapon: 'Quantum Stasis Chronosphere',
    projectileType: 'stasis_sphere',
    maxHp: 135,
    speed: 5.8,
    jumpForce: 16.0,
    attackCooldown: 330,
    attackDamage: 32,
    projectileSpeed: 13,
    doubleJump: true,
    tripleJump: true,
    canFly: true,
    timeStopsEnemy: true,
    unlockedByDefault: false,
    cost: 440,
    description: 'Cosmic temporal regulator who hovers in celestial flight and fires quantum stasis spheres that lock opponents in mid-air time suspension (3s cooldown, breaks after 4 hits, CC targets take 1/4 damage)!',
  },
  {
    id: 'void_assassin',
    name: 'Void Shinobi',
    title: 'Shadow Rift Ninja',
    rarity: 'mythic',
    class: 'assassin',
    color: '#3b0764',
    secondaryColor: '#c084fc',
    weapon: 'Nether Void Daggers',
    projectileType: 'teleport_strike',
    maxHp: 110,
    speed: 6.4,
    jumpForce: 16.0,
    attackCooldown: 280,
    attackDamage: 35,
    projectileSpeed: 0,
    canTeleport: true,
    isMelee: true,
    attackStyle: 'teleport',
    doubleJump: true,
    tripleJump: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Mythic void ninja who executes a 4s cooldown teleport blink backstab or unleashes fast nether blade melee flurries!',
  },
  {
    id: 'thunder_valkyrie',
    name: 'Thunder Valkyrie',
    title: 'Asgardian Stormbringer',
    rarity: 'legendary',
    class: 'vanguard',
    color: '#1e3a8a',
    secondaryColor: '#60a5fa',
    weapon: 'Storm Mjolnir Hammer',
    projectileType: 'lightning',
    maxHp: 150,
    speed: 5.6,
    jumpForce: 15.2,
    attackCooldown: 310,
    attackDamage: 32,
    projectileSpeed: 14,
    canFly: true,
    doubleJump: true,
    canBlock: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Legendary winged storm warrior who flies across the sky, blocks attacks with electric aegis, and hurls charged lightning bolts!',
  },
  {
    id: 'monkey_king',
    name: 'Sun Wukong',
    title: 'Monkey King / Great Sage',
    rarity: 'mythic',
    class: 'special',
    color: '#b45309',
    secondaryColor: '#facc15',
    weapon: 'Golden Ruyi Jingu Bang',
    projectileType: 'melee_slam',
    maxHp: 140,
    speed: 6.2,
    jumpForce: 16.5,
    attackCooldown: 270,
    attackDamage: 36,
    projectileSpeed: 8,
    isMelee: true,
    attackStyle: 'melee',
    doubleJump: true,
    tripleJump: true,
    canFly: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Mythic Monkey King who rides the golden Nimbus cloud with triple jumps and crushes foes with his size-shifting Golden Staff!',
  },
  {
    id: 'neon_samurai',
    name: 'Neon Samurai',
    title: 'Cyber Katana Ronin',
    rarity: 'epic',
    class: 'assassin',
    color: '#064e3b',
    secondaryColor: '#10b981',
    weapon: 'Plasma Edge Katana',
    projectileType: 'wind_slash',
    maxHp: 120,
    speed: 6.0,
    jumpForce: 15.5,
    attackCooldown: 290,
    attackDamage: 31,
    projectileSpeed: 15,
    doubleJump: true,
    reversesAttacks: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Futuristic ronin who unleashes razor-sharp neon wind slashes and deflects hostile projectiles with high-frequency blade parries!',
  },
  {
    id: 'phoenix_mage',
    name: 'Phoenix Pyromancer',
    title: 'Immortal Flame Empress',
    rarity: 'legendary',
    class: 'mage',
    color: '#991b1b',
    secondaryColor: '#fb923c',
    weapon: 'Solar Phoenix Orbs',
    projectileType: 'star_nova',
    maxHp: 115,
    speed: 5.5,
    jumpForce: 15.0,
    attackCooldown: 300,
    attackDamage: 34,
    projectileSpeed: 13,
    canFly: true,
    doubleJump: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Immortal sorceress with blazing fiery wings, levitating above battlefields and firing explosive solar phoenix novas!',
  },
  {
    id: 'shadow_blade',
    name: 'Shadow Duelist',
    title: 'Phantom Blade Assassin',
    rarity: 'rare',
    class: 'assassin',
    color: '#18181b',
    secondaryColor: '#a855f7',
    weapon: 'Dual Nether Daggers',
    projectileType: 'slash',
    maxHp: 118,
    speed: 6.1,
    jumpForce: 15.4,
    attackCooldown: 260,
    attackDamage: 28,
    projectileSpeed: 12,
    doubleJump: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Agile shadow skirmisher who chains rapid-fire nether slashes with unmatched agility and double jumps!',
  },
];

export const BOSSES: Character[] = [
  {
    id: 'boss_titan',
    name: 'Titan Colossus',
    title: 'Golem Overlord (Boss)',
    rarity: 'mythic',
    class: 'vanguard',
    color: '#b91c1c',
    secondaryColor: '#ef4444',
    weapon: 'Seismic Hammer',
    projectileType: 'melee_slam',
    maxHp: 500,
    speed: 3.8,
    jumpForce: 13,
    attackCooldown: 550,
    attackDamage: 24,
    projectileSpeed: 9,
    isMelee: true,
    canBlock: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Boss 1: Colossal stone golem with 500 HP, massive size, heavy ground shockwaves, and impenetrable shield armor.',
  },
  {
    id: 'boss_reaper',
    name: 'Shadow Reaper',
    title: 'Void Phantom (Boss)',
    rarity: 'mythic',
    class: 'assassin',
    color: '#581c87',
    secondaryColor: '#9333ea',
    weapon: 'Nether Scythe',
    projectileType: 'scythe',
    maxHp: 450,
    speed: 5.5,
    jumpForce: 16.5,
    attackCooldown: 480,
    attackDamage: 20,
    projectileSpeed: 15,
    canTeleport: true,
    timeStopsEnemy: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Boss 2: Void phantom shadow with 450 HP, gigantic stature, instant teleport strikes, and time-stasis chronospheres.',
  },
  {
    id: 'boss_dragon',
    name: 'Cyber Dragon Mech',
    title: 'Apex Destroyer (Boss)',
    rarity: 'mythic',
    class: 'special',
    color: '#ea580c',
    secondaryColor: '#f97316',
    weapon: 'Plasma Dragon Breath',
    projectileType: 'dragon_breath',
    maxHp: 550,
    speed: 5.0,
    jumpForce: 16.5,
    attackCooldown: 520,
    attackDamage: 22,
    projectileSpeed: 16,
    canFly: true,
    unlockedByDefault: true,
    cost: 0,
    description: 'Boss 3: Apex mechanical dragon with 550 HP, massive scale, continuous flight hovering, and devastating plasma magma breath.',
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
  owner: number;
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
  freezesEnemy?: boolean;
  rootsEnemy?: boolean;
  timeStopsEnemy?: boolean;
  isReflected?: boolean;
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
  damage: number | string;
  life: number;
  color: string;
}

interface PlayerState {
  id: number;
  name?: string;
  isAi?: boolean;
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
  freezeTimer: number;
  rootTimer: number;
  timeStopTimer: number;
  shieldPulseTimer?: number;
  shieldCooldownTimer: number;
  reflectPulseTimer?: number;
  reflectCooldownTimer: number;
  freezeCooldownTimer: number;
  lastTeleportTime: number;
  ccHitCount: number;
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
  } else if (map === 'frozen_summit') {
    // Polar twilight gradient
    const iceGrad = ctx.createLinearGradient(0, 0, 0, H);
    iceGrad.addColorStop(0, '#021e2f');
    iceGrad.addColorStop(0.5, '#075985');
    iceGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, W, H);

    // Shimmering Aurora Borealis ribbons
    const auroraAlpha = (Math.sin(now * 0.002) + 1) * 0.15 + 0.15;
    ctx.save();
    ctx.fillStyle = `rgba(52, 211, 153, ${auroraAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    for (let x = 0; x <= W; x += 40) {
      const ay = 50 + Math.sin(x * 0.01 + now * 0.0015) * 25 + Math.cos(x * 0.02 + now * 0.001) * 15;
      ctx.lineTo(x, ay);
    }
    ctx.lineTo(W, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Secondary cyan aurora wave
    ctx.fillStyle = `rgba(56, 189, 248, ${auroraAlpha * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    for (let x = 0; x <= W; x += 40) {
      const ay = 85 + Math.cos(x * 0.012 + now * 0.0018) * 20;
      ctx.lineTo(x, ay);
    }
    ctx.lineTo(W, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Distant mountain glacier silhouettes
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.moveTo(0, H - 40);
    ctx.lineTo(120, H - 180);
    ctx.lineTo(240, H - 80);
    ctx.lineTo(400, H - 220);
    ctx.lineTo(580, H - 90);
    ctx.lineTo(720, H - 190);
    ctx.lineTo(W, H - 60);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Falling snowflakes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 35; i++) {
      const sx = (i * 73 + now * 0.04) % W;
      const sy = (i * 43 + now * 0.08) % H;
      ctx.beginPath();
      ctx.arc(sx, sy, i % 3 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'haunted_crypt') {
    // Spooky Gothic Midnight Sky
    const cryptGrad = ctx.createLinearGradient(0, 0, 0, H);
    cryptGrad.addColorStop(0, '#090514');
    cryptGrad.addColorStop(0.5, '#2e1065');
    cryptGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = cryptGrad;
    ctx.fillRect(0, 0, W, H);

    // Glowing Full Moon
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    ctx.beginPath();
    ctx.arc(W * 0.78, 90, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(W * 0.78, 90, 40, 0, Math.PI * 2);
    ctx.fill();
    // Moon craters
    ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.beginPath();
    ctx.arc(W * 0.78 - 8, 85, 9, 0, Math.PI * 2);
    ctx.arc(W * 0.78 + 12, 98, 12, 0, Math.PI * 2);
    ctx.arc(W * 0.78 + 6, 76, 7, 0, Math.PI * 2);
    ctx.fill();

    // Spooky dead tree silhouettes
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 4;
    [90, W - 140].forEach((tx) => {
      ctx.beginPath();
      ctx.moveTo(tx, H - 30);
      ctx.lineTo(tx, H - 140);
      ctx.lineTo(tx - 30, H - 180);
      ctx.moveTo(tx, H - 100);
      ctx.lineTo(tx + 25, H - 150);
      ctx.stroke();
    });

    // Floating spectral wisps
    for (let i = 0; i < 14; i++) {
      const wx = (i * 91 + Math.sin(now * 0.002 + i) * 20) % W;
      const wy = H - 50 - ((i * 37 + now * 0.03) % 150);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(52, 211, 153, 0.4)';
      ctx.beginPath();
      ctx.arc(wx, wy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'neon_downtown') {
    // Cyberpunk Downtown Night
    const dtGrad = ctx.createLinearGradient(0, 0, 0, H);
    dtGrad.addColorStop(0, '#030712');
    dtGrad.addColorStop(0.6, '#111827');
    dtGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = dtGrad;
    ctx.fillRect(0, 0, W, H);

    // Neon billboards
    ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
    ctx.fillRect(80, 50, 160, 45);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 50, 160, 45);
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ GRET ARCADE ⚡', 160, 77);

    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fillRect(W - 240, 70, 170, 45);
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(W - 240, 70, 170, 45);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText('★ 2P BATTLE ZONE ★', W - 155, 97);

    // Downpour rain streaks
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 45; i++) {
      const rx = (i * 47 + now * 0.12) % W;
      const ry = (i * 29 + now * 0.4) % H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 16);
      ctx.stroke();
    }
  } else if (map === 'desert_ruins') {
    // Sunset Sandstorm Gradient
    const desGrad = ctx.createLinearGradient(0, 0, 0, H);
    desGrad.addColorStop(0, '#451a03');
    desGrad.addColorStop(0.4, '#9a3412');
    desGrad.addColorStop(0.8, '#d97706');
    desGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = desGrad;
    ctx.fillRect(0, 0, W, H);

    // Blazing setting sun
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.beginPath();
    ctx.arc(W / 2, H - 90, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(W / 2, H - 90, 48, 0, Math.PI * 2);
    ctx.fill();

    // Silhouette of Great Pyramids
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(90, H - 35);
    ctx.lineTo(240, H - 180);
    ctx.lineTo(390, H - 35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(350, H - 35);
    ctx.lineTo(520, H - 220);
    ctx.lineTo(690, H - 35);
    ctx.closePath();
    ctx.fill();

    // Drifting desert sand dust
    ctx.fillStyle = 'rgba(254, 243, 199, 0.5)';
    for (let i = 0; i < 25; i++) {
      const dx = (i * 67 + now * 0.07) % W;
      const dy = H - 40 - ((i * 31 + now * 0.02) % 110);
      ctx.beginPath();
      ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'boss_titan_citadel' || map === 'boss_citadel') {
    // 🌋 TITAN COLOSSUS: Volcanic Magma Citadel
    const citadelGrad = ctx.createLinearGradient(0, 0, 0, H);
    citadelGrad.addColorStop(0, '#0c0202');
    citadelGrad.addColorStop(0.4, '#2d0606');
    citadelGrad.addColorStop(0.8, '#450a0a');
    citadelGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = citadelGrad;
    ctx.fillRect(0, 0, W, H);

    // Towering fortress battlements in background
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(0, H - 120);
    ctx.lineTo(80, H - 240);
    ctx.lineTo(140, H - 210);
    ctx.lineTo(240, H - 290);
    ctx.lineTo(W / 2, H - 200);
    ctx.lineTo(W - 240, H - 290);
    ctx.lineTo(W - 140, H - 210);
    ctx.lineTo(W - 80, H - 240);
    ctx.lineTo(W, H - 120);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Cascading molten lava falls
    [160, W - 160].forEach((lx) => {
      const lavaGrad = ctx.createLinearGradient(lx, 80, lx, H);
      lavaGrad.addColorStop(0, '#f97316');
      lavaGrad.addColorStop(0.5, '#ef4444');
      lavaGrad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(lx - 10, 100, 20, H - 140);

      // Lava flow highlights
      ctx.fillStyle = '#fef08a';
      const streamY = (now * 0.15) % (H - 140);
      ctx.fillRect(lx - 4, 100 + streamY, 8, 25);
    });

    // Glowing obsidian runic monoliths
    [60, 260, W - 260, W - 60].forEach((px, idx) => {
      ctx.fillStyle = '#292524';
      ctx.fillRect(px - 18, 60, 36, H - 60);
      // Molten runic fissure
      ctx.fillStyle = idx % 2 === 0 ? '#ef4444' : '#f97316';
      ctx.fillRect(px - 4, 80, 8, H - 120);
      // Runic crossbeams
      for (let r = 100; r < H - 100; r += 45) {
        ctx.fillRect(px - 12, r, 24, 4);
      }
    });

    // Floating volcanic magma embers
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 28; i++) {
      const ex = (i * 43 + now * 0.09) % W;
      const ey = H - ((i * 31 + now * 0.12) % (H - 40));
      ctx.beginPath();
      ctx.arc(ex, ey, i % 3 === 0 ? 3 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'boss_reaper_crypt') {
    // 🌌 SHADOW REAPER: Nether Void Crypt
    const voidGrad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
    voidGrad.addColorStop(0, '#3b0764');
    voidGrad.addColorStop(0.5, '#1e1035');
    voidGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, W, H);

    // Swirling cosmic galaxy rift in center
    ctx.save();
    ctx.translate(W / 2, H / 2 - 30);
    ctx.rotate(now * 0.001);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 3;
    for (let ring = 30; ring <= 150; ring += 35) {
      ctx.beginPath();
      ctx.ellipse(0, 0, ring, ring * 0.55, ring * 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Floating necrotic tomb obelisks
    [80, 240, W - 240, W - 80].forEach((ox, i) => {
      const obeliskFloat = Math.sin(now * 0.003 + i) * 6;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(ox - 14, 50 + obeliskFloat, 28, H - 120);
      // Neon violet soul runes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(ox - 3, 70 + obeliskFloat, 6, H - 160);
      ctx.beginPath();
      ctx.arc(ox, 40 + obeliskFloat, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Drifting phantom wisps and soul particles
    ctx.fillStyle = 'rgba(216, 180, 254, 0.7)';
    for (let i = 0; i < 24; i++) {
      const wx = (i * 59 + Math.sin(now * 0.004 + i) * 30 + now * 0.03) % W;
      const wy = H - ((i * 37 + now * 0.08) % (H - 30));
      ctx.beginPath();
      ctx.arc(wx, wy, i % 2 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (map === 'boss_dragon_fortress') {
    // ⚡ CYBER DRAGON MECH: Sky Cyber Fortress
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(0.5, '#0f172a');
    skyGrad.addColorStop(0.85, '#1e293b');
    skyGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Futuristic sky city skyscrapers and neon clouds
    ctx.fillStyle = '#090d16';
    for (let b = 0; b < 10; b++) {
      const bx = b * 88 - 20;
      const bh = 140 + ((b * 47) % 120);
      ctx.fillRect(bx, H - bh, 70, bh);
      // Window matrix lights
      ctx.fillStyle = b % 2 === 0 ? '#38bdf8' : '#f97316';
      for (let wy = H - bh + 15; wy < H - 20; wy += 22) {
        ctx.fillRect(bx + 12, wy, 8, 6);
        ctx.fillRect(bx + 35, wy, 8, 6);
      }
      ctx.fillStyle = '#090d16';
    }

    // High-altitude rotating plasma turbine engines in sky
    [130, W - 130].forEach((tx) => {
      ctx.save();
      ctx.translate(tx, 70);
      ctx.rotate(now * 0.005);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * 30, Math.sin(ang) * 30);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Lightning discharge flashes in cyber clouds
    if (Math.sin(now * 0.015) > 0.88) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 80, 20);
      ctx.lineTo(W / 2 - 40, 70);
      ctx.lineTo(W / 2 - 10, 50);
      ctx.lineTo(W / 2 + 60, 110);
      ctx.stroke();
    }
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

// Render unique character visuals and distinct Player indicators
const PLAYER_THEMES = [
  { color: '#3b82f6', cape: '#2563eb', bg: 'rgba(59, 130, 246, 0.25)', label: 'P1 🛡️', aiLabel: 'P1 🤖' },
  { color: '#ef4444', cape: '#dc2626', bg: 'rgba(239, 68, 68, 0.25)', label: 'P2 ⚔️', aiLabel: 'GRET ⚡' },
  { color: '#10b981', cape: '#059669', bg: 'rgba(16, 185, 129, 0.25)', label: 'P3 🏹', aiLabel: 'NOVA 🤖' },
  { color: '#a855f7', cape: '#9333ea', bg: 'rgba(168, 85, 247, 0.25)', label: 'P4 💥', aiLabel: 'TITAN 🤖' },
];

const renderBossSprite = (
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  now: number,
  dir: number
) => {
  const cid = p.character.id;
  const W = p.width; // 56
  const H = p.height; // 80

  ctx.save();
  ctx.translate(p.x, p.y);

  if (cid === 'boss_titan') {
    // === TITAN COLOSSUS (Golem Overlord) ===
    // 1. Molten Ground Pedestal Aura
    const pulse = Math.sin(now * 0.007) * 4;
    ctx.beginPath();
    ctx.ellipse(W / 2, H + 2, 28 + pulse, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Heavy Obsidian Armor Legs
    ctx.fillStyle = p.isHit ? '#ffffff' : '#1c1917';
    ctx.fillRect(8, 48, 16, 32);
    ctx.fillRect(W - 24, 48, 16, 32);
    // Glowing lava magma streaks on legs
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(14, 52, 4, 22);
    ctx.fillRect(W - 18, 52, 4, 22);

    // 3. Massive Torso & Chestplate
    ctx.fillStyle = p.isHit ? '#ffffff' : '#292524';
    ctx.beginPath();
    ctx.roundRect(4, 18, W - 8, 34, 6);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heavy shoulder pauldrons
    ctx.fillStyle = p.isHit ? '#ffffff' : '#1c1917';
    ctx.beginPath();
    ctx.roundRect(0, 14, 16, 16, 4);
    ctx.roundRect(W - 16, 14, 16, 16, 4);
    ctx.fill();

    // Magma Core in Chest (Pulsing glowing orb)
    ctx.save();
    const grad = ctx.createRadialGradient(W / 2, 34, 2, W / 2, 34, 12);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f97316');
    grad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(W / 2, 34, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Horned Colossus Helm & Head
    ctx.fillStyle = p.isHit ? '#ffffff' : '#1c1917';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 14, 2, 28, 18, 5);
    ctx.fill();

    // Jagged Golem Horns
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 14, 8);
    ctx.lineTo(W / 2 - 22, -4);
    ctx.lineTo(W / 2 - 8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W / 2 + 14, 8);
    ctx.lineTo(W / 2 + 22, -4);
    ctx.lineTo(W / 2 + 8, 4);
    ctx.closePath();
    ctx.fill();

    // Glowing Molten Eyes / Visor
    ctx.fillStyle = '#fbbf24';
    const eyeX = dir === 1 ? W / 2 + 2 : W / 2 - 10;
    ctx.fillRect(eyeX, 8, 8, 3.5);

    // 5. Giant Seismic Warhammer
    ctx.save();
    ctx.translate(W / 2 + dir * 18, 36);
    ctx.rotate(dir * (Math.sin(now * 0.004) * 0.15 + 0.2));
    // Shaft
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-3, -28, 6, 50);
    // Hammer head
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-14, -36, 28, 16);
    // Glowing rune on hammer
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-8, -32, 16, 8);
    ctx.restore();

  } else if (cid === 'boss_reaper') {
    // === SHADOW REAPER (Void Phantom) ===
    // 1. Cosmic Void Distortion Aura
    ctx.save();
    const voidRot = now * 0.002;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(voidRot);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Drifting Spectral Shadow Tendrils
    ctx.fillStyle = 'rgba(30, 10, 60, 0.85)';
    [-12, -4, 4, 12].forEach((offset, idx) => {
      const tentacleWave = Math.sin(now * 0.008 + idx) * 8;
      ctx.beginPath();
      ctx.moveTo(W / 2 + offset, 44);
      ctx.quadraticCurveTo(W / 2 + offset - dir * 10, 65, W / 2 + offset + tentacleWave - dir * 14, H + 8);
      ctx.lineTo(W / 2 + offset + 6, 44);
      ctx.closePath();
      ctx.fill();
    });

    // 3. Ethereal Flowing Nether Cloak
    const cloakFlutter = Math.sin(now * 0.01) * 6;
    ctx.fillStyle = p.isHit ? '#ffffff' : '#3b0764';
    ctx.beginPath();
    ctx.moveTo(W / 2, 12);
    ctx.lineTo(W / 2 - dir * 24, 48 + cloakFlutter);
    ctx.lineTo(W / 2 - dir * 16, 76 + cloakFlutter);
    ctx.lineTo(W / 2 + dir * 18, 54);
    ctx.closePath();
    ctx.fill();

    // Cloak Torso
    ctx.fillStyle = p.isHit ? '#ffffff' : '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(10, 20, W - 20, 38, 8);
    ctx.fill();

    // 4. Void Hood & Piercing Phantom Eyes
    ctx.fillStyle = p.isHit ? '#ffffff' : '#090514';
    ctx.beginPath();
    ctx.arc(W / 2, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Violet Spectral Eye Slits
    ctx.fillStyle = '#c084fc';
    const rEyeX = dir === 1 ? W / 2 + 2 : W / 2 - 8;
    ctx.beginPath();
    ctx.ellipse(rEyeX, 15, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating Necrotic Occult Crown
    ctx.save();
    ctx.translate(W / 2, 2);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = voidRot * 2 + (i * Math.PI) / 2;
      const rx = Math.cos(angle) * 16;
      const ry = Math.sin(angle) * 6;
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(rx - 2, ry - 2, 4, 4);
    }
    ctx.restore();

    // 5. Massive Nether Scythe
    ctx.save();
    ctx.translate(W / 2 + dir * 16, 32);
    const scytheSwing = Math.sin(now * 0.005) * 0.2;
    ctx.rotate(dir * (0.3 + scytheSwing));
    // Staff / Pole
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(-2.5, -42, 5, 78);
    // Curved Crystalline Blade
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.quadraticCurveTo(dir * 36, -48, dir * 42, -18);
    ctx.lineTo(dir * 28, -24);
    ctx.quadraticCurveTo(dir * 18, -34, 0, -32);
    ctx.closePath();
    ctx.fillStyle = '#581c87';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

  } else if (cid === 'boss_dragon') {
    // === CYBER DRAGON MECH (Apex Destroyer) ===
    // 1. Dragon Mechanical Tail
    const tailSwing = Math.sin(now * 0.009) * 12;
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - dir * 12, 54);
    ctx.quadraticCurveTo(W / 2 - dir * 28, 64 + tailSwing, W / 2 - dir * 38, 50 + tailSwing);
    ctx.stroke();
    // Tail blade fin
    ctx.fillStyle = '#facc15';
    ctx.fillRect(W / 2 - dir * 42, 46 + tailSwing, 8, 8);

    // 2. Massive Articulated Cyber Dragon Wings
    const wingFlap = Math.sin(now * 0.012) * 16;
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(W / 2, 22);
      ctx.lineTo(W / 2 + side * (38 + wingFlap * 0.2), 2 + wingFlap * side);
      ctx.lineTo(W / 2 + side * 46, 24 + wingFlap * side * 0.5);
      ctx.lineTo(W / 2 + side * 22, 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Jet Thruster on wing tip
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(W / 2 + side * (38 + wingFlap * 0.2), 2 + wingFlap * side, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Cyber Armored Legs & Boosters
    ctx.fillStyle = p.isHit ? '#ffffff' : '#334155';
    ctx.fillRect(8, 50, 16, 30);
    ctx.fillRect(W - 24, 50, 16, 30);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(12, 68, 8, 12);
    ctx.fillRect(W - 20, 68, 8, 12);

    // 4. Main Titanium Dragon Body
    ctx.fillStyle = p.isHit ? '#ffffff' : '#0f172a';
    ctx.beginPath();
    ctx.roundRect(6, 18, W - 12, 36, 6);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shoulder Missile Pods
    ctx.fillStyle = p.isHit ? '#ffffff' : '#475569';
    ctx.fillRect(0, 14, 14, 12);
    ctx.fillRect(W - 14, 14, 14, 12);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, 16, 4, 4);
    ctx.fillRect(W - 6, 16, 4, 4);

    // Plasma Reactor Core
    const reactorGlow = 0.6 + Math.sin(now * 0.015) * 0.4;
    ctx.save();
    ctx.fillStyle = `rgba(249, 115, 22, ${reactorGlow})`;
    ctx.beginPath();
    ctx.arc(W / 2, 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(W / 2, 36, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Cyber Dragon Head & Laser Visor
    ctx.fillStyle = p.isHit ? '#ffffff' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 14, 4, 28, 18, 4);
    ctx.fill();

    // Dragon Horns
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 12, 6);
    ctx.lineTo(W / 2 - 22, -6);
    ctx.lineTo(W / 2 - 6, 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W / 2 + 12, 6);
    ctx.lineTo(W / 2 + 22, -6);
    ctx.lineTo(W / 2 + 6, 2);
    ctx.closePath();
    ctx.fill();

    // Glowing Dragon Optics & Mandible
    ctx.fillStyle = '#facc15';
    const dEyeX = dir === 1 ? W / 2 + 2 : W / 2 - 10;
    ctx.fillRect(dEyeX, 10, 8, 3.5);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(W / 2 + (dir === 1 ? 6 : -14), 16, 8, 4);
  }

  ctx.restore();
};

const renderCharacterSprite = (
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  playerNum: number,
  isAi: boolean,
  now: number
) => {
  const dir = p.facing === 'right' ? 1 : -1;
  const themeIndex = Math.max(0, Math.min(PLAYER_THEMES.length - 1, playerNum - 1));
  const theme = PLAYER_THEMES[themeIndex];

  if (p.character.id.startsWith('boss_')) {
    renderBossSprite(ctx, p, now, dir);

    // Active Shield Block Barrier Pulse for Boss
    if (p.shieldPulseTimer && p.shieldPulseTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2 + dir * 20, p.y + p.height / 2, 42, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);

  // 1. Player Pedestal Ring under feet
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(p.width / 2, p.height + 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = theme.bg;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.color;
  ctx.stroke();
  ctx.restore();

  // 2. Player Distinction Mantle / Cape / Scarf
  const capeFlutter = Math.sin(now * 0.01 + playerNum) * 3;
  ctx.fillStyle = theme.cape;
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
    ctx.fillStyle = playerNum === 1 ? '#3b82f6' : '#ef4444';
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
  } else if (cid === 'aegis_paladin') {
    // Sacred Holy Templar Helmet with cross crest
    ctx.fillStyle = '#fde047';
    ctx.fillRect(p.width / 2 - 2, -5, 4, 8); // golden crest
    ctx.fillRect(p.width / 2 - 5, -2, 10, 3);
    // Massive Holy Tower Shield in front (dimmed while on block cooldown)
    const shieldOnCooldown = p.shieldCooldownTimer > 0;
    ctx.save();
    if (shieldOnCooldown) {
      ctx.globalAlpha = 0.45;
    }
    ctx.fillStyle = '#eab308';
    ctx.fillRect(p.width / 2 + dir * 6, 8, dir * 7, 26);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(p.width / 2 + dir * 8, 12, dir * 3, 18);
    ctx.restore();
    // Radiant hammer in back hand
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(p.width / 2 - dir * 8, 14, -dir * 12, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(p.width / 2 - dir * 18, 10, -dir * 6, 11);
  } else if (cid === 'glacial_titan') {
    // Colossal Frost Golem Horns & Greatshield
    ctx.fillStyle = '#38bdf8';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(p.width / 2 + side * 6, 4);
      ctx.lineTo(p.width / 2 + side * 14, -8);
      ctx.lineTo(p.width / 2 + side * 9, 8);
      ctx.closePath();
      ctx.fill();
    });
    // Great Ice Shield (dimmed while on block cooldown)
    const shieldOnCooldown = p.shieldCooldownTimer > 0;
    ctx.save();
    if (shieldOnCooldown) {
      ctx.globalAlpha = 0.45;
    }
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillRect(p.width / 2 + dir * 6, 6, dir * 9, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.width / 2 + dir * 6, 6, dir * 9, 30);
    ctx.restore();
  } else if (cid === 'mirage_blademaster') {
    // Prismatic Mirror Katana & Headband
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(p.width / 2 - 8, 4, 16, 4); // headband
    // Long Mirror Katana gleaming (dimmed if reverse on cooldown)
    const reverseOnCooldown = p.reflectCooldownTimer > 0;
    ctx.save();
    if (reverseOnCooldown) {
      ctx.globalAlpha = 0.42;
    }
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p.width / 2 + dir * 6, 16);
    ctx.lineTo(p.width / 2 + dir * 28, 6);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(p.width / 2 + dir * 6, 14, dir * 3, 6); // hilt
    ctx.restore();
  } else if (cid === 'chrono_reflector') {
    // Paradox Time Reflector Dial (dimmed if reverse on cooldown)
    const reverseOnCooldown = p.reflectCooldownTimer > 0;
    ctx.save();
    if (reverseOnCooldown) {
      ctx.globalAlpha = 0.42;
    }
    ctx.translate(p.width / 2 + dir * 10, 18);
    ctx.rotate(now * 0.003);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f3e8ff';
    ctx.fillRect(-1.5, -7, 3, 14);
    ctx.restore();
  } else if (cid === 'blizzard_archon') {
    // Glacial Ice Tiara & Orbiting Frost Flakes
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 9, 3);
    ctx.lineTo(p.width / 2 - 5, -6);
    ctx.lineTo(p.width / 2, 0);
    ctx.lineTo(p.width / 2 + 5, -6);
    ctx.lineTo(p.width / 2 + 9, 3);
    ctx.closePath();
    ctx.fill();
    // Floating ice orb
    const orbFloat = Math.sin(now * 0.008) * 4;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(p.width / 2 + dir * 14, 16 + orbFloat, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'web_stalker') {
    // Mechanical Spider Legs on Back
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(p.width / 2 - dir * 4, 16);
      ctx.lineTo(p.width / 2 - dir * (14 + side * 4), 6 + side * 8);
      ctx.lineTo(p.width / 2 - dir * (18 + side * 4), 16 + side * 10);
      ctx.stroke();
    });
    // Web launcher on arm
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(p.width / 2 + dir * 6, 18, dir * 8, 4);
  } else if (cid === 'stasis_warden') {
    // Chrono Visor & Quantum Stasis Halo
    ctx.fillStyle = '#eab308';
    ctx.fillRect(p.width / 2 - 6, 7, 12, 3);
    ctx.save();
    ctx.translate(p.width / 2, 12);
    ctx.rotate(-now * 0.002);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();
  } else if (cid === 'void_assassin') {
    // Void Shinobi Cowl, Glowing Violet Mask & Nether Kunai
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(p.width / 2 - dir * 2, 7, dir * 7, 3);
    // Void mist wisp
    const mistFloat = Math.sin(now * 0.01) * 3;
    ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
    ctx.beginPath();
    ctx.arc(p.width / 2 - dir * 8, 14 + mistFloat, 5, 0, Math.PI * 2);
    ctx.fill();
    // Nether Dagger in hand
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(p.width / 2 + dir * 6, 17, dir * 10, 3);
  } else if (cid === 'thunder_valkyrie') {
    // Golden Winged Tiara & Storm Mjolnir
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(p.width / 2 - 8, 4);
    ctx.lineTo(p.width / 2 - 12, -4);
    ctx.lineTo(p.width / 2, 0);
    ctx.lineTo(p.width / 2 + 12, -4);
    ctx.lineTo(p.width / 2 + 8, 4);
    ctx.closePath();
    ctx.fill();
    // Storm Hammer
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(p.width / 2 + dir * 8, 12, dir * 8, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(p.width / 2 + dir * 6, 16, dir * 4, 3);
  } else if (cid === 'monkey_king') {
    // Golden Phoenix Feather Headband & Golden Ruyi Jingu Bang Staff
    ctx.fillStyle = '#facc15';
    ctx.fillRect(p.width / 2 - 7, 3, 14, 3);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.width / 2, 3);
    ctx.quadraticCurveTo(p.width / 2 - dir * 10, -8, p.width / 2 - dir * 16, -14);
    ctx.stroke();
    // Golden Staff
    ctx.save();
    ctx.translate(p.width / 2 + dir * 8, 18);
    ctx.rotate(dir * 0.4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-2, -18, 4, 36);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -20, 6, 5);
    ctx.fillRect(-3, 15, 6, 5);
    ctx.restore();
    // Nimbus Cloud at feet
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.beginPath();
    ctx.arc(p.width / 2 - 6, p.height + 1, 6, 0, Math.PI * 2);
    ctx.arc(p.width / 2, p.height + 2, 7, 0, Math.PI * 2);
    ctx.arc(p.width / 2 + 6, p.height + 1, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'neon_samurai') {
    // Cyber Katana Visor & Neon Green Plasma Blade
    ctx.fillStyle = '#10b981';
    ctx.fillRect(p.width / 2 - 6, 7, 12, 3);
    // Katana Scabbard on back
    ctx.save();
    ctx.translate(p.width / 2 - dir * 4, 16);
    ctx.rotate(dir * -0.5);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(-2, -14, 4, 28);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-2.5, -16, 5, 4);
    ctx.restore();
  } else if (cid === 'phoenix_mage') {
    // Solar Phoenix Halo & Blazing Fire Wings
    const flameWing = Math.sin(now * 0.015) * 10;
    ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(p.width / 2, 14);
      ctx.lineTo(p.width / 2 + side * 24, 4 + flameWing * side);
      ctx.lineTo(p.width / 2 + side * 18, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    // Orbiting solar flame orb
    ctx.fillStyle = '#f97316';
    const sOrbFloat = Math.sin(now * 0.01) * 5;
    ctx.beginPath();
    ctx.arc(p.width / 2 + dir * 14, 16 + sOrbFloat, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'shadow_blade') {
    // Shadow Cowl & Dual Nether Daggers
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(p.width / 2 - dir * 4, 7, dir * 8, 3);
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(p.width / 2 + dir * 6, 18, dir * 8, 3);
    ctx.fillRect(p.width / 2 - dir * 10, 18, dir * 6, 3);
  }

  ctx.restore();

  // Active Shield Block Barrier Pulse
  if (p.shieldPulseTimer && p.shieldPulseTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2 + dir * 16, p.y + p.height / 2, 24, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.fill();
    ctx.restore();
  }

  // Active Reflect / Reverse Pulse
  if (p.reflectPulseTimer && p.reflectPulseTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  // Frozen Solid in Glacial Ice Block
  if (p.freezeTimer > 0) {
    ctx.save();
    const iceX = p.x - 6;
    const iceY = p.y - 5;
    const iceW = p.width + 12;
    const iceH = p.height + 9;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.48)';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(iceX, iceY, iceW, iceH, 6);
    ctx.fill();
    ctx.stroke();

    // Frost facets
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(iceX + 4, iceY + 4);
    ctx.lineTo(iceX + iceW - 4, iceY + iceH - 4);
    ctx.moveTo(iceX + iceW - 4, iceY + 4);
    ctx.lineTo(iceX + 4, iceY + iceH - 4);
    ctx.stroke();
    ctx.restore();
  }

  // Quantum Time Stop Stasis Sphere
  if (p.timeStopTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(253, 224, 71, 0.28)';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clock markers & hands
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2);
    ctx.lineTo(p.x + p.width / 2, p.y + p.height / 2 - 12);
    ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2);
    ctx.lineTo(p.x + p.width / 2 + 8, p.y + p.height / 2);
    ctx.stroke();
    ctx.restore();
  }

  // Rooted to ground by spider webs
  if (p.rootTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(p.x + (i / 3) * p.width, p.y + p.height - 10);
      ctx.lineTo(p.x + (i / 3) * p.width, p.y + p.height + 4);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y + p.height - 5);
    ctx.lineTo(p.x + p.width + 4, p.y + p.height - 5);
    ctx.stroke();
    ctx.restore();
  }

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

  // Distinct Overhead Badge: [ P1 ] in Blue, [ P2 ] in Red, [ P3 ] in Emerald, [ P4 ] in Purple + Status
  let badgeLabel = isAi ? theme.aiLabel : theme.label;
  if (p.timeStopTimer > 0) {
    badgeLabel += ` [TIME STOP ⏱️ (${p.ccHitCount || 0}/4)]`;
  } else if (p.freezeTimer > 0) {
    badgeLabel += ` [FROZEN ❄️ (${p.ccHitCount || 0}/4)]`;
  } else if (p.rootTimer > 0) {
    badgeLabel += ` [ROOTED 🕸️ (${p.ccHitCount || 0}/4)]`;
  } else if (p.character.canBlock && p.shieldCooldownTimer > 0) {
    badgeLabel += ` [SHIELD: ${(p.shieldCooldownTimer / 60).toFixed(1)}s]`;
  } else if (p.character.reversesAttacks && p.reflectCooldownTimer > 0) {
    badgeLabel += ` [REVERSE: ${(p.reflectCooldownTimer / 60).toFixed(1)}s]`;
  } else if ((p.character.freezesEnemy || p.character.timeStopsEnemy) && p.freezeCooldownTimer > 0) {
    badgeLabel += ` [FREEZE CD: ${(p.freezeCooldownTimer / 60).toFixed(1)}s]`;
  }
  ctx.fillStyle = theme.color;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeLabel, p.x + p.width / 2, p.y - 18);
};

export const TwoPlayerBattleGame: React.FC = () => {
  // Game Configuration State
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const [selectedMap, setSelectedMap] = useState<MapType>('classic');
  const [p1Char, setP1Char] = useState<Character>(CHARACTERS[0]);
  const [p2Char, setP2Char] = useState<Character>(CHARACTERS[1]);
  const [p3Char, setP3Char] = useState<Character>(CHARACTERS[2] || CHARACTERS[0]);
  const [p4Char, setP4Char] = useState<Character>(CHARACTERS[3] || CHARACTERS[1]);

  const [p1IsAi, setP1IsAi] = useState<boolean>(false);
  const [p2IsAi, setP2IsAi] = useState<boolean>(true);
  const [p3IsAi, setP3IsAi] = useState<boolean>(true);
  const [p4IsAi, setP4IsAi] = useState<boolean>(true);

  const [roundTarget, setRoundTarget] = useState<number>(3); // First to 3

  const [selectedBossId, setSelectedBossId] = useState<string>('boss_titan');

  // Economy & Unlocks (from Scratch 292728003 chest system!)
  const [gold, setGold] = useState<number>(() => {
    const saved = localStorage.getItem('gret_battle_gold');
    return saved ? parseInt(saved, 10) : 500;
  });
  const [unlockedCharIds, setUnlockedCharIds] = useState<string[]>(() => {
    const defaultUnlocked = CHARACTERS.map((c) => c.id);
    const saved = localStorage.getItem('gret_battle_unlocked');
    if (!saved) return defaultUnlocked;
    try {
      const parsed = JSON.parse(saved);
      const set = new Set([...parsed, ...defaultUnlocked]);
      return Array.from(set);
    } catch {
      return defaultUnlocked;
    }
  });

  // Filter state for character rosters
  const [p1ClassFilter, setP1ClassFilter] = useState<string>('all');
  const [p2ClassFilter, setP2ClassFilter] = useState<string>('all');
  const [p3ClassFilter, setP3ClassFilter] = useState<string>('all');
  const [p4ClassFilter, setP4ClassFilter] = useState<string>('all');
  const [selectedPlayerSetupTab, setSelectedPlayerSetupTab] = useState<number>(1);

  // Game Lifecycle State
  const [gameState, setGameState] = useState<'menu' | 'character_select' | 'playing' | 'round_over' | 'game_over' | 'chests'>('menu');
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [matchWinner, setMatchWinner] = useState<number | null>(null);
  const [roundCount, setRoundCount] = useState<number>(1);
  const [playerScores, setPlayerScores] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const p1Score = playerScores[1] || 0;
  const p2Score = playerScores[2] || 0;
  const setP1Score = (val: number | ((prev: number) => number)) => {
    setPlayerScores((prev) => ({
      ...prev,
      1: typeof val === 'function' ? val(prev[1] || 0) : val,
    }));
  };
  const setP2Score = (val: number | ((prev: number) => number)) => {
    setPlayerScores((prev) => ({
      ...prev,
      2: typeof val === 'function' ? val(prev[2] || 0) : val,
    }));
  };
  const [gretCommentary, setGretCommentary] = useState<string>("Ready for the Battle Arena! Select players, pick your characters, and jump in!");
  const [chestOpeningResult, setChestOpeningResult] = useState<string | null>(null);

  // Canvas & Game Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Match entities
  const playersRef = useRef<PlayerState[]>([]);
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
    } else if (map === 'frozen_summit') {
      return [
        { x: 50, y: H - 40, width: 230, height: 20, color: '#0369a1' },
        { x: W - 280, y: H - 40, width: 230, height: 20, color: '#0369a1' },
        { x: 320, y: H - 125, width: 160, height: 18, color: '#38bdf8', isJumpPad: true },
        { x: 140, y: H - 220, width: 150, height: 16, color: '#0284c7' },
        { x: 510, y: H - 220, width: 150, height: 16, color: '#0284c7' },
        { x: 280, y: H - 315, width: 240, height: 16, color: '#bae6fd' },
      ];
    } else if (map === 'haunted_crypt') {
      return [
        { x: 40, y: H - 35, width: W - 80, height: 22, color: '#1e1b4b' },
        { x: 100, y: H - 120, width: 170, height: 18, color: '#312e81' },
        { x: W - 270, y: H - 120, width: 170, height: 18, color: '#312e81' },
        { x: 310, y: H - 185, width: 180, height: 18, color: '#a855f7', isJumpPad: true },
        { x: 200, y: H - 275, width: 140, height: 16, color: '#4c1d95' },
        { x: 460, y: H - 275, width: 140, height: 16, color: '#4c1d95' },
        { x: 320, y: H - 340, width: 160, height: 16, color: '#c084fc' },
      ];
    } else if (map === 'neon_downtown') {
      return [
        { x: 30, y: H - 30, width: W - 60, height: 22, color: '#0f172a' },
        { x: 90, y: H - 110, width: 170, height: 16, color: '#0e7490' },
        { x: W - 260, y: H - 110, width: 170, height: 16, color: '#0e7490' },
        { x: 300, y: H - 170, width: 200, height: 18, color: '#ec4899', isJumpPad: true },
        { x: 160, y: H - 250, width: 150, height: 16, color: '#06b6d4' },
        { x: 490, y: H - 250, width: 150, height: 16, color: '#06b6d4' },
        { x: 310, y: H - 330, width: 180, height: 16, color: '#f472b6' },
      ];
    } else if (map === 'desert_ruins') {
      return [
        { x: 40, y: H - 35, width: 220, height: 22, color: '#78350f' },
        { x: W - 260, y: H - 35, width: 220, height: 22, color: '#78350f' },
        { x: 310, y: H - 115, width: 180, height: 18, color: '#f59e0b', isJumpPad: true },
        { x: 130, y: H - 210, width: 160, height: 16, color: '#b45309' },
        { x: 510, y: H - 210, width: 160, height: 16, color: '#b45309' },
        { x: 270, y: H - 300, width: 260, height: 16, color: '#fde047' },
      ];
    } else if (map === 'boss_titan_citadel' || map === 'boss_citadel') {
      return [
        { x: 20, y: H - 35, width: W - 40, height: 24, color: '#450a0a' },
        { x: 80, y: H - 120, width: 190, height: 18, color: '#7f1d1d' },
        { x: W - 270, y: H - 120, width: 190, height: 18, color: '#7f1d1d' },
        { x: 300, y: H - 180, width: 200, height: 20, color: '#ef4444', isJumpPad: true },
        { x: 180, y: H - 270, width: 150, height: 16, color: '#991b1b' },
        { x: 470, y: H - 270, width: 150, height: 16, color: '#991b1b' },
        { x: 290, y: H - 350, width: 220, height: 18, color: '#f87171' },
      ];
    } else if (map === 'boss_reaper_crypt') {
      return [
        { x: 30, y: H - 35, width: W - 60, height: 22, color: '#2e1065' },
        { x: 60, y: H - 110, width: 160, height: 16, color: '#3b0764' },
        { x: W - 220, y: H - 110, width: 160, height: 16, color: '#3b0764' },
        { x: 310, y: H - 160, width: 180, height: 18, color: '#a855f7', isJumpPad: true },
        { x: 140, y: H - 240, width: 160, height: 16, color: '#581c87' },
        { x: 500, y: H - 240, width: 160, height: 16, color: '#581c87' },
        { x: 260, y: H - 325, width: 280, height: 16, color: '#c084fc', isJumpPad: true },
      ];
    } else if (map === 'boss_dragon_fortress') {
      return [
        { x: 40, y: H - 35, width: W - 80, height: 24, color: '#1e293b' },
        { x: 70, y: H - 115, width: 170, height: 18, color: '#ea580c', isJumpPad: true },
        { x: W - 240, y: H - 115, width: 170, height: 18, color: '#ea580c', isJumpPad: true },
        { x: 280, y: H - 190, width: 240, height: 18, color: '#334155' },
        { x: 130, y: H - 275, width: 170, height: 16, color: '#f97316' },
        { x: 500, y: H - 275, width: 170, height: 16, color: '#f97316' },
        { x: 270, y: H - 355, width: 260, height: 18, color: '#facc15' },
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

    const spawnPositions = [
      { x: 110, y: H - 120, facing: 'right' as const },
      { x: W - 150, y: H - 120, facing: 'left' as const },
      { x: 230, y: H - 240, facing: 'right' as const },
      { x: W - 270, y: H - 240, facing: 'left' as const },
    ];

    const activeBoss = BOSSES.find((b) => b.id === selectedBossId) || BOSSES[0];

    // Automatically assign boss-specific custom map when fighting a boss
    if (gameMode === 'boss_solo' || gameMode === 'boss_coop') {
      if (activeBoss.id === 'boss_titan') {
        setSelectedMap('boss_titan_citadel');
      } else if (activeBoss.id === 'boss_reaper') {
        setSelectedMap('boss_reaper_crypt');
      } else if (activeBoss.id === 'boss_dragon') {
        setSelectedMap('boss_dragon_fortress');
      }
    }

    let activeConfigs = [];
    if (gameMode === 'boss_solo') {
      activeConfigs = [
        { id: 1, char: p1Char, isAi: false, name: 'Player 1' },
        { id: 2, char: activeBoss, isAi: true, name: `[BOSS] ${activeBoss.name}` },
      ];
    } else if (gameMode === 'boss_coop') {
      activeConfigs = [
        { id: 1, char: p1Char, isAi: false, name: 'Player 1' },
        { id: 2, char: p2Char, isAi: false, name: 'Player 2 (Co-op)' },
        { id: 3, char: activeBoss, isAi: true, name: `[BOSS] ${activeBoss.name}` },
      ];
    } else {
      activeConfigs = [
        { id: 1, char: p1Char, isAi: p1IsAi, name: 'Player 1' },
        { id: 2, char: p2Char, isAi: gameMode === 'ai' ? true : p2IsAi, name: gameMode === 'ai' ? 'Gret AI' : 'Player 2' },
        ...(playerCount >= 3 ? [{ id: 3, char: p3Char, isAi: p3IsAi, name: p3IsAi ? 'Nova AI' : 'Player 3' }] : []),
        ...(playerCount >= 4 ? [{ id: 4, char: p4Char, isAi: p4IsAi, name: p4IsAi ? 'Titan AI' : 'Player 4' }] : []),
      ];
    }

    const newPlayers: PlayerState[] = activeConfigs.map((cfg, idx) => {
      const spawn = spawnPositions[idx] || spawnPositions[0];
      return {
        id: cfg.id,
        name: cfg.name,
        isAi: cfg.isAi,
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        width: cfg.char.id.startsWith('boss_') ? 56 : 28,
        height: cfg.char.id.startsWith('boss_') ? 80 : 42,
        facing: spawn.facing,
        isGrounded: false,
        hp: cfg.char.maxHp,
        maxHp: cfg.char.maxHp,
        character: cfg.char,
        lastAttackTime: 0,
        jumpsLeft: cfg.char.tripleJump ? 2 : cfg.char.doubleJump ? 1 : 0,
        score: resetScores ? 0 : (playerScores[cfg.id] || 0),
        isHit: false,
        hitTimer: 0,
        freezeTimer: 0,
        rootTimer: 0,
        timeStopTimer: 0,
        shieldPulseTimer: 0,
        shieldCooldownTimer: 0,
        reflectPulseTimer: 0,
        reflectCooldownTimer: 0,
        freezeCooldownTimer: 0,
        lastTeleportTime: 0,
        ccHitCount: 0,
      };
    });

    playersRef.current = newPlayers;
    p1Ref.current = newPlayers[0] || null;
    p2Ref.current = newPlayers[1] || null;

    projectilesRef.current = [];
    particlesRef.current = [];
    damageNumbersRef.current = [];
    screenShakeRef.current = 0;

    if (resetScores) {
      setPlayerScores({ 1: 0, 2: 0, 3: 0, 4: 0 });
      setRoundCount(1);
    }

    setRoundWinner(null);
    setMatchWinner(null);
    setGameState('playing');

    soundManager.playMove();
    if (playerCount === 2) {
      setGretCommentary(
        gameMode === 'ai'
          ? `Round ${resetScores ? 1 : roundCount}! Can your ${p1Char.name} beat Gret's ${p2Char.name}?`
          : `Round ${resetScores ? 1 : roundCount}! Player 1 (${p1Char.name}) vs Player 2 (${p2Char.name}) - Fight!`
      );
    } else {
      setGretCommentary(
        `Round ${resetScores ? 1 : roundCount}! ${playerCount} Warriors enter the battle royale arena! Last one standing wins!`
      );
    }
  }, [p1Char, p2Char, p3Char, p4Char, p1IsAi, p2IsAi, p3IsAi, p4IsAi, playerCount, playerScores, roundCount, gameMode]);

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
  const executeAttack = (playerNum: number) => {
    const player = playersRef.current.find((p) => p.id === playerNum) || (playerNum === 1 ? p1Ref.current : p2Ref.current);
    if (!player) return;
    if (player.freezeTimer > 0 || player.timeStopTimer > 0) return; // Cannot attack while frozen solid in ice or stasis!

    const now = performance.now();
    if (now - player.lastAttackTime < player.character.attackCooldown) {
      return; // On cooldown
    }
    player.lastAttackTime = now;

    const dir = player.facing === 'right' ? 1 : -1;
    const speed = player.character.projectileSpeed;
    const char = player.character;

    // Boss Multi-Ability System (Lots of moves & abilities with different damage values, bigger scale, no extra health)
    if (char.id.startsWith('boss_')) {
      const moveRoll = Math.random();
      let moveName = 'Boss Strike';
      let dmg = 16;
      let projType = char.projectileType;
      let prSpeed = speed;

      if (moveRoll < 0.33) {
        moveName = 'Quick Bolt';
        dmg = 14;
        prSpeed = speed * 1.35;
      } else if (moveRoll < 0.68) {
        moveName = 'Heavy Shockwave';
        dmg = 22;
        screenShakeRef.current = 10;
      } else {
        moveName = 'Ultimate Nova';
        dmg = 32;
        prSpeed = speed * 1.5;
        screenShakeRef.current = 18;
      }

      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 4 : -24),
        y: player.y + player.height / 2 - 12,
        vx: dir * prSpeed,
        vy: (Math.random() - 0.5) * 2,
        radius: dmg > 25 ? 20 : 12,
        damage: dmg,
        type: projType,
        color: char.secondaryColor,
        life: 55,
      });

      damageNumbersRef.current.push({
        id: Math.random(),
        x: player.x + player.width / 2,
        y: player.y - 20,
        damage: `${moveName} (${dmg} DMG)!`,
        life: 35,
        color: char.secondaryColor,
      });
      return;
    }

    // 1. Teleport Ability (Blinks behind enemy and strikes - 4s cooldown)
    if (char.canTeleport || char.attackStyle === 'teleport' || char.projectileType === 'teleport_strike' || char.projectileType === 'chrono_rift') {
      if (now - player.lastTeleportTime >= 4000) {
        player.lastTeleportTime = now;
        const livingOpponents = playersRef.current.filter((p) => p.id !== playerNum && p.hp > 0);
        if (livingOpponents.length > 0) {
          let opponent = livingOpponents[0];
          let minD = Infinity;
          livingOpponents.forEach((op) => {
            const d = Math.hypot(op.x - player.x, op.y - player.y);
            if (d < minD) {
              minD = d;
              opponent = op;
            }
          });

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

          // Deliver instant backstab strike (1/4 damage if opponent is rooted, frozen, or timestopped)
          const isOpponentCC = opponent.freezeTimer > 0 || opponent.rootTimer > 0 || opponent.timeStopTimer > 0;
          const effectiveDamage = isOpponentCC ? Math.max(1, Math.round(char.attackDamage / 4)) : char.attackDamage;
          opponent.hp -= effectiveDamage;
          opponent.isHit = true;
          opponent.hitTimer = 12;
          opponent.vx = (player.facing === 'right' ? 1 : -1) * 9.5;
          opponent.vy = -4.5;
          screenShakeRef.current = 11;
          soundManager.playHit();

          // Break out of CC after 4 hits
          if (isOpponentCC) {
            opponent.ccHitCount = (opponent.ccHitCount || 0) + 1;
            if (opponent.ccHitCount >= 4) {
              opponent.freezeTimer = 0;
              opponent.rootTimer = 0;
              opponent.timeStopTimer = 0;
              opponent.ccHitCount = 0;
              damageNumbersRef.current.push({
                id: Math.random(),
                x: opponent.x + opponent.width / 2,
                y: opponent.y - 36,
                damage: 'BROKEN FREE! 💥',
                life: 45,
                color: '#ef4444',
              });
              soundManager.playLaser();
              for (let i = 0; i < 16; i++) {
                particlesRef.current.push({
                  x: opponent.x + opponent.width / 2,
                  y: opponent.y + opponent.height / 2,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  color: '#f8fafc',
                  size: 4,
                  life: 24,
                  maxLife: 24,
                });
              }
            }
          }

          damageNumbersRef.current.push({
            id: Math.random(),
            x: opponent.x + opponent.width / 2,
            y: opponent.y - 14,
            damage: isOpponentCC ? `${effectiveDamage} (¼ CC)` : effectiveDamage,
            life: 30,
            color: isOpponentCC ? '#f59e0b' : char.projectileType === 'chrono_rift' ? '#2dd4bf' : '#c084fc',
          });

          if (opponent.hp <= 0) {
            opponent.hp = 0;
            soundManager.playExplosion();
            const alive = playersRef.current.filter((p) => p.hp > 0);
            if (alive.length === 1) {
              handleRoundEnd(alive[0].id);
            } else if (alive.length === 0) {
              handleRoundEnd(playerNum);
            }
          }
          return;
        }
      } else {
        // Teleport is on 4s cooldown -> perform normal melee attack
        player.vx = dir * 6.5;
        soundManager.playAttack();
        screenShakeRef.current = 5;
        projectilesRef.current.push({
          id: Math.random(),
          owner: playerNum,
          x: player.x + (dir === 1 ? player.width + 4 : -50),
          y: player.y + player.height / 2 - 12,
          vx: dir * 3.5,
          vy: 0,
          radius: 26,
          damage: Math.round(char.attackDamage * 0.85),
          type: 'slash',
          color: char.secondaryColor || char.color,
          life: 12,
          isMeleeHitbox: true,
        });
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
    } else if (char.projectileType === 'radiant_shockwave') {
      soundManager.playLaser();
      player.shieldPulseTimer = 16;
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -18),
        y: player.y + player.height / 2 - 14,
        vx: dir * speed,
        vy: 0,
        radius: 18,
        damage: char.attackDamage,
        type: 'radiant_shockwave',
        color: '#fde047',
        life: 30,
      });
    } else if (char.projectileType === 'glacial_spike') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -20),
        y: player.y + player.height / 2 - 10,
        vx: dir * speed,
        vy: 0,
        radius: 15,
        damage: char.attackDamage,
        type: 'glacial_spike',
        color: '#38bdf8',
        life: 45,
        freezesEnemy: true,
      });
    } else if (char.projectileType === 'mirror_slash') {
      soundManager.playLaser();
      player.reflectPulseTimer = 18;
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -18),
        y: player.y + player.height / 2 - 12,
        vx: dir * speed,
        vy: 0,
        radius: 19,
        damage: char.attackDamage,
        type: 'mirror_slash',
        color: '#67e8f9',
        life: 28,
      });
    } else if (char.projectileType === 'time_paradox') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 6 : -16),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: 0,
        radius: 14,
        damage: char.attackDamage,
        type: 'time_paradox',
        color: '#c084fc',
        life: 45,
      });
    } else if (char.projectileType === 'frost_freeze') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -16),
        y: player.y + player.height / 2 - 8,
        vx: dir * speed,
        vy: 0,
        radius: 14,
        damage: char.attackDamage,
        type: 'frost_freeze',
        color: '#0284c7',
        life: 52,
        freezesEnemy: true,
      });
    } else if (char.projectileType === 'web_trap') {
      soundManager.playAttack();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -16),
        y: player.y + player.height / 2 - 6,
        vx: dir * speed,
        vy: 0.4,
        radius: 14,
        damage: char.attackDamage,
        type: 'web_trap',
        color: '#84cc16',
        life: 46,
        rootsEnemy: true,
      });
    } else if (char.projectileType === 'stasis_sphere') {
      soundManager.playLaser();
      projectilesRef.current.push({
        id: Math.random(),
        owner: playerNum,
        x: player.x + (dir === 1 ? player.width + 8 : -18),
        y: player.y + player.height / 2 - 10,
        vx: dir * speed,
        vy: 0,
        radius: 16,
        damage: char.attackDamage,
        type: 'stasis_sphere',
        color: '#eab308',
        life: 48,
        timeStopsEnemy: true,
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

      const allPlayers = playersRef.current;
      if (allPlayers.length === 0) return;

      const keys = keysPressed.current;

      // 1 & 2. Process Inputs for all players (P1, P2, P3, P4 or AI)
      allPlayers.forEach((p) => {
        if (p.hp <= 0) return;
        if (p.freezeTimer > 0 || p.timeStopTimer > 0) return;

        if (!p.isAi) {
          // Human Controlled Player
          let leftKey = false;
          let rightKey = false;
          let jumpKey = false;
          let attackKey = false;
          let jumpCode = '';

          if (p.id === 1) {
            leftKey = !!keys['KeyA'];
            rightKey = !!keys['KeyD'];
            jumpKey = !!keys['KeyW'];
            attackKey = !!keys['KeyS'];
            jumpCode = 'KeyW';
          } else if (p.id === 2) {
            leftKey = !!keys['ArrowLeft'];
            rightKey = !!keys['ArrowRight'];
            jumpKey = !!keys['ArrowUp'];
            attackKey = !!keys['ArrowDown'];
            jumpCode = 'ArrowUp';
          } else if (p.id === 3) {
            leftKey = !!keys['KeyJ'];
            rightKey = !!keys['KeyL'];
            jumpKey = !!keys['KeyI'];
            attackKey = !!keys['KeyK'];
            jumpCode = 'KeyI';
          } else if (p.id === 4) {
            leftKey = !!keys['Numpad4'] || !!keys['Digit4'];
            rightKey = !!keys['Numpad6'] || !!keys['Digit6'];
            jumpKey = !!keys['Numpad8'] || !!keys['Digit8'];
            attackKey = !!keys['Numpad5'] || !!keys['Digit5'];
            jumpCode = keys['Numpad8'] ? 'Numpad8' : 'Digit8';
          }

          if (p.rootTimer <= 0) {
            if (leftKey) {
              p.vx -= 1.1;
              p.facing = 'left';
            }
            if (rightKey) {
              p.vx += 1.1;
              p.facing = 'right';
            }
          }

          if (jumpKey) {
            if (p.character.canFly) {
              p.vy = Math.max(p.vy - 0.78, -5.5);
              p.isGrounded = false;
              if (Math.random() < 0.3) {
                particlesRef.current.push({
                  x: p.x + p.width / 2 + (Math.random() - 0.5) * 16,
                  y: p.y + p.height,
                  vx: (Math.random() - 0.5) * 2,
                  vy: 2.2,
                  color: p.character.secondaryColor,
                  size: 3,
                  life: 12,
                  maxLife: 12,
                });
              }
            } else if (p.isGrounded) {
              p.vy = -p.character.jumpForce;
              p.isGrounded = false;
              p.jumpsLeft = p.character.tripleJump ? 2 : p.character.doubleJump ? 1 : 0;
              soundManager.playJump();
              if (jumpCode) keys[jumpCode] = false;
            } else if (p.jumpsLeft > 0) {
              p.vy = -p.character.jumpForce * 0.92;
              p.jumpsLeft--;
              soundManager.playJump();
              if (jumpCode) keys[jumpCode] = false;
            }
          }

          if (attackKey) {
            executeAttack(p.id);
          }
        } else {
          // AI Controlled Player
          const livingEnemies = allPlayers.filter((other) => other.id !== p.id && other.hp > 0);
          if (livingEnemies.length > 0) {
            let targetEnemy = livingEnemies[0];
            let minD = Infinity;
            livingEnemies.forEach((e) => {
              const d = Math.hypot(e.x - p.x, e.y - p.y);
              if (d < minD) {
                minD = d;
                targetEnemy = e;
              }
            });

            const dx = targetEnemy.x - p.x;
            const dy = targetEnemy.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            p.facing = dx > 0 ? 'right' : 'left';

            const speedMod = aiDifficulty === 'easy' ? 0.7 : aiDifficulty === 'normal' ? 0.95 : 1.25;
            const jumpChance = aiDifficulty === 'easy' ? 0.015 : aiDifficulty === 'normal' ? 0.035 : 0.06;
            const attackRange = p.character.isMelee ? 130 : p.character.projectileType === 'slash' ? 140 : 380;

            if (p.rootTimer <= 0) {
              if (p.character.canFly && p.y > 170 && (dy < -25 || Math.random() < 0.09)) {
                p.vy = Math.max(p.vy - 0.72, -4.8);
              }

              if (dist > attackRange * 0.7) {
                p.vx += (dx > 0 ? 0.9 : -0.9) * speedMod;
              } else if (dist < 60) {
                if (!p.character.isMelee && p.character.projectileType !== 'slash') {
                  p.vx += (dx > 0 ? -0.8 : 0.8) * speedMod;
                }
              }
            }

            if (p.isGrounded && (dy < -40 || Math.random() < jumpChance)) {
              p.vy = -p.character.jumpForce;
              p.isGrounded = false;
              soundManager.playJump();
            }

            if (dist < attackRange && Math.abs(dy) < 80) {
              const attackAggression = aiDifficulty === 'easy' ? 0.04 : aiDifficulty === 'normal' ? 0.08 : 0.14;
              if (Math.random() < attackAggression) {
                executeAttack(p.id);
              }
            }
          }
        }
      });

      // 3. Physics & Boundaries Update for Players
      allPlayers.forEach((p) => {
        // Status timers decay
        if (p.freezeTimer > 0) {
          p.freezeTimer--;
          p.vx = 0;
          p.vy = 0;
        } else if (p.timeStopTimer > 0) {
          p.timeStopTimer--;
          p.vx = 0;
          p.vy = 0;
        } else if (p.rootTimer > 0) {
          p.rootTimer--;
          p.vx = 0;
        }
        if (p.freezeTimer <= 0 && p.timeStopTimer <= 0 && p.rootTimer <= 0) {
          p.ccHitCount = 0;
        }
        if (p.shieldPulseTimer && p.shieldPulseTimer > 0) p.shieldPulseTimer--;
        if (p.shieldCooldownTimer > 0) p.shieldCooldownTimer--;
        if (p.reflectPulseTimer && p.reflectPulseTimer > 0) p.reflectPulseTimer--;
        if (p.reflectCooldownTimer > 0) p.reflectCooldownTimer--;
        if (p.freezeCooldownTimer > 0) p.freezeCooldownTimer--;

        // Max horizontal speed clamp
        const maxSpd = p.character.speed;
        p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));
        p.x += p.vx;
        p.vx *= FRICTION;

        // Apply gravity (reduced for flying characters, 0 if frozen in stasis)
        if (p.freezeTimer <= 0 && p.timeStopTimer <= 0) {
          const grav = p.character.canFly ? GRAVITY * 0.38 : GRAVITY;
          p.vy += grav;
          p.y += p.vy;
        }

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

        // Check hits against all opponent players
        let didHitPlayer = false;
        for (const target of allPlayers) {
          if (target.id === proj.owner || target.hp <= 0) continue;

          const hitTarget =
            proj.x + proj.radius > target.x &&
            proj.x - proj.radius < target.x + target.width &&
            proj.y + proj.radius > target.y &&
            proj.y - proj.radius < target.y + target.height;

          if (hitTarget) {
            didHitPlayer = true;
            // A. Check Reverse / Reflect Attack Ability (4s reflect cooldown)
            if (target.character.reversesAttacks && target.reflectCooldownTimer <= 0 && !proj.isReflected && !proj.isMeleeHitbox) {
              proj.isReflected = true;
              proj.owner = target.id;
              proj.vx = -proj.vx * 1.35;
              proj.vy = -1.5;
              proj.damage = Math.round(proj.damage * 1.3);
              proj.color = target.character.secondaryColor;
              proj.life = 60;
              target.reflectPulseTimer = 22;
              target.reflectCooldownTimer = 240; // 4s reverse cooldown

              soundManager.playLaser();
              screenShakeRef.current = 6;

              damageNumbersRef.current.push({
                id: Math.random(),
                x: target.x + target.width / 2,
                y: target.y - 18,
                damage: 'REVERSED! 🔄',
                life: 36,
                color: '#38bdf8',
              });

              for (let i = 0; i < 14; i++) {
                particlesRef.current.push({
                  x: proj.x,
                  y: proj.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: target.character.secondaryColor,
                  size: 3.5,
                  life: 18,
                  maxLife: 18,
                });
              }

              nextProjectiles.push(proj);
              break;
            }

            // B. Check Block Ability (Tower shields absorb frontal projectiles, 4s cooldown)
            const isFacingProj = (proj.vx < 0 && target.facing === 'right') || (proj.vx > 0 && target.facing === 'left');
            if (target.character.canBlock && target.shieldCooldownTimer <= 0 && (isFacingProj || target.character.id === 'glacial_titan')) {
              target.shieldPulseTimer = 20;
              target.shieldCooldownTimer = 240; // 4s block cooldown
              target.vx = Math.sign(proj.vx) * 2.2;

              damageNumbersRef.current.push({
                id: Math.random(),
                x: target.x + target.width / 2,
                y: target.y - 18,
                damage: 'BLOCKED! 🛡️',
                life: 36,
                color: '#fde047',
              });

              soundManager.playHit();
              screenShakeRef.current = 4;

              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: proj.x,
                  y: proj.y,
                  vx: (target.facing === 'right' ? 1 : -1) * Math.random() * 5,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#facc15',
                  size: 3,
                  life: 16,
                  maxLife: 16,
                });
              }
              // Blocked and neutralized!
              break;
            }

            // Normal Hit: Apply damage (1/4 damage if target is rooted, frozen, or timestopped)
            const isTargetCC = target.freezeTimer > 0 || target.rootTimer > 0 || target.timeStopTimer > 0;
            const effectiveDamage = isTargetCC ? Math.max(1, Math.round(proj.damage / 4)) : proj.damage;
            target.hp -= effectiveDamage;
            target.isHit = true;
            target.hitTimer = 12;

            // Break out of CC after 4 hits
            if (isTargetCC) {
              target.ccHitCount = (target.ccHitCount || 0) + 1;
              if (target.ccHitCount >= 4) {
                target.freezeTimer = 0;
                target.rootTimer = 0;
                target.timeStopTimer = 0;
                target.ccHitCount = 0;
                damageNumbersRef.current.push({
                  id: Math.random(),
                  x: target.x + target.width / 2,
                  y: target.y - 36,
                  damage: 'BROKEN FREE! 💥',
                  life: 45,
                  color: '#ef4444',
                });
                soundManager.playLaser();
                for (let i = 0; i < 18; i++) {
                  particlesRef.current.push({
                    x: target.x + target.width / 2,
                    y: target.y + target.height / 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    color: '#f8fafc',
                    size: 4,
                    life: 24,
                    maxLife: 24,
                  });
                }
              }
            }

            // Check Movement-Stopping Status Effects (Freeze, Root, Time Stasis) - respects freeze cooldown
            const attacker = allPlayers.find((p) => p.id === proj.owner) || allPlayers[0];
            const canApplyCC = attacker.freezeCooldownTimer <= 0;

            if (canApplyCC && (proj.freezesEnemy || attacker.character.freezesEnemy)) {
              target.freezeTimer = 95; // ~1.6s frozen solid
              target.ccHitCount = 0;
              attacker.freezeCooldownTimer = 180; // 3s freeze cooldown
              damageNumbersRef.current.push({
                id: Math.random(),
                x: target.x + target.width / 2,
                y: target.y - 32,
                damage: 'FROZEN! ❄️',
                life: 40,
                color: '#38bdf8',
              });
              for (let i = 0; i < 14; i++) {
                particlesRef.current.push({
                  x: target.x + target.width / 2,
                  y: target.y + target.height / 2,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  color: '#bae6fd',
                  size: 4,
                  life: 20,
                  maxLife: 20,
                });
              }
            } else if (canApplyCC && (proj.rootsEnemy || attacker.character.rootsEnemy)) {
              target.rootTimer = 110; // ~1.8s web-rooted to ground
              target.ccHitCount = 0;
              attacker.freezeCooldownTimer = 180; // 3s CC cooldown
              damageNumbersRef.current.push({
                id: Math.random(),
                x: target.x + target.width / 2,
                y: target.y - 32,
                damage: 'ROOTED! 🕸️',
                life: 40,
                color: '#a3e635',
              });
              for (let i = 0; i < 10; i++) {
                particlesRef.current.push({
                  x: target.x + target.width / 2,
                  y: target.y + target.height - 4,
                  vx: (Math.random() - 0.5) * 5,
                  vy: -Math.random() * 3,
                  color: '#f8fafc',
                  size: 3,
                  life: 22,
                  maxLife: 22,
                });
              }
            } else if (canApplyCC && (proj.timeStopsEnemy || attacker.character.timeStopsEnemy)) {
              target.timeStopTimer = 105; // ~1.75s mid-air time freeze
              target.ccHitCount = 0;
              attacker.freezeCooldownTimer = 180; // 3s CC cooldown
              target.vx = 0;
              target.vy = 0;
              damageNumbersRef.current.push({
                id: Math.random(),
                x: target.x + target.width / 2,
                y: target.y - 32,
                damage: 'TIME STOP! ⏱️',
                life: 40,
                color: '#fde047',
              });
            }

            if (proj.pullsEnemy) {
              // Drag enemy towards the attacker!
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
              damage: isTargetCC ? `${effectiveDamage} (¼ CC)` : effectiveDamage,
              life: 28,
              color: isTargetCC ? '#f59e0b' : proj.color,
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
              soundManager.playExplosion();
              const alive = allPlayers.filter((p) => p.hp > 0);
              if (alive.length === 1) {
                handleRoundEnd(alive[0].id);
              } else if (alive.length === 0) {
                handleRoundEnd(proj.owner);
              }
            }
            break;
          }
        }

        if (!didHitPlayer && !hitPlatform && proj.life > 0 && proj.x > 0 && proj.x < W) {
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

      // Render All Active Players with distinct styling & unique character gear
      allPlayers.forEach((p) => {
        if (p.hp > 0 || p.hitTimer > 0) {
          renderCharacterSprite(ctx, p, p.id, !!p.isAi, Date.now());
        }
      });

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
        } else if (proj.type === 'radiant_shockwave') {
          // Golden radiant crescent shockwave
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, -Math.PI * 0.45, Math.PI * 0.45, proj.vx < 0);
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#fde047';
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'glacial_spike') {
          // Massive icy stalagmite spike
          ctx.save();
          ctx.translate(proj.x, proj.y);
          if (proj.vx < 0) ctx.scale(-1, 1);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(-10, -8);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-10, 8);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'mirror_slash') {
          // Prismatic mirrored crescent arc
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, -Math.PI * 0.45, Math.PI * 0.45, proj.vx < 0);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#67e8f9';
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'time_paradox') {
          // Purple cosmic paradox temporal distortion ring
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.015);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3;
          ctx.strokeRect(-proj.radius * 0.7, -proj.radius * 0.7, proj.radius * 1.4, proj.radius * 1.4);
          ctx.fillStyle = '#f3e8ff';
          ctx.fillRect(-2, -2, 4, 4);
          ctx.restore();
        } else if (proj.type === 'frost_freeze') {
          // Floating freezing crystal orb
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (proj.type === 'web_trap') {
          // Spinning arachnid silk web net
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(Date.now() * 0.01);
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-proj.radius, 0);
          ctx.lineTo(proj.radius, 0);
          ctx.moveTo(0, -proj.radius);
          ctx.lineTo(0, proj.radius);
          ctx.stroke();
          ctx.restore();
        } else if (proj.type === 'stasis_sphere') {
          // Quantum stasis golden chronosphere
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
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
        ctx.font = typeof d.damage === 'string' ? 'bold 11px sans-serif' : 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        const text = typeof d.damage === 'number' ? `-${d.damage}` : d.damage;
        ctx.fillText(text, d.x, d.y);
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
  const handleRoundEnd = (winner: number) => {
    soundManager.playVictory();
    setRoundWinner(winner);

    const winnerPlayer = playersRef.current.find((p) => p.id === winner);
    const winnerName = winnerPlayer?.name || `Player ${winner}`;

    const earnedGold = winner === 1 ? 40 : 20;
    setGold((prev) => prev + earnedGold);

    setPlayerScores((prev) => {
      const nextScores = { ...prev, [winner]: (prev[winner] || 0) + 1 };
      const score = nextScores[winner];

      if (winner === 1) {
        setGretCommentary(
          gameMode === 'ai' && playerCount === 2
            ? `Solid hit! You took this round! (+${earnedGold} Gold)`
            : `${winnerName} wins Round ${roundCount}! Fantastic reflexes! (+${earnedGold} Gold)`
        );
      } else {
        setGretCommentary(`${winnerName} takes Round ${roundCount}! (+${earnedGold} Gold)`);
      }

      // Check if match won
      if (score >= roundTarget) {
        setMatchWinner(winner);
        setGameState('game_over');
        if (winner === 1) {
          soundManager.playGameOver();
        } else {
          soundManager.playLoss();
        }
      } else {
        setGameState('round_over');
        setRoundCount((c) => c + 1);
      }

      return nextScores;
    });
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{gold} Gold</span>
          </div>

          {/* Player Count Selector */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            <span className="text-[10px] text-neutral-400 px-1.5 font-bold uppercase">Players:</span>
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => {
                  setPlayerCount(count as 2 | 3 | 4);
                  if (gameState === 'playing') initRound(true);
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer text-xs font-bold ${
                  playerCount === count
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {count}P
              </button>
            ))}
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
              <span>VS AI</span>
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
              <span>Free-For-All</span>
            </button>
            <button
              onClick={() => {
                setGameMode('boss_solo');
                if (selectedBossId === 'boss_titan') setSelectedMap('boss_titan_citadel');
                else if (selectedBossId === 'boss_reaper') setSelectedMap('boss_reaper_crypt');
                else if (selectedBossId === 'boss_dragon') setSelectedMap('boss_dragon_fortress');
                if (gameState === 'playing') initRound(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                gameMode === 'boss_solo'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Boss Solo</span>
            </button>
            <button
              onClick={() => {
                setGameMode('boss_coop');
                if (selectedBossId === 'boss_titan') setSelectedMap('boss_titan_citadel');
                else if (selectedBossId === 'boss_reaper') setSelectedMap('boss_reaper_crypt');
                else if (selectedBossId === 'boss_dragon') setSelectedMap('boss_dragon_fortress');
                if (gameState === 'playing') initRound(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                gameMode === 'boss_coop'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Boss Co-op</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gret Live Commentary Banner */}
      <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400">Battle Announcer:</span>
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
          {/* Top In-Game Scoreboard for 2, 3, or 4 Players */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-neutral-900 text-white rounded-xl border border-neutral-800">
            {/* Player badges for all active players */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 1, char: p1Char, theme: PLAYER_THEMES[0], name: 'P1: ' + p1Char.name },
                { id: 2, char: p2Char, theme: PLAYER_THEMES[1], name: (gameMode === 'ai' ? 'Gret AI: ' : 'P2: ') + p2Char.name },
                ...(playerCount >= 3 ? [{ id: 3, char: p3Char, theme: PLAYER_THEMES[2], name: (p3IsAi ? 'AI 3: ' : 'P3: ') + p3Char.name }] : []),
                ...(playerCount >= 4 ? [{ id: 4, char: p4Char, theme: PLAYER_THEMES[3], name: (p4IsAi ? 'AI 4: ' : 'P4: ') + p4Char.name }] : []),
              ].map((p) => {
                const livePlayer = playersRef.current.find((pl) => pl.id === p.id);
                const currentHp = livePlayer ? Math.max(0, livePlayer.hp) : p.char.maxHp;
                const hpPercent = Math.round((currentHp / p.char.maxHp) * 100);
                const score = playerScores[p.id] || 0;

                return (
                  <div key={p.id} className="flex items-center gap-2 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/60">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.theme.color }} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs" style={{ color: p.theme.color }}>
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-black text-white" style={{ backgroundColor: p.theme.color }}>
                          {score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-neutral-400">
                        <div className="w-14 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${hpPercent}%`,
                              backgroundColor: hpPercent > 40 ? p.theme.color : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="font-mono">{currentHp} HP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Match Status / Target */}
            <div className="text-xs font-semibold text-neutral-400 ml-auto">
              Round {roundCount} • Target: First to {roundTarget}
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
                  {(() => {
                    const winnerPl = playersRef.current.find((p) => p.id === roundWinner);
                    return winnerPl ? `${winnerPl.name.toUpperCase()} WINS ROUND!` : `PLAYER ${roundWinner} WINS ROUND!`;
                  })()}
                </h3>
                <p className="text-xs text-neutral-400 mb-4 max-w-sm">
                  {Object.entries(playerScores)
                    .filter(([id]) => parseInt(id, 10) <= playerCount)
                    .map(([id, sc]) => {
                      const p = playersRef.current.find((pl) => pl.id === parseInt(id, 10));
                      return `${p?.name || 'P' + id}: ${sc}`;
                    })
                    .join(' • ')}{' '}
                  (First to {roundTarget})
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
                  {(() => {
                    const winnerPl = playersRef.current.find((p) => p.id === matchWinner);
                    return winnerPl ? `🎉 ${winnerPl.name.toUpperCase()} IS THE CHAMPION!` : '🎉 VICTORY!';
                  })()}
                </h3>
                <p className="text-xs text-neutral-300 mb-5 max-w-md leading-relaxed">
                  Final Match Scores:{' '}
                  {Object.entries(playerScores)
                    .filter(([id]) => parseInt(id, 10) <= playerCount)
                    .map(([id, sc]) => {
                      const p = playersRef.current.find((pl) => pl.id === parseInt(id, 10));
                      return `${p?.name || 'P' + id}: ${sc}`;
                    })
                    .join(' • ')}
                  ! Gold earned from match rewards has been added to your vault.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-2xl text-xs">
            {/* Player 1 Controls Card */}
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Player 1: {p1Char.name}
                </span>
                <span className="text-[11px] text-neutral-500">Keyboard & Touch</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">A/D</span> Move
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">W</span> Jump
                <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">S</span> Attack
                {p1Char.canBlock && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    🛡️ Shield (4s cd)
                  </span>
                )}
                {p1Char.reversesAttacks && (
                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    🔄 Reverse (4s cd)
                  </span>
                )}
                {(p1Char.freezesEnemy || p1Char.rootsEnemy || p1Char.timeStopsEnemy) && (
                  <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    ❄️ Freeze/CC (3s cd)
                  </span>
                )}
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

            {/* Player 2 Controls Card */}
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-red-200 dark:border-red-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-600 dark:text-red-400">
                  {gameMode === 'ai' ? `Gret AI: ${p2Char.name}` : `Player 2: ${p2Char.name}`}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {gameMode === 'ai' ? `AI Difficulty: ${aiDifficulty}` : 'Keyboard & Touch'}
                </span>
              </div>

              {gameMode === '2player' && !p2IsAi ? (
                <>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">←/→</span> Move
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">↑</span> Jump
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">↓</span> Attack
                    {p2Char.canBlock && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        🛡️ Shield (4s cd)
                      </span>
                    )}
                    {p2Char.reversesAttacks && (
                      <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                        🔄 Reverse (4s cd)
                      </span>
                    )}
                    {(p2Char.freezesEnemy || p2Char.rootsEnemy || p2Char.timeStopsEnemy) && (
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        ❄️ Freeze/CC (3s cd)
                      </span>
                    )}
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
                  <p>Controlled autonomously by AI engine with jumping, dodging, and tactical projectile aim.</p>
                </div>
              )}
            </div>

            {/* Player 3 Controls Card (if 3 or 4 players) */}
            {playerCount >= 3 && (
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Player 3: {p3Char.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {p3IsAi ? 'AI Controlled' : 'Keys: J, L, I, K'}
                  </span>
                </div>
                {!p3IsAi ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">J/L</span> Move
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">I</span> Jump
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">K</span> Attack
                    <button
                      onClick={() => executeAttack(3)}
                      className="ml-auto px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                    >
                      Attack (K)
                    </button>
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs">AI Warrior fighting in the arena.</p>
                )}
              </div>
            )}

            {/* Player 4 Controls Card (if 4 players) */}
            {playerCount >= 4 && (
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Player 4: {p4Char.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {p4IsAi ? 'AI Controlled' : 'Keys: 4, 6, 8, 5'}
                  </span>
                </div>
                {!p4IsAi ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">4/6</span> Move
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">8</span> Jump
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono font-bold">5</span> Attack
                    <button
                      onClick={() => executeAttack(4)}
                      className="ml-auto px-3 py-1 rounded bg-amber-600 text-white font-bold text-[10px]"
                    >
                      Attack (5)
                    </button>
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs">AI Warrior fighting in the arena.</p>
                )}
              </div>
            )}
          </div>

          {/* Combat Rules Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
            <span className="font-bold text-neutral-800 dark:text-neutral-100">⚔️ Battle Mechanics:</span>
            <span>🛡️ <strong>Shield & Reverse:</strong> 4.0s Cooldown</span>
            <span>❄️ <strong>CC Armor:</strong> Rooted/Frozen/Time-Stopped fighters take ¼ damage</span>
            <span>💥 <strong>Breakout:</strong> 4 hits instantly unfreezes target</span>
            <span>⏱️ <strong>Freeze CD:</strong> 3.0s cooldown on freeze/root/stasis</span>
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
                    {p1Char.canBlock && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                        🛡️ Block Attacks
                      </span>
                    )}
                    {p1Char.reversesAttacks && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                        🔄 Reverse Attacks
                      </span>
                    )}
                    {p1Char.freezesEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                        ❄️ Freeze Enemy
                      </span>
                    )}
                    {p1Char.rootsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 font-bold border border-lime-500/30">
                        🕸️ Root Enemy
                      </span>
                    )}
                    {p1Char.timeStopsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        ⏱️ Time Stop
                      </span>
                    )}
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
                    {p2Char.canBlock && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">
                        🛡️ Block Attacks
                      </span>
                    )}
                    {p2Char.reversesAttacks && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                        🔄 Reverse Attacks
                      </span>
                    )}
                    {p2Char.freezesEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                        ❄️ Freeze Enemy
                      </span>
                    )}
                    {p2Char.rootsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 font-bold border border-lime-500/30">
                        🕸️ Root Enemy
                      </span>
                    )}
                    {p2Char.timeStopsEnemy && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                        ⏱️ Time Stop
                      </span>
                    )}
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

          {/* Boss Selection Card if Boss Mode */}
          {(gameMode === 'boss_solo' || gameMode === 'boss_coop') && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 mb-3">
              <label className="text-xs font-bold uppercase text-red-600 dark:text-red-400 tracking-wider block mb-2 flex items-center gap-1.5">
                <Skull className="w-4 h-4" />
                <span>Select Epic Raid Boss ({BOSSES.length} Available - Auto-Sets Custom Arena Map)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOSSES.map((boss) => {
                  const isSelected = selectedBossId === boss.id;
                  const bossMapName =
                    boss.id === 'boss_titan'
                      ? '🌋 Magma Citadel'
                      : boss.id === 'boss_reaper'
                      ? '🌌 Nether Crypt'
                      : '⚡ Sky Fortress';
                  return (
                    <button
                      key={boss.id}
                      onClick={() => {
                        setSelectedBossId(boss.id);
                        if (boss.id === 'boss_titan') setSelectedMap('boss_titan_citadel');
                        else if (boss.id === 'boss_reaper') setSelectedMap('boss_reaper_crypt');
                        else if (boss.id === 'boss_dragon') setSelectedMap('boss_dragon_fortress');
                      }}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-500 bg-red-500/20 shadow-sm ring-2 ring-red-500/30'
                          : 'border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: boss.color }}
                        >
                          {boss.name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{boss.name}</span>
                          <span className="text-[10px] text-red-600 dark:text-red-400 block">{boss.title}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                        HP: <strong className="text-neutral-900 dark:text-white">{boss.maxHp}</strong> • ATK: <strong className="text-neutral-900 dark:text-white">{boss.attackDamage}</strong>
                      </div>
                      <div className="mt-1 text-[9px] font-semibold text-amber-500 dark:text-amber-400">
                        Map: {bossMapName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                <option value="magma_cavern">Magma Core Caverns</option>
                <option value="ancient_colosseum">Ancient Roman Colosseum</option>
                <option value="quantum_void">Deep Quantum Void</option>
                <option value="toxic_factory">Toxic Chemical Factory</option>
                <option value="frozen_summit">Frozen Summit Peaks</option>
                <option value="haunted_crypt">Haunted Crypt Graveyard</option>
                <option value="neon_downtown">Neon Downtown Rain</option>
                <option value="desert_ruins">Desert Ruins of Giza</option>
                <option value="boss_titan_citadel">🌋 Titan Magma Citadel (Boss Map)</option>
                <option value="boss_reaper_crypt">🌌 Reaper Nether Crypt (Boss Map)</option>
                <option value="boss_dragon_fortress">⚡ Dragon Mech Sky Fortress (Boss Map)</option>
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
