export type HeroClass = 'SHARDANA' | 'JANA' | 'GIGANTE' | 'ACCABADORA';
export type HeroGrade = 'C' | 'R' | 'S' | 'SR';
export type ElementType = 'OSSIDIANA' | 'ACQUA' | 'PIETRA' | 'VENTO';

export interface Equipment {
  id: string;
  name: string;
  type: 'WEAPON' | 'AMULET';
  statBonus: {
    hp?: number;
    atk?: number;
    def?: number;
  };
  icon: string;
}

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  grade: HeroGrade;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  criticalChance: number;
  element?: ElementType;
  
  // Real-time battle parameters
  skillName: string;
  skillCastTime: number; // in seconds, time to cast
  skillCooldown: number; // in seconds, cooldown time
  skillTimer: number;    // tracking time to next cast in real-time loop
  skillReady: boolean;

  // Web and progression parameters
  starRank?: number;
  baseHp?: number;
  baseAtk?: number;
  baseDef?: number;
  icon?: string;
  desc?: string;
  image?: string;

  // Equipment parameters
  equipWeapon?: Equipment;
  equipAmulet?: Equipment;

  // Temporary combat buff (reset each fight — used by GIGANTE shield skill)
  tempCombatDef?: number;
}

export type EnemyType = 'COMMON' | 'ELITE' | 'BOSS';

export interface Enemy {
  name: string;
  type: EnemyType;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  element?: ElementType;
  skills: {
    name: string;
    damage: number;
    cooldown: number;
    timer: number;
    type?: 'DAMAGE' | 'AOE' | 'HEAL' | 'DEBUFF';
  }[];
}

export type CellType = 'COINS' | 'GEMS' | 'TEMPLE' | 'TRAP' | 'COMMON_ENEMY' | 'ELITE_ENEMY' | 'BOSS' | 'MERCHANT' | 'DECISION' | 'ACCAMPAMENTO';

export interface Cell {
  id: number;
  type: CellType;
  name: string;
  value: number; // Monete, Gemme, o percentuale malus o valore acquisti
}

export interface GameState {
  // Meta-progressione permanente (fuori dalla mappa)
  profileLevel: number;
  profileExp: number;
  eternalGems: number;
  unlockedCollection: string[]; // Eroi sbloccati permanentemente (nomi)

  // Sessione di gioco attuale (Mappa attuale)
  currentLevel: number;
  playerPosition: number; // Indice della casella da 0 a MaxCaselle - 1
  coins: number;
  gems: number;
  team: Hero[]; // Squadra attiva di massimo 5 eroi
  inventory: Hero[]; // Inventario riserve
  equipmentInventory: Equipment[]; // Inventario equipaggiamento
  language: 'en' | 'it';
  pityCounter: number; // pulls since last SR (soft pity at 40, hard pity at 60)
}

