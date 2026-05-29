import { BoardManager } from './BoardManager';
import { CombatEngine } from './CombatEngine';
import { Hero, Cell, GameState, HeroClass, HeroGrade, ElementType, Equipment, CellType, EnemyType, Enemy } from './types';
import { AudioSynth } from './AudioSynth';
import { HEROES, HEROES_BY_NAME, HeroTemplate, HeroEntry, Translation } from './data/heroes';

// ─── TEMPLATE E COSTANTI ───

// Hero templates accessed via HEROES record from data/heroes.ts
// e.g. HEROES.SHARDANA_SR.template, HEROES_BY_NAME['Amsicora'].localized
// Convenience alias for template-only lookups used in gacha/codex
const HERO_TEMPLATES: Record<string, HeroTemplate> = Object.fromEntries(
  Object.entries(HEROES).map(([k, v]) => [k, v.template])
);

const ECONOMY = {
  PULL_SINGLE: 10,
  PULL_MULTI: 90,
  RATE_SR_BASE: 2,
  RATE_S: 8,
  RATE_R: 20,
  RATE_C: 70,
  PITY_SOFT: 40,        // pull da cui inizia la pity incrementale
  PITY_SOFT_BONUS: 5,   // % extra SR per ogni pull oltre PITY_SOFT
  PITY_HARD: 60,        // garantisce SR
  STAGE_CLEAR_GEMS_BASE: 40,
  STAGE_CLEAR_GEMS_PER_LVL: 5,
  STAGE_CLEAR_EXP_BASE: 100,
  STAGE_CLEAR_EXP_PER_LVL: 50,
} as const;

const SCENARIOS_LOCALIZED: { id: number; name: Translation; desc: Translation }[] = [
  { id: 1, name: { it: "Tappa 1: Nuraghe Losa", en: "Stage 1: Nuraghe Losa" }, desc: { it: "Il sentiero dei Mamuthones selvaggi", en: "The wild Mamuthones trail" } },
  { id: 2, name: { it: "Tappa 2: Domus de Janas di Sedini", en: "Stage 2: Domus de Janas of Sedini" }, desc: { it: "La dimora delle fate incantate", en: "The enchanted fairies' house" } },
  { id: 3, name: { it: "Tappa 3: Tomba dei Giganti di Coddu Vecchiu", en: "Stage 3: Giants' Tomb of Coddu Vecchiu" }, desc: { it: "Il risveglio dei basalti antichi", en: "The awakening of ancient basalts" } },
  { id: 4, name: { it: "Tappa 4: Monte d'Accoddi", en: "Stage 4: Monte d'Accoddi" }, desc: { it: "La ziggurat dell'antico sole", en: "The ancient sun ziggurat" } },
  { id: 5, name: { it: "Tappa 5: Pozzo Sacro di Santa Cristina", en: "Stage 5: Holy Well of Santa Cristina" }, desc: { it: "Il riflesso lunare della sapienza", en: "The lunar reflection of wisdom" } },
  { id: 6, name: { it: "Tappa 6: Grotte di Nettuno", en: "Stage 6: Neptune's Grotto" }, desc: { it: "Il labirinto sommerso delle sirene sarde", en: "The submerged maze of Sardinian sirens" } },
  { id: 7, name: { it: "Tappa 7: Su Nuraxi di Barumini", en: "Stage 7: Su Nuraxi of Barumini" }, desc: { it: "La fortezza del re Shardana", en: "The fortress of the Shardana king" } },
  { id: 8, name: { it: "Tappa 8: Foresta di Burgos", en: "Stage 8: Burgos Forest" }, desc: { it: "Le ombre dei cervi sacri", en: "The shadows of sacred stags" } },
  { id: 9, name: { it: "Tappa 9: Dune di Piscinas", en: "Stage 9: Dunes of Piscinas" }, desc: { it: "Il deserto dorato degli spiriti della sabbia", en: "The golden desert of sand spirits" } },
  { id: 10, name: { it: "Tappa 10: Altare Rupestre di Santo Stefano", en: "Stage 10: Rock Altar of Santo Stefano" }, desc: { it: "I misteri preistorici incisi nella roccia", en: "Prehistoric mysteries carved in stone" } },
  { id: 11, name: { it: "Tappa 11: Monte Ortobene", en: "Stage 11: Mount Ortobene" }, desc: { it: "La vetta sacra dei Giganti silenti", en: "The sacred summit of silent Giants" } },
  { id: 12, name: { it: "Tappa 12: Is Zuddas", en: "Stage 12: Is Zuddas" }, desc: { it: "Le sculture di aragonite aghiforme", en: "The needle-like aragonite sculptures" } },
  { id: 13, name: { it: "Tappa 13: Tharros antica", en: "Stage 13: Ancient Tharros" }, desc: { it: "Le rovine fenicie lambite dal mare", en: "Phoenician ruins lapped by the sea" } },
  { id: 14, name: { it: "Tappa 14: Barbagia Selvaggia", en: "Stage 14: Wild Barbagia" }, desc: { it: "I sentieri della maschera rituale", en: "The paths of the ritual mask" } },
  { id: 15, name: { it: "Tappa 15+: Tempio di Antas", en: "Stage 15+: Temple of Antas" }, desc: { it: "L'unione eterna con il Sardus Pater", en: "The eternal union with the Sardus Pater" } }
];

// Dati visivi per i 15 stage — palette placeholder + icona + path immagine finale
interface StageVisual {
  icon: string;
  gradient: string; // CSS linear-gradient
  accentColor: string;
}

const STAGE_VISUALS: StageVisual[] = [
  // 1 Nuraghe Losa — PIETRA
  { icon: '🏛️', gradient: 'linear-gradient(160deg, #1e1610 0%, #3d2e1a 45%, #6b4e28 100%)', accentColor: '#c8a76b' },
  // 2 Domus de Janas di Sedini — VENTO/fate
  { icon: '🧚', gradient: 'linear-gradient(160deg, #1a1010 0%, #5a3520 45%, #9a7040 100%)', accentColor: '#d4956a' },
  // 3 Tomba dei Giganti di Coddu Vecchiu — PIETRA
  { icon: '🪨', gradient: 'linear-gradient(160deg, #0d0c0a 0%, #252018 45%, #403828 100%)', accentColor: '#a09070' },
  // 4 Monte d'Accoddi — OSSIDIANA/sole
  { icon: '⛩️', gradient: 'linear-gradient(160deg, #1a0c00 0%, #5a2a00 45%, #c85a00 100%)', accentColor: '#e07a20' },
  // 5 Pozzo Sacro di Santa Cristina — ACQUA/luna
  { icon: '💧', gradient: 'linear-gradient(160deg, #050818 0%, #0d1e4a 45%, #1a3a8a 100%)', accentColor: '#4a8adb' },
  // 6 Grotte di Nettuno — ACQUA
  { icon: '🌊', gradient: 'linear-gradient(160deg, #000e14 0%, #0a3040 45%, #0d6070 100%)', accentColor: '#20b0c0' },
  // 7 Su Nuraxi di Barumini — PIETRA
  { icon: '🏰', gradient: 'linear-gradient(160deg, #160e08 0%, #3a2818 45%, #6a4830 100%)', accentColor: '#b07840' },
  // 8 Foresta di Burgos — VENTO
  { icon: '🦌', gradient: 'linear-gradient(160deg, #040e06 0%, #0e2a12 45%, #1e4a20 100%)', accentColor: '#4a9a50' },
  // 9 Dune di Piscinas — VENTO
  { icon: '🏜️', gradient: 'linear-gradient(160deg, #140c00 0%, #4a3000 45%, #b07800 100%)', accentColor: '#e0b030' },
  // 10 Altare Rupestre di Santo Stefano — PIETRA
  { icon: '⚱️', gradient: 'linear-gradient(160deg, #1a0808 0%, #4a1a10 45%, #8a3020 100%)', accentColor: '#c05030' },
  // 11 Monte Ortobene — VENTO
  { icon: '⛰️', gradient: 'linear-gradient(160deg, #060c1a 0%, #102040 45%, #1a3a7a 100%)', accentColor: '#3a70c0' },
  // 12 Is Zuddas — ACQUA/cristalli
  { icon: '💎', gradient: 'linear-gradient(160deg, #0c0818 0%, #201040 45%, #401870 100%)', accentColor: '#9060d0' },
  // 13 Tharros antica — ACQUA
  { icon: '🏺', gradient: 'linear-gradient(160deg, #040810 0%, #0a1a40 45%, #143070 100%)', accentColor: '#2060c0' },
  // 14 Barbagia Selvaggia — OSSIDIANA
  { icon: '🎭', gradient: 'linear-gradient(160deg, #080202 0%, #200808 45%, #3a0808 100%)', accentColor: '#a01010' },
  // 15 Tempio di Antas — OSSIDIANA
  { icon: '🌿', gradient: 'linear-gradient(160deg, #0a0800 0%, #2a1e00 45%, #504000 100%)', accentColor: '#c0a000' },
];

const LOCALIZATION_DICTIONARY: Record<string, Translation> = {
  'lbl-header-level': { en: "LV.", it: "LIV." },
  'btn-settings': { en: "Reset Save", it: "Reset Salvataggio" },
  'btn-toggle-audio': { en: "Mute", it: "Attiva Audio" },
  'btn-toggle-frame': { en: "Fullscreen", it: "Schermo Intero" },
  'btn-toggle-lang': { en: "🇬🇧", it: "🇮🇹" },
  
  // Home Screen
  'nav-lbl-home': { en: "Home", it: "Home" },
  'ui-profile-name': { en: "Sardinian Explorer", it: "Viaggiatore Sardo" },
  'lbl-adventure-title': { en: "CURRENT EXPLORATION", it: "ESPLORAZIONE ATTUALE" },
  'lbl-starter-deck-header': { en: "STARTING TEAM (STARTER DECK)", it: "SQUADRA DI PARTENZA (STARTER DECK)" },
  'lbl-premium-shop-desc': { en: "Trade obsidian for premium Eternal Gems or purchase Sandbox Packs.", it: "Scambia Ossidiana per Gemme Primordiali o acquista pacchetti Premium." },
  'lbl-btn-open-premium-shop': { en: "OPEN SHOP 🛒", it: "APRI SHOP 🛒" },
  'lbl-btn-start-adventure': { en: "START VIAGGIO ➔", it: "INIZIA VIAGGIO ➔" },
  'lbl-home-summon-shortcut-title': { en: "SUMMONING ALTAR", it: "ALTARE DELLE EVOCAZIONI" },
  'lbl-home-summon-shortcut-desc': { en: "Permanently summon and expand your collection of mythological heroes.", it: "Evoca ed espandi permanentemente la tua collezione di eroi mitologici." },
  'lbl-btn-home-go-to-altar': { en: "SUMMON ALTAR ➔", it: "ALTARE DI EVOCAZIONE ➔" },
  'lbl-roster-select-title': { en: "Starting Roster ⚔️", it: "Roster di Partenza ⚔️" },
  'lbl-roster-select-subtitle': { en: "Choose 3 permanently unlocked heroes to start your journey.", it: "Scegli 3 eroi sbloccati permanentemente per iniziare il viaggio." },
  
  // Premium Shop Modal
  'lbl-premium-shop-title': { en: "Temple of Gems 🔮", it: "Bottega delle Gemme 🔮" },
  'lbl-premium-shop-subtitle': { en: "Acquire premium Eternal Gems to permanently awaken and expand your mythological Codex!", it: "Acquista Gemme Primordiali per evocare ed espandere permanentemente la tua collezione!" },
  'lbl-exchange-header': { en: "In-Game Obsidian Trade", it: "Scambio Ossidiana In-Game" },
  'lbl-exchange-desc': { en: "Convert 100 in-game Obsidian to obtain 10 Eternal Gems", it: "Converti 100 Ossidiane in-game per ottenere 10 Gemme Primordiali" },

  // Board Screen
  'nav-lbl-board': { en: "Board", it: "Tavola" },
  'dice-img': { en: "Roll Dice", it: "Lancia Dado" },
  
  // Combat Screen
  'screen-combat-title': { en: "REAL-TIME COMBAT", it: "SCONTRO IN TEMPO REALE" },
  'btn-auto-on': { en: "AUTO: ON 🤖", it: "AUTO: SI 🤖" },
  'btn-auto-off': { en: "AUTO: OFF 🤖", it: "AUTO: NO 🤖" },
  'lbl-skill-ready': { en: "TAP ⚡", it: "PRONTO ⚡" },
  
  // Team Screen
  'nav-lbl-team': { en: "Team", it: "Squadra" },
  'team-banner-title': { en: "Your Sardinian Warriors", it: "I tuoi Guerrieri Sardi" },
  'team-banner-desc': { en: "Drag or click heroes to sort them in your active team of 5", it: "Trascina o clicca gli eroi per ordinarli nella squadra attiva di 5" },
  'team-active-header': { en: "ACTIVE TEAM (5 SLOTS)", it: "SQUADRA ATTIVA (5 SLOT)" },
  'team-reserve-header': { en: "RESERVE / HERO INVENTORY", it: "RISERVA / INVENTARIO EROI" },
  'btn-reset-team-screen': { en: "Reset Game 🔄", it: "Reset Gioco 🔄" },
  
  // Codex Screen
  'nav-lbl-codex': { en: "Codex", it: "Codice" },
  'codex-banner-title': { en: "Nuragic Codex", it: "Nuragic Codex" },
  'codex-banner-desc': { en: "Collect Sardinian heroes and unlock their mythological secrets", it: "Colleziona gli eroi sardi e sblocca i loro segreti mitologici" },
  'lbl-codex-progress': { en: "UNLOCKED COLLECTION: ", it: "COLLEZIONE SBLOCCATA: " },
  
  // Summon (Gacha) Screen
  'nav-lbl-gacha': { en: "Summon", it: "Altare" },
  'gacha-banner-title': { en: "Summoning Altar", it: "Altare delle Evocazioni" },
  'gacha-banner-desc': { en: "Spend gems to awaken ancient Sardinian warriors", it: "Spendi le gemme per risvegliare antichi guerrieri sardi" },
  'gacha-rates-title': { en: "SUMMONING PROBABILITIES", it: "PROBABILITÀ DI EVOCAZIONE" },
  
  // Hero Inspect Popup
  'inspect-stat-hp-lbl': { en: "MAX HP", it: "HP MAX" },
  'inspect-stat-atk-lbl': { en: "ATK", it: "ATK" },
  'inspect-stat-def-lbl': { en: "DEF", it: "DEF" },
  'inspect-stat-cd-lbl': { en: "CD", it: "CD" },
  'inspect-equip-lbl': { en: "EQUIPPED BRONZETTI", it: "BRONZETTI EQUIPAGGIATI" },
  'inspect-weapon-empty': { en: "Empty Weapon", it: "Arma vuota" },
  'inspect-amulet-empty': { en: "Empty Amulet", it: "Amuleto vuoto" },
  'btn-hero-level-up-lbl': { en: "UPGRADE (LV. ", it: "POTENZIA (LIV. " },
  'btn-hero-fuse-lbl': { en: "FUSE DUPLICATE", it: "FONDI DUPLICATO" },
  'btn-hero-sell-lbl': { en: "SELL / DISMISS HERO", it: "VENDI / CONGEDA EROE" },
  'lbl-fuse-none': { en: "No Duplicate", it: "Nessun Duplicato" },
  'lbl-fuse-ready': { en: "Fuse Duplicate (Max Stars: 5)", it: "Fondi Duplicato (Max Stelle: 5)" },
  'lbl-fuse-maxed': { en: "Evolution Level Maxed!", it: "Evoluzione al Livello Massimo!" },
  
  // Equip Select Popup
  'equip-select-title': { en: "Select Bronzetto", it: "Seleziona Bronzetto" },
  'equip-select-desc': { en: "Choose equipment from inventory to assign to hero", it: "Scegli un equipaggiamento dall'inventario da assegnare all'eroe" },
  'btn-unequip': { en: "Remove Equipment ❌", it: "Rimuovi Equipaggiamento ❌" },
  
  // Merchant Popup
  'merchant-title': { en: "Shardana Shop", it: "Bottega del Shardana" },
  'merchant-desc': { en: "\"Welcome traveler! Exchange your shardana gold coins for precious goods for your battles.\"", it: "\"Benvenuto viaggiatore! Scambia le tue monete d'oro shardana con merci preziose per le tue battaglie.\"" },
  'btn-merchant-close': { en: "Leave Shop ➔", it: "Congedati ➔" },
  
  // Decision Popup
  'decision-title': { en: "Choice of Destiny", it: "Scelta del Destino" },
  'btn-choice-risky-lbl': { en: "RISKY EXPLORATION", it: "ESPLORA CON RISCHIO" },
  'btn-choice-risky-sub': { en: "50% Obsidian Gems | 50% Rockslide Trap", it: "50% Gemme d'Ossidiana | 50% Frana Trap" },
  'btn-choice-safe-lbl': { en: "SAFE PATH", it: "SENTIERO SICURO" },
  'btn-choice-safe-sub': { en: "Receive 150 Coins safely", it: "Ricevi 150 Monete in sicurezza" }
};

const BRONZE_EQUIPMENTS: Omit<Equipment, 'id'>[] = [
  { name: 'Spada di Bronzo Shardana', type: 'WEAPON', statBonus: { atk: 15 }, icon: '⚔️' },
  { name: 'Pugnale di Ossidiana', type: 'WEAPON', statBonus: { atk: 25, def: -2 }, icon: '🗡️' },
  { name: 'Scudo di Basalto', type: 'AMULET', statBonus: { def: 6 }, icon: '🛡️' },
  { name: 'Pendente Nuragico Sacro', type: 'AMULET', statBonus: { hp: 80 }, icon: '📿' },
  { name: 'Amuleto Sole Shardana', type: 'AMULET', statBonus: { hp: 50, atk: 5 }, icon: '☀️' }
];

const STORAGE_KEY = 'aijo_dice_gacha_save';

// Helper per instanziare un eroe con livello, stelle e statistiche base per level up
function instantiateHero(template: HeroTemplate): Hero {
  const id = 'h_' + Math.random().toString(36).substring(2, 11);
  return {
    id,
    name: template.name,
    heroClass: template.heroClass,
    grade: template.grade,
    level: 1,
    maxHp: template.maxHp,
    currentHp: template.maxHp,
    attack: template.attack,
    defense: template.defense,
    criticalChance: template.grade === 'SR' ? 0.15 : (template.grade === 'S' ? 0.12 : (template.grade === 'R' ? 0.08 : 0.05)),
    element: template.element,

    skillName: template.skillName,
    skillCastTime: 0.5,
    skillCooldown: template.skillCooldown,
    skillTimer: 0,
    skillReady: false,

    starRank: 0,
    baseHp: template.maxHp,
    baseAtk: template.attack,
    baseDef: template.defense,
    icon: template.icon,
    desc: template.desc,
    image: template.image
  };
}

// Ricalcola le statistiche attuali basandosi su livello, stelle ed EQUIPAGGIAMENTO
function recalculateHeroStats(hero: Hero) {
  const levelMult = 1 + (hero.level - 1) * 0.05; // +5% per livello
  const starMult = 1 + (hero.starRank || 0) * 0.20;     // +20% per stella
  
  let baseH = hero.baseHp || hero.maxHp;
  let baseA = hero.baseAtk || hero.attack;
  let baseD = hero.baseDef || hero.defense;

  // Applica moltiplicatori
  hero.maxHp = Math.round(baseH * levelMult * starMult);
  hero.attack = Math.round(baseA * levelMult * starMult);
  hero.defense = Math.round(baseD * levelMult * starMult);

  // Applica bonus flat degli equipaggiamenti!
  if (hero.equipWeapon) {
    if (hero.equipWeapon.statBonus.hp) hero.maxHp += hero.equipWeapon.statBonus.hp;
    if (hero.equipWeapon.statBonus.atk) hero.attack += hero.equipWeapon.statBonus.atk;
    if (hero.equipWeapon.statBonus.def) hero.defense += hero.equipWeapon.statBonus.def;
  }
  if (hero.equipAmulet) {
    if (hero.equipAmulet.statBonus.hp) hero.maxHp += hero.equipAmulet.statBonus.hp;
    if (hero.equipAmulet.statBonus.atk) hero.attack += hero.equipAmulet.statBonus.atk;
    if (hero.equipAmulet.statBonus.def) hero.defense += hero.equipAmulet.statBonus.def;
  }
  
  // Cooldown ridotto di -0.2s per stella (minimo 1.0s)
  const template = Object.values(HERO_TEMPLATES).find(t => t.name === hero.name);
  const origCD = template ? template.skillCooldown : hero.skillCooldown;
  hero.skillCooldown = parseFloat(Math.max(1.0, origCD - (hero.starRank || 0) * 0.2).toFixed(1));
}

function getHeroAvatarHtml(hero: { icon?: string; image?: string }, isIdle = true, mode: 'card' | 'compact' | 'large' = 'card'): string {
  const idleClass = isIdle ? ' avatar-idle' : '';
  if (hero.image) {
    const containerClass = mode === 'compact' ? 'avatar-compact' : (mode === 'large' ? 'avatar-large' : 'avatar-card');
    const fallbackClass = mode === 'compact' ? 'avatar-icon-compact' : (mode === 'large' ? 'avatar-icon-large' : 'avatar-icon-card');
    return `
      <div class="${containerClass}">
        <img class="avatar-image${idleClass}" src="assets/art/heroes/${hero.image}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="${fallbackClass}" style="display: none;">${hero.icon || '👤'}</div>
      </div>
    `;
  }
  const iconClass = mode === 'compact' ? 'avatar-icon-compact' : (mode === 'large' ? 'avatar-icon-large' : 'avatar-icon-card');
  return `<div class="${iconClass}">${hero.icon || '👤'}</div>`;
}

function getRarityFrameSrc(grade: HeroGrade): string {
  const map: Record<HeroGrade, string> = {
    C:  'assets/art/ui_frame_common.svg',
    R:  'assets/art/ui_frame_rare.svg',
    S:  'assets/art/ui_frame_special.svg',
    SR: 'assets/art/ui_frame_super_rare.svg',
  };
  return map[grade];
}

interface FramedCardOptions {
  showLevel?: boolean;
  showStars?: boolean;
  showElem?: boolean;
  showInspect?: boolean;
  isIdle?: boolean;
}

function buildFramedCardInner(
  hero: { icon?: string; image?: string; name: string; grade: HeroGrade; starRank?: number; level?: number; element?: ElementType },
  opts: FramedCardOptions = {}
): string {
  const { showLevel = false, showStars = false, showElem = false, showInspect = false, isIdle = true } = opts;

  const frameSrc = getRarityFrameSrc(hero.grade);
  const idleClass = isIdle ? ' avatar-idle' : '';

  const artHtml = hero.image
    ? `<img class="card-hero-art${idleClass}" src="assets/art/heroes/${hero.image}" alt="${hero.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
       <div class="card-hero-emoji" style="display:none;">${hero.icon || '👤'}</div>`
    : `<div class="card-hero-emoji">${hero.icon || '👤'}</div>`;

  const starsHtml = showStars && (hero.starRank || 0) > 0
    ? `<div class="card-stars-overlay">${'⭐'.repeat(hero.starRank || 0)}</div>`
    : '';

  const levelHtml = showLevel && hero.level
    ? `<div class="card-level-overlay">LV.${hero.level}</div>`
    : '';

  const elemHtml = showElem && hero.element
    ? `<div class="card-elem-overlay">${getElementEmoji(hero.element)}</div>`
    : '';

  const inspectHtml = showInspect
    ? `<button class="card-inspect-btn inspect-btn-trigger" title="Dettagli">🔍</button>`
    : '';

  return `
    <img class="card-frame-bg" src="${frameSrc}" alt="">
    ${artHtml}
    <span class="card-grade-badge ${hero.grade.toLowerCase()}">${hero.grade}</span>
    ${starsHtml}
    <div class="card-hero-name-overlay">${hero.name}</div>
    ${levelHtml}
    ${elemHtml}
    ${inspectHtml}
  `;
}

function getEnemyAvatarHtml(type: EnemyType): string {
  let emoji = '👹';
  let image = 'enemy_common.png';
  if (type === 'ELITE') {
    emoji = '👾';
    image = 'enemy_elite.png';
  } else if (type === 'BOSS') {
    emoji = '🔱';
    image = 'enemy_boss.png';
  }
  return `
    <div style="height: 72px; display: flex; align-items: center; justify-content: center; position: relative; width: 100%;">
      <img class="avatar-image avatar-idle" src="assets/art/heroes/${image}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="max-height: 72px;">
      <div style="font-size: 2.2rem; display: none;">${emoji}</div>
    </div>
  `;
}


function calculateHeroSellValue(hero: Hero): number {
  let baseValue = 100;
  if (hero.grade === 'R') baseValue = 250;
  else if (hero.grade === 'S') baseValue = 600;
  else if (hero.grade === 'SR') baseValue = 1500;

  // Aggiunge valore dei duplicati fusi (starRank)
  const duplicatesCount = hero.starRank || 0;
  const duplicateValue = duplicatesCount * baseValue;

  // Aggiunge un rimborso parziale per il livello (50% dell'oro speso)
  let levelRefund = 0;
  if (hero.level > 1) {
    levelRefund = Math.round(37.5 * hero.level * (hero.level - 1));
  }

  return baseValue + duplicateValue + levelRefund;
}

// ─── CANVAS PARTICLE SYSTEM ───

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity?: number;
  shape?: 'circle' | 'star' | 'emoji';
  emoji?: string;
}

class ParticleManager {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static particles: Particle[] = [];
  private static loopActive = false;

  public static init() {
    this.canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private static resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    }
  }

  private static startLoop() {
    if (this.loopActive) return;
    this.loopActive = true;
    this.tick();
  }

  private static tick() {
    if (!this.loopActive) return;
    this.update();
    this.draw();

    if (this.particles.length === 0) {
      this.loopActive = false;
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }

    requestAnimationFrame(() => this.tick());
  }

  private static update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.gravity !== undefined) {
        p.vy += p.gravity;
      }
      
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private static draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      this.ctx!.save();
      this.ctx!.globalAlpha = p.alpha;
      
      if (p.shape === 'emoji' && p.emoji) {
        this.ctx!.font = `${p.size}px serif`;
        this.ctx!.textAlign = 'center';
        this.ctx!.textBaseline = 'middle';
        this.ctx!.fillText(p.emoji, p.x, p.y);
      } else {
        this.ctx!.fillStyle = p.color;
        this.ctx!.shadowBlur = p.size * 1.5;
        this.ctx!.shadowColor = p.color;
        
        this.ctx!.beginPath();
        this.ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx!.fill();
      }
      this.ctx!.restore();
    });
  }

  public static spawnDiceTrail(x: number, y: number) {
    this.resizeCanvas();
    const count = 2;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: (Math.random() * 2 - 1) * 0.4,
        vy: (Math.random() * 2 - 1) * 0.4,
        alpha: 0.7,
        decay: 0.04 + Math.random() * 0.02,
        color: '#ffd700', 
        size: 2.5 + Math.random() * 2
      });
    }
    this.startLoop();
  }

  public static spawnExplosion(x: number, y: number, color: string, count = 25) {
    this.resizeCanvas();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        color,
        size: 2.0 + Math.random() * 2.5,
        gravity: 0.06
      });
    }
    this.startLoop();
  }

  public static spawnGachaReveal(x: number, y: number, grade: HeroGrade) {
    let color = '#8e9aa6'; 
    let count = 12;
    if (grade === 'R') { color = '#3182ce'; count = 20; }
    else if (grade === 'S') { color = '#805ad5'; count = 35; }
    else if (grade === 'SR') { color = '#c8a76b'; count = 60; }

    this.spawnExplosion(x, y, color, count);

    if (grade === 'SR' || grade === 'S') {
      const starsCount = grade === 'SR' ? 8 : 4;
      for (let i = 0; i < starsCount; i++) {
        this.particles.push({
          x: x + (Math.random() * 30 - 15),
          y: y + (Math.random() * 30 - 15),
          vx: (Math.random() * 2 - 1) * 0.4,
          vy: -0.8 - Math.random() * 1.2,
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.01,
          color: '#fff4d4',
          size: 3 + Math.random() * 2,
          gravity: -0.01
        });
      }
    }
  }

  public static spawnElementalCascade(x: number, y: number, element: ElementType) {
    this.resizeCanvas();
    let emoji = '✨';
    let color = '#ffd700';
    
    if (element === 'OSSIDIANA') { emoji = '🔥'; color = '#E63946'; }
    else if (element === 'ACQUA') { emoji = '💧'; color = '#3182ce'; }
    else if (element === 'PIETRA') { emoji = '🧱'; color = '#c8a76b'; }
    else if (element === 'VENTO') { emoji = '🌬️'; color = '#805ad5'; }

    const canvasWidth = this.canvas ? this.canvas.width : 320;
    const canvasHeight = this.canvas ? this.canvas.height : 568;

    for (let i = 0; i < 30; i++) {
      const startX = Math.random() * canvasWidth;
      const startY = Math.random() * (canvasHeight * 0.3); 

      const useEmoji = Math.random() < 0.35;
      
      this.particles.push({
        x: startX,
        y: startY,
        vx: (Math.random() * 2 - 1) * 0.8,
        vy: 1.5 + Math.random() * 2.0, 
        alpha: 0.85,
        decay: 0.012 + Math.random() * 0.01,
        color,
        size: useEmoji ? (10 + Math.random() * 6) : (2.5 + Math.random() * 3),
        shape: useEmoji ? 'emoji' : 'circle',
        emoji,
        gravity: 0.04
      });
    }
    
    this.startLoop();
  }
}

// ─── STATO DI GIOCO ───

interface GameWebState {
  // Meta-progressione permanente (fuori dalla mappa)
  profileLevel: number;
  profileExp: number;
  eternalGems: number;
  unlockedCollection: string[]; // Nomi degli eroi sbloccati permanentemente

  // Sessione di gioco attuale (Mappa attuale)
  level: number;
  playerPosition: number;
  coins: number;
  gems: number;
  team: Hero[];
  inventory: Hero[];
  equipmentInventory: Equipment[];
  language: 'en' | 'it';
  startingRosterNames: string[]; // I 3 eroi scelti all'avvio della run (ripristinati a ogni morte/fine mappa)
  pityCounter: number; // pull senza SR (soft pity a 40, hard pity a 60)
}

const gameState: GameWebState = {
  profileLevel: 1,
  profileExp: 0,
  eternalGems: 80, // Abbastanza per 8 evocazioni o IAP di prova immediati
  unlockedCollection: ['Josto', 'Bruncu', 'Caddozzo'], // Starter Deck base

  level: 1,
  playerPosition: 0,
  coins: 0, // Inizia a 0 prima di entrare in mappa
  gems: 0,  // Inizia a 0 prima di entrare in mappa
  team: [],
  inventory: [],
  equipmentInventory: [
    { id: 'eq1', name: 'Spada di Bronzo Shardana', type: 'WEAPON', statBonus: { atk: 15 }, icon: '⚔️' },
    { id: 'eq2', name: 'Pendente Nuragico Sacro', type: 'AMULET', statBonus: { hp: 80 }, icon: '📿' },
    { id: 'eq3', name: 'Scudo di Basalto', type: 'AMULET', statBonus: { def: 5 }, icon: '🛡️' }
  ],
  language: 'it',
  startingRosterNames: ['Josto', 'Bruncu', 'Caddozzo'],
  pityCounter: 0
};

const GameStorage = {
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  },
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        gameState.profileLevel = parsed.profileLevel || 1;
        gameState.profileExp = parsed.profileExp || 0;
        gameState.eternalGems = parsed.eternalGems !== undefined ? parsed.eternalGems : 80;
        gameState.unlockedCollection = parsed.unlockedCollection || ['Josto', 'Bruncu', 'Caddozzo'];

        gameState.level = parsed.level || 1;
        gameState.playerPosition = parsed.playerPosition || 0;
        gameState.coins = parsed.coins !== undefined ? parsed.coins : 0;
        gameState.gems = parsed.gems !== undefined ? parsed.gems : 0;
        gameState.language = parsed.language || 'it';
        gameState.startingRosterNames = parsed.startingRosterNames || ['Josto', 'Bruncu', 'Caddozzo'];
        gameState.pityCounter = parsed.pityCounter || 0;

        if (parsed.team) gameState.team = parsed.team;
        if (parsed.inventory) gameState.inventory = parsed.inventory;
        if (parsed.equipmentInventory) gameState.equipmentInventory = parsed.equipmentInventory;

        // Auto-unlock migration per gli eroi posseduti nel salvataggio
        const currentHeroNames = [
          ...gameState.team.map(h => h.name),
          ...gameState.inventory.map(h => h.name)
        ];
        currentHeroNames.forEach(name => {
          if (!gameState.unlockedCollection.includes(name)) {
            gameState.unlockedCollection.push(name);
          }
        });

        return true;
      }
    } catch (e) {
      console.error('Errore nel caricamento del salvataggio:', e);
    }
    // Per un nuovo gioco, garantisce gli eroi di default sbloccati
    const defaultUnlocks = ['Josto', 'Bruncu', 'Caddozzo'];
    defaultUnlocks.forEach(name => {
      if (!gameState.unlockedCollection.includes(name)) {
        gameState.unlockedCollection.push(name);
      }
    });
    return false;
  },
  reset() {
    if (confirm(gameState.language === 'it' ? "Sei sicuro di voler resettare tutti i progressi e gli eroi sbloccati?" : "Are you sure you want to reset all progress and unlocked heroes?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }
};

let board: Cell[] = [];
let isRolling = false;
let combatInterval: number | null = null;
let selectedInspectHero: Hero | null = null;
let selectedInspectIndex: number | null = null;
let selectedInspectArea: string | null = null;
let selectedEquipSlotType: 'WEAPON' | 'AMULET' | null = null;

// ─── INIZIALIZZAZIONE ───

window.addEventListener('DOMContentLoaded', () => {
  // Carica i salvataggi locali (se presenti)
  GameStorage.load();

  initClock();
  initNavigation();
  initBoard();
  initTeamSlots();
  initGachaStore();
  initLandmarkPopup();
  initMerchantAndDecisionListeners();
  updateUI();
  
  // Event Listeners
  document.getElementById('btn-roll-dice')!.addEventListener('click', rollDice);
  document.getElementById('btn-popup-close')!.addEventListener('click', closePopup);
  
  // Settings Reset Buttons
  document.getElementById('btn-settings')!.addEventListener('click', GameStorage.reset);
  document.getElementById('btn-reset-team-screen')!.addEventListener('click', GameStorage.reset);
  
  // Inspect Modal Closing
  document.getElementById('btn-close-inspect')!.addEventListener('click', closeHeroInspector);
  document.getElementById('btn-hero-level-up')!.addEventListener('click', levelUpHero);
  document.getElementById('btn-hero-fuse')!.addEventListener('click', fuseHero);
  document.getElementById('btn-hero-sell')!.addEventListener('click', sellHero);

  // Equip Selection Modal Closing
  document.getElementById('btn-close-equip-select')!.addEventListener('click', () => {
    document.getElementById('popup-equip-select')!.classList.remove('active');
  });
  document.getElementById('btn-unequip')!.addEventListener('click', unequipSelectedSlot);

  // Slot click events in inspector
  document.getElementById('slot-weapon')!.addEventListener('click', () => openEquipSelect('WEAPON'));
  document.getElementById('slot-amulet')!.addEventListener('click', () => openEquipSelect('AMULET'));

  // Event Listeners per Schermata Home & Shop Premium
  document.getElementById('btn-start-adventure')!.addEventListener('click', startOrResumeExplorationRun);
  document.getElementById('btn-open-premium-shop')!.addEventListener('click', () => {
    document.getElementById('popup-premium-shop')!.classList.add('active');
  });
  document.getElementById('btn-close-premium-shop')!.addEventListener('click', () => {
    document.getElementById('popup-premium-shop')!.classList.remove('active');
  });
  document.getElementById('btn-convert-gems')!.addEventListener('click', convertExplorationGems);

  // Finti pulsanti acquisto pacchetti IAP
  document.querySelectorAll('.premium-pack-item').forEach(pack => {
    pack.addEventListener('click', () => {
      const gemsVal = parseInt(pack.getAttribute('data-gems')!);
      const priceVal = parseFloat(pack.getAttribute('data-price')!);
      buyPremiumPack(gemsVal, priceVal);
    });
  });

  // Inizializza Gestore Particelle Canvas
  ParticleManager.init();

  // Gestione pulsante Audio
  const btnAudio = document.getElementById('btn-toggle-audio')!;
  btnAudio.addEventListener('click', () => {
    const isMuted = AudioSynth.toggleMute();
    btnAudio.innerText = isMuted ? '🔇' : '🔊';
    btnAudio.setAttribute('title', isMuted ? 'Attiva Audio' : 'Disattiva Audio');
  });

  // Gestione pulsante Frameless (Schermo Intero)
  const btnFrame = document.getElementById('btn-toggle-frame')!;
  btnFrame.addEventListener('click', () => {
    const isFrameless = document.body.classList.toggle('frameless-mode');
    btnFrame.innerText = isFrameless ? '📱' : '🖥️';
    btnFrame.setAttribute('title', isFrameless ? 'Ritorna Emulatore' : 'Schermo Intero');
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  });

  // Gestione pulsante Lingua
  const btnLang = document.getElementById('btn-toggle-lang')!;
  btnLang.addEventListener('click', () => {
    gameState.language = gameState.language === 'en' ? 'it' : 'en';
    applyTranslations();
    GameStorage.save();
    
    // Suonino di conferma
    AudioSynth.playLevelUp();
  });

  // Gestione pulsante Auto-Combat
  const btnAuto = document.getElementById('btn-toggle-auto-combat');
  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      isAutoCombat = !isAutoCombat;
      updateAutoCombatButtonUI();
      AudioSynth.playLevelUp();
    });
  }

  // Chiusura Modale Lore Codex
  document.getElementById('btn-close-codex-lore')!.addEventListener('click', () => {
    document.getElementById('popup-codex-lore')!.classList.remove('active');
  });
  document.getElementById('btn-close-lore-confirm')!.addEventListener('click', () => {
    document.getElementById('popup-codex-lore')!.classList.remove('active');
  });

  // Pulsante Home per andare all'Altare
  document.getElementById('btn-home-go-to-altar')!.addEventListener('click', () => {
    lastScreenBeforeGacha = 'screen-home';
    updateGachaViewMode();
    navigateToScreen('screen-gacha');
    AudioSynth.playLevelUp();
  });

  // Chiusura Roster Selector Popup
  document.getElementById('btn-close-roster-select')!.addEventListener('click', () => {
    document.getElementById('popup-roster-select')!.classList.remove('active');
  });

  // Chiusura Popup Reclutamento (Accampamento / Elite Reward)
  document.getElementById('btn-recruit-close')!.addEventListener('click', () => {
    document.getElementById('popup-recruit')!.classList.remove('active');
  });

  // Conferma Roster Selector Popup
  document.getElementById('btn-roster-confirm')!.addEventListener('click', confirmStartingRosterAndStart);

  // Applica traduzioni all'avvio
  applyTranslations();
});

// Orologio dell'emulatore
function initClock() {
  const clockEl = document.getElementById('real-time-clock')!;
  const updateTime = () => {
    const d = new Date();
    clockEl.innerText = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// Navigazione tra le tab dello smartphone
let lastScreenBeforeGacha = 'screen-home';

function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) {
        const lang = gameState.language || 'it';
        alert(lang === 'it' 
          ? "Devi iniziare un viaggio dalla Home prima di accedere alla Mappa (Board) o alla Squadra!" 
          : "You must start an exploration from Home before accessing the Map Board or session Team!");
        return;
      }
      
      const targetScreen = btn.getAttribute('data-screen')!;
      
      // Salva l'ultimo schermo visitato per determinare la modalità Gacha
      const currentActive = document.querySelector('.screen.active');
      if (currentActive && currentActive.id !== 'screen-gacha') {
        lastScreenBeforeGacha = currentActive.id;
      }

      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetScreen)!.classList.add('active');
      
      // Se torniamo alla tavola, ri-centra la telecamera sul giocatore
      if (targetScreen === 'screen-board') {
        setTimeout(scrollToPlayer, 100);
      }
      
      // Se andiamo al codex, rigenera la griglia
      if (targetScreen === 'screen-codex') {
        renderCodexGrid();
      }

      // Se andiamo alla tab summon, aggiorna la vista
      if (targetScreen === 'screen-gacha') {
        updateGachaViewMode();
      }
    });
  });
}

// Genera e posiziona la Tavola a Serpente (Dinamica in base al livello!)
function initBoard() {
  board = BoardManager.generateBoard(gameState.level);
  
  const container = document.getElementById('board-container')!;
  
  // Rimuovi caselle vecchie (mantieni solo la pedina)
  container.querySelectorAll('.board-cell').forEach(c => c.remove());

  // Calcola il numero di righe per impostare l'altezza minima ed abilitare lo scroll
  const numRows = Math.ceil(board.length / 5);
  container.style.minHeight = `${numRows * 75 + 50}px`;

  board.forEach(cell => {
    const el = document.createElement('div');
    el.className = `board-cell cell-${cell.type.toLowerCase()}`;
    el.id = `cell-${cell.id}`;
    
    // Posizionamento matematico a Serpente (Winding Snake: Destra -> Sinistra -> Destra)
    const { left, top } = getCellSerpentinePosition(cell.id);
    el.style.left = `${left}%`;
    el.style.top = `${top}px`;
    
    // Icona ed ID Casella — tenta PNG generato, fallback emoji
    const numSpan = document.createElement('span');
    numSpan.className = 'cell-num';
    numSpan.textContent = String(cell.id);
    el.appendChild(numSpan);

    const cellImg = document.createElement('img');
    cellImg.className = 'cell-icon-img';
    cellImg.src = `assets/art/cells/cell_${cell.type.toLowerCase()}.png`;
    cellImg.alt = '';

    const cellEmoji = document.createElement('span');
    cellEmoji.className = 'cell-icon-emoji';
    cellEmoji.textContent = getCellEmoji(cell.type);

    cellImg.addEventListener('error', () => {
      cellImg.style.display = 'none';
      cellEmoji.style.display = 'flex';
    });

    el.appendChild(cellImg);
    el.appendChild(cellEmoji);
    
    container.appendChild(el);
  });

  // Aggiorna banner dello scenario
  const lang = gameState.language || 'en';
  const scenarioIndex = Math.min(SCENARIOS_LOCALIZED.length - 1, gameState.level - 1);
  const scenario = SCENARIOS_LOCALIZED[scenarioIndex];
  const banner = document.querySelector('#screen-board .scenario-banner');
  if (banner) {
    banner.innerHTML = `
      <h2>${scenario.name[lang]}</h2>
      <p>${scenario.desc[lang]}</p>
    `;
  }

  // Se la posizione attuale supera la tavola (es. caricamento salvataggio vecchio), resetta
  if (gameState.playerPosition >= board.length) {
    gameState.playerPosition = 0;
  }

  // Posiziona la pedina
  updatePlayerTokenPosition(gameState.playerPosition);

  // Disegna il path SVG e centra la telecamera
  setTimeout(() => {
    drawBoardPath();
    scrollToPlayer();
  }, 50);

  // Mostra il landmark popup solo all'ingresso di una tappa nuova (posizione 0)
  if (gameState.playerPosition === 0) {
    setTimeout(() => showLandmarkPopup(gameState.level), 300);
  }
}

// Calcolo matematico della posizione a Serpente scrollabile
function getCellSerpentinePosition(id: number) {
  const colInRow = id % 5;
  const row = Math.floor(id / 5);
  // Se la riga è dispari, andiamo da destra a sinistra
  const col = (row % 2 === 0) ? colInRow : (4 - colInRow);
  
  const left = 9 + col * 19.5; // Orizzontale in %
  const top = 30 + row * 75;   // Verticale in px (distribuita su altezza estesa)
  return { left, top };
}

function getCellEmoji(type: CellType) {
  switch (type) {
    case 'COINS': return '🪙';
    case 'GEMS': return '💎';
    case 'TEMPLE': return '🩹';
    case 'TRAP': return '🕸️';
    case 'COMMON_ENEMY': return '👹';
    case 'ELITE_ENEMY': return '👾';
    case 'BOSS': return '🔱';
    case 'MERCHANT': return '🛒';
    case 'DECISION': return '🔮';
    case 'ACCAMPAMENTO': return '⛺';
    default: return '📍';
  }
}

function getElementEmoji(elem?: ElementType) {
  switch (elem) {
    case 'OSSIDIANA': return '🔥';
    case 'ACQUA': return '💧';
    case 'PIETRA': return '🧱';
    case 'VENTO': return '🌬️';
    default: return '📍';
  }
}

function updatePlayerTokenPosition(posIndex: number) {
  const token = document.getElementById('player-token')!;
  const { left, top } = getCellSerpentinePosition(posIndex);
  token.style.left = `${left}%`;
  token.style.top = `${top}px`;
  highlightCurrentCell(posIndex);
}

function highlightCurrentCell(posIndex: number) {
  document.querySelectorAll('.board-cell.cell-current').forEach(el => el.classList.remove('cell-current'));
  document.querySelectorAll('.board-cell.cell-visited').forEach(el => el.classList.remove('cell-visited'));
  for (let i = 0; i < posIndex; i++) {
    document.getElementById(`cell-${i}`)?.classList.add('cell-visited');
  }
  document.getElementById(`cell-${posIndex}`)?.classList.add('cell-current');
}

function drawBoardPath() {
  const container = document.getElementById('board-container')!;
  const oldSvg = container.querySelector('.board-path-svg');
  if (oldSvg) oldSvg.remove();

  const containerW = container.clientWidth || 280;
  const numRows = Math.ceil(board.length / 5);
  const totalH = numRows * 75 + 80;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('board-path-svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', `${totalH}px`);

  for (let i = 0; i < board.length - 1; i++) {
    const p1 = getCellSerpentinePosition(i);
    const p2 = getCellSerpentinePosition(i + 1);
    const x1 = (p1.left / 100) * containerW + 25;
    const y1 = p1.top + 25;
    const x2 = (p2.left / 100) * containerW + 25;
    const y2 = p2.top + 25;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', 'rgba(200, 167, 107, 0.16)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '5 5');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }

  container.insertBefore(svg, container.firstChild);
}

// Centra la telecamera del board container sulla pedina
function scrollToPlayer() {
  const scrollEl = document.getElementById('serpentine-scroll');
  const token = document.getElementById('player-token');
  if (scrollEl && token) {
    const tokenTop = parseFloat(token.style.top);
    scrollEl.scrollTo({
      top: tokenTop - scrollEl.clientHeight / 2,
      behavior: 'smooth'
    });
  }
}

// ─── CONTROLLI TIRO DADO & MOVIMENTO ANIMATO ───

async function rollDice() {
  if (isRolling) return;
  isRolling = true;
  
  const diceImg = document.getElementById('dice-img')!;
  const badge = document.getElementById('dice-result-badge')!;
  const consoleLog = document.getElementById('game-console')!;

  // Ricarica HP per scontro se morti durante avventure precedenti
  if (!gameState.team.some(h => h.currentHp > 0)) {
    gameState.team.forEach(h => h.currentHp = h.maxHp);
  }

  // Avvia animazione 3D dado + Effetto Sonoro + Scia di Particelle
  diceImg.classList.add('dice-rolling');
  badge.innerText = '...';
  consoleLog.innerHTML = '<p class="console-log text-gold">Il Dado d\'Oro del Nuraghe sta girando...</p>';

  AudioSynth.playDiceRoll();
  
  // Traccia il dado in tempo reale per generare la scia
  const diceInterval = window.setInterval(() => {
    const diceEl = document.getElementById('dice-img');
    const canvasEl = document.getElementById('particle-canvas');
    if (diceEl && canvasEl) {
      const diceRect = diceEl.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const x = diceRect.left - canvasRect.left + diceRect.width / 2;
      const y = diceRect.top - canvasRect.top + diceRect.height / 2;
      ParticleManager.spawnDiceTrail(x, y);
    }
  }, 30);

  await sleep(700);

  const roll = Math.floor(Math.random() * 6) + 1;
  diceImg.classList.remove('dice-rolling');
  badge.innerText = roll.toString();

  clearInterval(diceInterval);

  // Esplosione dorata al momento dell'atterraggio del dado
  const canvasEl = document.getElementById('particle-canvas');
  if (canvasEl) {
    const diceRect = diceImg.getBoundingClientRect();
    const canvasRect = canvasEl.getBoundingClientRect();
    const x = diceRect.left - canvasRect.left + diceRect.width / 2;
    const y = diceRect.top - canvasRect.top + diceRect.height / 2;
    ParticleManager.spawnExplosion(x, y, '#ffd700', 25);
    AudioSynth.playCritHit(); // Un leggero scatto d'impatto risonante
  }

  // Calcolo spostamento
  const oldPos = gameState.playerPosition;
  const nextPos = BoardManager.movePlayer(oldPos, roll, board.length);

  // Spostamento visuale passo-passo (effetto premium!) con auto-scrolling
  for (let i = oldPos + 1; i <= nextPos; i++) {
    gameState.playerPosition = i;
    updatePlayerTokenPosition(i);
    scrollToPlayer(); // Telecamera segue la pedina!
    consoleLog.innerHTML = `<p class="console-log">Avanzamento casella ${i}/${board.length - 1}...</p>`;
    await sleep(220);
  }

  const landingCell = board[gameState.playerPosition];
  consoleLog.innerHTML = `<p class="console-log text-success">Atterrato su Casella ${gameState.playerPosition}: ${landingCell.name}</p>`;

  await sleep(350);
  handleLandingEvent(landingCell);
}

// Gestione eventi atterraggio
function handleLandingEvent(cell: Cell) {
  const overlay = document.getElementById('popup-event')!;
  const title = document.getElementById('popup-title')!;
  const icon = document.getElementById('popup-icon')!;
  const desc = document.getElementById('popup-desc')!;
  
  isRolling = false;

  switch (cell.type) {
    case 'COINS':
      gameState.coins += cell.value;
      title.innerText = 'Monete Trovate!';
      icon.innerText = '🪙';
      desc.innerText = `Hai rinvenuto un antico forziere dei Shardana contenente +${cell.value} Monete d'Oro!`;
      overlay.classList.add('active');
      updateUI();
      GameStorage.save();
      break;

    case 'GEMS':
      gameState.gems += cell.value;
      title.innerText = 'Ossidiana Estratta!';
      icon.innerText = '💎';
      desc.innerText = `Hai scavato nella roccia vulcanica raccogliendo +${cell.value} Gemme di Ossidiana del Monte Arci!`;
      overlay.classList.add('active');
      updateUI();
      GameStorage.save();
      break;

    case 'TEMPLE':
      gameState.team.forEach(h => {
        if (h.currentHp > 0) {
          const heal = Math.round(h.maxHp * (cell.value / 100));
          h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
        }
      });
      title.innerText = 'Fonte delle Janas';
      icon.innerText = '🩹';
      desc.innerText = `Le fate d'oro evocano il Soffio curativo: la tua squadra rigenera il ${cell.value}% dei HP totali!`;
      overlay.classList.add('active');
      updateUI();
      GameStorage.save();
      break;

    case 'TRAP':
      gameState.team.forEach(h => {
        if (h.currentHp > 0) {
          const dmg = Math.round(h.maxHp * (cell.value / 100));
          h.currentHp = Math.max(0, h.currentHp - dmg);
        }
      });
      // Screen shake emulato
      const phoneCase = document.querySelector('.phone-case') as HTMLElement;
      if (phoneCase) {
        phoneCase.style.animation = 'floatDmg 0.15s ease-in 3';
        setTimeout(() => phoneCase.style.animation = '', 500);
      }

      title.innerText = 'Frana Nuragica!';
      icon.innerText = '🕸️';
      desc.innerText = `Una pioggia di massi travolge il cammino! Tutta la squadra subisce il ${cell.value}% di danno HP.`;
      overlay.classList.add('active');
      updateUI();
      GameStorage.save();
      break;

    case 'MERCHANT':
      openMerchantShop();
      break;

    case 'DECISION':
      openDecisionEvent();
      break;

    case 'ACCAMPAMENTO':
      openRecruitmentPopup('ACCAMPAMENTO');
      break;

    case 'COMMON_ENEMY':
    case 'ELITE_ENEMY':
      startRealTimeCombat(cell.type);
      break;

    case 'BOSS':
      openPreBossShop();
      break;
  }
}

function closePopup() {
  document.getElementById('popup-event')!.classList.remove('active');

  // Dopo vittoria Elite: mostra reclutamento prima di tornare alla mappa
  if (pendingEliteRecruitment) {
    pendingEliteRecruitment = false;
    openRecruitmentPopup('ELITE');
    return;
  }

  // Se abbiamo superato l'ultima casella ed il Boss è morto: Vittoria Livello!
  const finalCell = board[gameState.playerPosition];
  if (gameState.playerPosition === board.length - 1 && finalCell && finalCell.type === 'BOSS' && (finalCell as any).defeated) {
    const oldLevel = gameState.level;
    gameState.level += 1;
    gameState.playerPosition = 0;

    // Ricompense globali della meta-progressione!
    const rewardExp = ECONOMY.STAGE_CLEAR_EXP_BASE + oldLevel * ECONOMY.STAGE_CLEAR_EXP_PER_LVL;
    const rewardEternalGems = ECONOMY.STAGE_CLEAR_GEMS_BASE + oldLevel * ECONOMY.STAGE_CLEAR_GEMS_PER_LVL;

    const lang = gameState.language || 'it';
    alert(lang === 'it'
      ? `🏆 TAPPA ${oldLevel} SUPERATA!\nHai sconfitto il Guardiano del Nuraghe ed evocato le antiche divinità sarde!\n\nRicevi:\n🔮 +${rewardEternalGems} Gemme Primordiali (Permanenti)\n⭐ +${rewardExp} EXP Profilo\n\nLa nuova mappa inizia con i tuoi 3 guerrieri originali.`
      : `🏆 STAGE ${oldLevel} CLEARED!\nYou defeated the Nuraghe Guardian and awakened the ancient Sardinian deities!\n\nEarned:\n🔮 +${rewardEternalGems} Eternal Gems (Permanent)\n⭐ +${rewardExp} Profile EXP\n\nThe new map starts with your original 3 warriors.`);

    // Paga ricompense
    gameState.eternalGems += rewardEternalGems;

    // Resetta la run: team e inventario azzerati, risorse di sessione a zero
    // → isExplorationActive diventa false → il giocatore potrà scegliere un roster fresco
    gameState.coins = 0;
    gameState.gems = 0;
    gameState.team = [];
    gameState.inventory = [];

    // Verifica Level Up del profilo
    checkForProfileLevelUp(rewardExp);

    // Inizializza per il livello successivo ed aggiorna UI
    initBoard();
    initTeamSlots();
    updateUI();
    GameStorage.save();

    // Ritorna allo schermo Home (mostrerà "INIZIA VIAGGIO" per scegliere un nuovo roster)
    navigateToScreen('screen-home');
  }
}

// ─── COMBATTIMENTO IN TEMPO REALE CON SCALING ───

function startRealTimeCombat(cellType: CellType) {
  // Passa alla schermata di battaglia
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-combat')!.classList.add('active');

  const timerEl = document.getElementById('combat-timer')!;
  const enemyHpBar = document.getElementById('enemy-hp-bar')!;
  const enemyHpText = document.getElementById('enemy-hp-text')!;
  const enemyName = document.getElementById('enemy-name')!;
  const enemyAvatar = document.getElementById('enemy-avatar')!;
  const logsContainer = document.getElementById('combat-live-logs')!;
  
  logsContainer.innerHTML = '';
  
  // Configurazione nemico ed eseguilo con lo scaling di CombatEngine!
  let enemyType: EnemyType = 'COMMON';
  if (cellType === 'ELITE_ENEMY') {
    enemyType = 'ELITE';
  } else if (cellType === 'BOSS') {
    enemyType = 'BOSS';
  }

  // Cambia BGM dinamico in base al nemico (Elite/Boss = incalzante, Comune = rilassante)
  if (enemyType === 'ELITE' || enemyType === 'BOSS') {
    AudioSynth.setBgmMode('intense');
  } else {
    AudioSynth.setBgmMode('relaxing');
  }

  const enemy = CombatEngine.spawnEnemy(gameState.level, enemyType);
  activeEnemy = enemy;
  updateAutoCombatButtonUI();
  const enemyElemEmoji = getElementEmoji(enemy.element);

  enemyName.innerText = `${enemy.name} ${enemyElemEmoji} (LIV. ${gameState.level})`;
  enemyAvatar.innerHTML = getEnemyAvatarHtml(enemyType);

  const badgeEl = document.getElementById('enemy-type-badge');
  if (badgeEl) {
    const badgeClass = enemyType === 'BOSS' ? 'boss' : (enemyType === 'ELITE' ? 'elite' : 'common');
    const combatLang = gameState.language || 'en';
    const badgeText = enemyType === 'BOSS' ? 'BOSS' : (enemyType === 'ELITE' ? 'ELITE' : (combatLang === 'en' ? 'COMMON' : 'COMUNE'));
    badgeEl.className = `enemy-type-badge ${badgeClass}`;
    badgeEl.innerText = badgeText;
  }
  
  // HP Nemico UI
  enemyHpBar.style.width = '100%';
  enemyHpText.innerText = `${enemy.currentHp}/${enemy.maxHp}`;
  
  renderCombatTeamGrid();

  let ticks = 0;
  const tickRate = 0.1;
  timerEl.innerText = `0.0s`;

  addCombatLog(`⚔️ INIZIO SCONTRO VS ${enemy.name} ${enemyElemEmoji} (HP: ${enemy.maxHp}, ATK: ${enemy.attack}, DEF: ${enemy.defense})!`, 'text-gold');

  // Calcola sinergie di squadra applicando i bonus flat/moltiplicatori temporanei
  const synergies = CombatEngine.calculateSynergies(gameState.team);
  if (synergies.activeList.length > 0) {
    addCombatLog(`🌟 Sinergie attive di squadra:`, 'text-gold');
    synergies.activeList.forEach(s => addCombatLog(`   * ${s}`, 'text-purple'));
  }

  // Applica i bonus temporanei alle statistiche
  const originalAttacks = gameState.team.map(h => h.attack);
  const originalDefenses = gameState.team.map(h => h.defense);
  const originalCooldowns = gameState.team.map(h => h.skillCooldown);
  const originalCrits = gameState.team.map(h => h.criticalChance);

  gameState.team.forEach((h, idx) => {
    if (h.currentHp > 0) {
      h.attack = Math.round(h.attack * synergies.atkMultiplier);
      h.defense += synergies.defBonus;
      h.skillCooldown = parseFloat(Math.max(1.0, h.skillCooldown * (1 - synergies.cooldownReduction)).toFixed(1));
      h.criticalChance += synergies.critChanceBonus;
    }
  });

  // Reset dei timer dei colpi degli eroi per lo scontro
  gameState.team.forEach(h => {
    h.skillTimer = 0;
    h.skillReady = false;
  });

  // Avvia il loop in tempo reale (tick di 100ms)
  combatInterval = window.setInterval(() => {
    ticks++;
    const battleTime = parseFloat((ticks * 0.1).toFixed(1));
    currentBattleTime = battleTime; // Aggiorna riferimento globale
    timerEl.innerText = `${battleTime}s`;

    // 1. Carica le abilità speciali degli eroi (evocazione/casting)
    gameState.team.forEach(hero => {
      if (hero.currentHp <= 0) return;
      
      const skillBar = document.getElementById(`skill-bar-${hero.name.replace(/\s+/g, '')}`);
      if (skillBar) {
        if (hero.skillReady) {
          skillBar.style.width = '100%';
          skillBar.classList.add('ready');
          return;
        }

        hero.skillTimer = parseFloat((hero.skillTimer + tickRate).toFixed(1));
        const percentage = Math.min(100, (hero.skillTimer / hero.skillCooldown) * 100);
        skillBar.style.width = `${percentage}%`;
        
        if (percentage >= 100) {
          hero.skillReady = true;
          skillBar.classList.add('ready');
          
          if (isAutoCombat) {
            executeActiveHeroSkill(hero);
          } else {
            // Modalità Manuale: re-renderizza la griglia per attivare i click e mostrare i bagliori
            renderCombatTeamGrid();
          }
        }
      }
    });

    // 2. Carica abilità nemica
    enemy.skills[0].timer = parseFloat((enemy.skills[0].timer + tickRate).toFixed(1));
    if (enemy.skills[0].timer >= enemy.skills[0].cooldown) {
      const combatLog: string[] = [];
      
      // Animazione Claymation: Nemico Attacco Speciale
      const enemyAvatarEl = document.getElementById('enemy-avatar');
      if (enemyAvatarEl) {
        const img = enemyAvatarEl.querySelector('.avatar-image');
        if (img) {
          img.classList.add('avatar-attack-right');
          setTimeout(() => img.classList.remove('avatar-attack-right'), 500);
        }
      }

      CombatEngine.castEnemySkill(enemy, gameState.team, battleTime, combatLog);
      
      combatLog.forEach(l => {
        const target = CombatEngine.selectEnemyTarget(gameState.team);
        if (target) {
          const elemMult = CombatEngine.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
          const dmgVal = Math.max(5, Math.round(enemy.skills[0].damage - (target.defense + (target.tempCombatDef || 0))));
          const finalDmg = Math.round(dmgVal * elemMult);

          // Animazione Claymation: Eroe colpito o abbattuto
          const targetRow = document.getElementById(`row-${target.name.replace(/\s+/g, '')}`);
          if (targetRow) {
            const img = targetRow.querySelector('.avatar-image');
            if (img) {
              if (target.currentHp <= 0) {
                img.classList.add('avatar-dead');
              } else {
                img.classList.add('avatar-hit');
                setTimeout(() => img.classList.remove('avatar-hit'), 500);
              }
            }
          }

          spawnFloatingDamage(finalDmg.toString(), true, document.getElementById(`row-${target.name.replace(/\s+/g, '')}`), elemMult > 1.0);
        }
        addCombatLog(l, 'text-danger');
      });
      
      enemy.skills[0].timer = 0;
      renderCombatTeamGrid();
    }

    // 3. Attacchi base dei nostri Eroi vivi (ogni 1.0s)
    if (ticks % 10 === 0) {
      const aliveHeroes = gameState.team.filter(h => h.currentHp > 0);
      aliveHeroes.forEach(attacker => {
        if (enemy.currentHp <= 0) return;

        const attackerElement = attacker.element || 'VENTO';
        const targetElement = enemy.element || 'VENTO';
        const elemMult = CombatEngine.getElementalMultiplier(attackerElement, targetElement);

        const isCrit = Math.random() < attacker.criticalChance;
        const baseDmg = Math.max(1, attacker.attack - enemy.defense);
        const dmg = Math.round(baseDmg * elemMult * (isCrit ? 1.5 : 1.0));

        // Animazione Claymation: Attacco Eroe
        const row = document.getElementById(`row-${attacker.name.replace(/\s+/g, '')}`);
        if (row) {
          const img = row.querySelector('.avatar-image');
          if (img) {
            img.classList.add('avatar-attack-left');
            setTimeout(() => img.classList.remove('avatar-attack-left'), 400);
          }
        }

        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

        // Animazione Claymation: Nemico colpito o abbattuto
        const enemyAvatarEl = document.getElementById('enemy-avatar');
        if (enemyAvatarEl) {
          const img = enemyAvatarEl.querySelector('.avatar-image');
          if (img) {
            if (enemy.currentHp <= 0) {
              img.classList.add('avatar-dead');
            } else {
              img.classList.add('avatar-hit');
              setTimeout(() => img.classList.remove('avatar-hit'), 400);
            }
          }
        }

        if (isCrit) AudioSynth.playCritHit();
        spawnFloatingDamage(dmg.toString(), false, document.querySelector('.enemy-visual'), isCrit || elemMult > 1.0);

        let logMsg = `[${battleTime}s] 🗡️ ${attacker.name} colpisce ${enemy.name} per ${dmg} danni${isCrit ? ' 💥CRITICO!' : ''}.`;
        if (elemMult > 1.0) logMsg += ' (🔥 Element Advantage!)';
        if (elemMult < 1.0) logMsg += ' (❄️ Element Disadvantage)';
        addCombatLog(logMsg);
      });

      if (aliveHeroes.length > 0) {
        enemyHpBar.style.width = `${(enemy.currentHp / enemy.maxHp) * 100}%`;
        enemyHpText.innerText = `${enemy.currentHp}/${enemy.maxHp}`;
      }

      // Attacco del Nemico
      if (enemy.currentHp > 0) {
        const target = CombatEngine.selectEnemyTarget(gameState.team);
        if (target) {
          const attackerElement = enemy.element || 'VENTO';
          const targetElement = target.element || 'VENTO';
          const elemMult = CombatEngine.getElementalMultiplier(attackerElement, targetElement);

          const baseDmg = Math.max(1, enemy.attack - (target.defense + (target.tempCombatDef || 0)));
          const dmg = Math.round(baseDmg * elemMult);

          // Animazione Claymation: Nemico Attacca
          const enemyAvatarEl = document.getElementById('enemy-avatar');
          if (enemyAvatarEl) {
            const img = enemyAvatarEl.querySelector('.avatar-image');
            if (img) {
              img.classList.add('avatar-attack-right');
              setTimeout(() => img.classList.remove('avatar-attack-right'), 400);
            }
          }

          target.currentHp = Math.max(0, target.currentHp - dmg);
          
          // Animazione Claymation: Eroe colpito o abbattuto
          const targetRow = document.getElementById(`row-${target.name.replace(/\s+/g, '')}`);
          if (targetRow) {
            const img = targetRow.querySelector('.avatar-image');
            if (img) {
              if (target.currentHp <= 0) {
                img.classList.add('avatar-dead');
              } else {
                img.classList.add('avatar-hit');
                setTimeout(() => img.classList.remove('avatar-hit'), 400);
              }
            }
          }

          spawnFloatingDamage(dmg.toString(), true, document.getElementById(`row-${target.name.replace(/\s+/g, '')}`), elemMult > 1.0);
          
          let logMsg = `[${battleTime}s] 💥 ${enemy.name} colpisce ${target.name} per ${dmg} danni.`;
          if (elemMult > 1.0) logMsg += ' (🔥 Element Advantage!)';
          if (elemMult < 1.0) logMsg += ' (❄️ Element Disadvantage)';
          addCombatLog(logMsg, 'text-danger');
          
          renderCombatTeamGrid();
        }
      }
    }

    // 4. Check condizioni di fine battaglia
    if (enemy.currentHp <= 0) {
      clearInterval(combatInterval!);
      addCombatLog(`🏆 VITTORIA! ${enemy.name} sconfitto!`, 'text-success');
      
      if (cellType === 'BOSS') {
        (board[gameState.playerPosition] as any).defeated = true;
      }

      // Ripristina le statistiche originali
      gameState.team.forEach((h, idx) => {
        h.attack = originalAttacks[idx];
        h.defense = originalDefenses[idx];
        h.skillCooldown = originalCooldowns[idx];
        h.criticalChance = originalCrits[idx];
        h.tempCombatDef = 0;
      });
      
      setTimeout(() => endCombat(true, cellType), 1500);
    } else if (!CombatEngine.isTeamAlive(gameState.team)) {
      clearInterval(combatInterval!);
      addCombatLog(`💀 SCONFITTA! L'intera squadra è caduta in battaglia.`, 'text-danger');

      // Ripristina le statistiche originali
      gameState.team.forEach((h, idx) => {
        h.attack = originalAttacks[idx];
        h.defense = originalDefenses[idx];
        h.skillCooldown = originalCooldowns[idx];
        h.criticalChance = originalCrits[idx];
        h.tempCombatDef = 0;
      });

      setTimeout(() => endCombat(false, cellType), 1500);
    }
  }, 100);
}

function getHpBarColor(pct: number): string {
  if (pct > 60) return '#52B788';
  if (pct > 30) return '#F77F00';
  return '#E63946';
}

const GRADE_BORDER_COLOR: Record<string, string> = {
  C: '#8e9aa6', R: '#3182ce', S: '#805ad5', SR: '#c8a76b'
};

function renderCombatTeamGrid() {
  const grid = document.getElementById('combat-team-grid')!;
  grid.innerHTML = '';

  gameState.team.forEach(hero => {
    const row = document.createElement('div');
    row.id = `row-${hero.name.replace(/\s+/g, '')}`;
    row.style.borderLeftColor = GRADE_BORDER_COLOR[hero.grade] || '#8e9aa6';

    const hpPct = Math.max(0, (hero.currentHp / hero.maxHp) * 100);
    const hpColor = hero.currentHp <= 0 ? '#444' : getHpBarColor(hpPct);
    const elemEmoji = getElementEmoji(hero.element);
    
    // Calcola il riempimento corrente della barra abilità
    const skillPct = hero.skillReady ? 100 : Math.min(100, ((hero.skillTimer || 0) / (hero.skillCooldown || 3)) * 100);

    // Classi CSS condizionali
    let rowClasses = 'combat-hero-row';
    if (hero.currentHp <= 0) {
      rowClasses += ' dead';
    } else if (hero.skillReady) {
      rowClasses += ' ready-to-cast clickable';
    }
    row.className = rowClasses;

    row.innerHTML = `
      <div class="ch-avatar-wrap" style="border-color: ${GRADE_BORDER_COLOR[hero.grade] || 'var(--gold)'}; display: flex; align-items: center; justify-content: center; position: relative; overflow: visible;">
        ${getHeroAvatarHtml(hero, hero.currentHp > 0, 'compact')}
      </div>
      <div class="ch-info">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span class="ch-name">${hero.name} ${elemEmoji}</span>
          <span style="font-size: 0.56rem; color: var(--text-muted); flex-shrink:0; margin-left:4px;">HP ${hero.currentHp}/${hero.maxHp}</span>
        </div>
        <div class="ch-hp-bar-wrapper">
          <div class="ch-hp-bar" style="width: ${hpPct}%; background-color: ${hpColor};"></div>
        </div>
        <div class="ch-skill-bar-wrapper">
          <div class="ch-skill-bar ${hero.skillReady ? 'ready' : ''}" id="skill-bar-${hero.name.replace(/\s+/g, '')}" style="width: ${skillPct}%;"></div>
        </div>
      </div>
      ${hero.skillReady && hero.currentHp > 0 ? `<div class="skill-ready-indicator">${gameState.language === 'it' ? 'PRONTO ⚡' : 'TAP ⚡'}</div>` : ''}
    `;

    // Attacca il listener del click se la skill è pronta ed il personaggio è vivo
    if (hero.skillReady && hero.currentHp > 0) {
      row.addEventListener('click', () => {
        executeActiveHeroSkill(hero);
      });
    }

    grid.appendChild(row);
  });
}

function addCombatLog(text: string, className = '') {
  const logs = document.getElementById('combat-live-logs')!;
  const p = document.createElement('p');
  p.className = className;
  p.innerText = text;
  logs.appendChild(p);
  logs.scrollTop = logs.scrollHeight;
}

function spawnFloatingDamage(value: string, isToHero: boolean, targetElement: HTMLElement | null, isCrit = false, isHeal = false) {
  if (!targetElement) return;

  const floating = document.createElement('div');
  floating.className = 'floating-damage';
  floating.innerText = isHeal ? `+${value}` : `-${value}`;
  
  if (isHeal) {
    floating.style.color = '#52B788';
  } else if (isCrit) {
    floating.style.color = '#fbb6ce';
    floating.style.fontSize = '1.1rem';
  } else {
    floating.style.color = isToHero ? '#E63946' : '#c8a76b';
  }

  floating.style.left = '45%';
  floating.style.top = '10%';
  
  targetElement.style.position = 'relative';
  targetElement.appendChild(floating);

  setTimeout(() => floating.remove(), 1200);
}

function endCombat(victory: boolean, cellType: CellType) {
  if (combatInterval) clearInterval(combatInterval);
  activeEnemy = null;
  currentBattleTime = 0.0;

  // Ritorna allo schermo della tavola ed all'audio rilassante
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-board')!.classList.add('active');
  setTimeout(scrollToPlayer, 100);

  // Ripristina sempre la musica di base rilassante
  AudioSynth.setBgmMode('relaxing');

  if (victory) {
    // Effetto trionfale all'uscita dal combattimento in base all'entità sconfitta!
    if (cellType === 'BOSS') {
      AudioSynth.playAscension();
    } else {
      AudioSynth.playLevelUp();
    }

    const overlay = document.getElementById('popup-event')!;
    const title = document.getElementById('popup-title')!;
    const icon = document.getElementById('popup-icon')!;
    const desc = document.getElementById('popup-desc')!;

    // Moltiplicatore ricompense
    const rewardMult = 1 + (gameState.level - 1) * 0.15;

    let baseCoins = 150;
    let baseGems = 5;

    if (cellType === 'ELITE_ENEMY') {
      baseCoins = 400;
      baseGems = 15;
      pendingEliteRecruitment = true; // Dopo la chiusura del popup, offre un eroe gratuito
    } else if (cellType === 'BOSS') {
      baseCoins = 1000;
      baseGems = 50;
    }

    const rewardCoins = Math.round(baseCoins * rewardMult);
    const rewardGems = Math.round(baseGems * rewardMult);

    gameState.coins += rewardCoins;
    gameState.gems += rewardGems;

    const lang = gameState.language || 'it';
    title.innerText = lang === 'it' ? 'Vittoria Epica!' : 'Epic Victory!';
    icon.innerText = '🏆';
    const eliteHint = cellType === 'ELITE_ENEMY'
      ? (lang === 'it' ? '\n\n⛺ Un guerriero vuole unirsi a voi...' : '\n\n⛺ A warrior wants to join you...')
      : '';
    desc.innerText = (lang === 'it'
      ? `Hai sconfitto i Mamuthones selvaggi! Ricevi +${rewardCoins} Monete 🪙 e +${rewardGems} Gemme 💎!`
      : `You defeated the wild Mamuthones! Received +${rewardCoins} Coins 🪙 and +${rewardGems} Gems 💎!`) + eliteHint;
    overlay.classList.add('active');

    updateUI();
    GameStorage.save();
  } else {
    const lang = gameState.language || 'it';
    alert(lang === 'it'
      ? '💀 LA SQUADRA È CADUTA!\nLa run ricomincia dall\'inizio con i tuoi 3 guerrieri originali. Monete e gemme di sessione azzerate.'
      : '💀 YOUR TEAM HAS FALLEN!\nThe run restarts from the beginning with your original 3 warriors. Session coins and gems reset.');
    // Roguelite duro: riparte da casella 0 con il roster iniziale, risorse azzerate
    resetToStartingRoster();
    gameState.playerPosition = 0;
    gameState.coins = 0;
    gameState.gems = 0;
    updatePlayerTokenPosition(0);
    initTeamSlots();
    setTimeout(scrollToPlayer, 150);
    updateUI();
    GameStorage.save();
  }
}

// ─── GESTIONE SCHERMATA SQUADRA (Drag, Drop, Swap & INSPECTOR) ───

function initTeamSlots() {
  renderActiveSlots();
  renderInventorySlots();
}

function renderActiveSlots() {
  const container = document.getElementById('team-active-slots')!;
  container.innerHTML = '';

  gameState.team.forEach((hero, index) => {
    const el = document.createElement('div');
    el.className = `hero-slot hero-framed active-card grade-${hero.grade.toLowerCase()}`;
    el.setAttribute('draggable', 'true');
    el.dataset.index = index.toString();
    el.dataset.area = 'active';

    el.innerHTML = buildFramedCardInner(hero, { showLevel: true, showStars: true, showElem: true, showInspect: true, isIdle: true });

    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDropActive);
    
    el.addEventListener('click', () => handleCardClick(index, 'active'));

    const inspectBtn = el.querySelector('.inspect-btn-trigger')!;
    inspectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openHeroInspector(hero, index, 'active');
    });

    container.appendChild(el);
  });
}

function renderInventorySlots() {
  const container = document.getElementById('team-inventory-grid')!;
  container.innerHTML = '';

  gameState.inventory.forEach((hero, index) => {
    const el = document.createElement('div');
    el.className = `hero-slot hero-framed grade-${hero.grade.toLowerCase()}`;
    el.setAttribute('draggable', 'true');
    el.dataset.index = index.toString();
    el.dataset.area = 'inventory';

    el.innerHTML = buildFramedCardInner(hero, { showLevel: true, showStars: true, showElem: true, showInspect: true, isIdle: true });

    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDropInventory);
    
    el.addEventListener('click', () => handleCardClick(index, 'inventory'));

    const inspectBtn = el.querySelector('.inspect-btn-trigger')!;
    inspectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openHeroInspector(hero, index, 'inventory');
    });

    container.appendChild(el);
  });
}

let selectedSlot: { index: number; area: string } | null = null;

function handleDragStart(e: DragEvent) {
  const target = e.currentTarget as HTMLElement;
  e.dataTransfer!.setData('text/plain', JSON.stringify({
    index: target.dataset.index,
    area: target.dataset.area
  }));
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
}

function handleDropActive(e: DragEvent) {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  const data = JSON.parse(e.dataTransfer!.getData('text/plain'));
  const targetIndex = parseInt(target.dataset.index!);
  const sourceIndex = parseInt(data.index);

  if (data.area === 'active') {
    const temp = gameState.team[sourceIndex];
    gameState.team[sourceIndex] = gameState.team[targetIndex];
    gameState.team[targetIndex] = temp;
  } else {
    const temp = gameState.team[targetIndex];
    gameState.team[targetIndex] = gameState.inventory[sourceIndex];
    gameState.inventory[sourceIndex] = temp;
  }

  renderActiveSlots();
  renderInventorySlots();
  GameStorage.save();
}

function handleDropInventory(e: DragEvent) {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  const data = JSON.parse(e.dataTransfer!.getData('text/plain'));
  const targetIndex = parseInt(target.dataset.index!);
  const sourceIndex = parseInt(data.index);

  if (data.area === 'inventory') {
    const temp = gameState.inventory[sourceIndex];
    gameState.inventory[sourceIndex] = gameState.inventory[targetIndex];
    gameState.inventory[targetIndex] = temp;
  } else {
    const temp = gameState.inventory[targetIndex];
    gameState.inventory[targetIndex] = gameState.team[sourceIndex];
    gameState.team[sourceIndex] = temp;
  }

  renderActiveSlots();
  renderInventorySlots();
  GameStorage.save();
}

function handleCardClick(index: number, area: string) {
  if (selectedSlot === null) {
    selectedSlot = { index, area };
    const el = document.querySelector(`[data-area="${area}"][data-index="${index}"]`) as HTMLElement;
    if (el) {
      el.style.borderColor = '#fbb6ce';
      el.style.boxShadow = '0 0 10px rgba(251, 182, 206, 0.4)';
    }
  } else {
    if (selectedSlot.area === 'active' && area === 'active') {
      const temp = gameState.team[selectedSlot.index];
      gameState.team[selectedSlot.index] = gameState.team[index];
      gameState.team[index] = temp;
    } else if (selectedSlot.area === 'inventory' && area === 'inventory') {
      const temp = gameState.inventory[selectedSlot.index];
      gameState.inventory[selectedSlot.index] = gameState.inventory[index];
      gameState.inventory[index] = temp;
    } else if (selectedSlot.area === 'active' && area === 'inventory') {
      const temp = gameState.team[selectedSlot.index];
      gameState.team[selectedSlot.index] = gameState.inventory[index];
      gameState.inventory[index] = temp;
    } else if (selectedSlot.area === 'inventory' && area === 'active') {
      const temp = gameState.inventory[selectedSlot.index];
      gameState.inventory[selectedSlot.index] = gameState.team[index];
      gameState.team[index] = temp;
    }

    selectedSlot = null;
    renderActiveSlots();
    renderInventorySlots();
    GameStorage.save();
  }
}

// ─── CODICE ISPEZIONE, LEVEL-UP, FUSIONE ED EQUIPAGGIAMENTO ───

// Trova il template del grado successivo per l'ascensione dello stesso elemento/classe
function getAscensionTemplate(hero: Hero): HeroTemplate | null {
  const gradesOrder: HeroGrade[] = ['C', 'R', 'S', 'SR'];
  const currentGradeIdx = gradesOrder.indexOf(hero.grade);
  if (currentGradeIdx === -1 || currentGradeIdx === gradesOrder.length - 1) {
    return null; // SR è il grado massimo, non ascesi
  }
  
  // Trova i template della stessa classe
  const sameClassTemplates = Object.values(HERO_TEMPLATES).filter(t => t.heroClass === hero.heroClass);
  
  // Filtra quelli con grado superiore, ordinati per grado ascendente
  const higherGradeTemplates = sameClassTemplates
    .filter(t => gradesOrder.indexOf(t.grade) > currentGradeIdx)
    .sort((a, b) => gradesOrder.indexOf(a.grade) - gradesOrder.indexOf(b.grade));
    
  if (higherGradeTemplates.length > 0) {
    return higherGradeTemplates[0];
  }
  
  return null;
}

function openHeroInspector(hero: Hero, index: number, area: string) {
  selectedInspectHero = hero;
  selectedInspectIndex = index;
  selectedInspectArea = area;

  const modal = document.getElementById('popup-hero-inspect')!;
  const elemEmoji = getElementEmoji(hero.element);
  document.getElementById('inspect-hero-name')!.innerText = `${hero.name} ${elemEmoji}`;
  document.getElementById('inspect-hero-avatar')!.innerHTML = getHeroAvatarHtml(hero, true, 'large');
  
  // Trova le info dal template originale per la descrizione dell'abilità
  const lang = gameState.language || 'en';
  const localizedInfo = HEROES_BY_NAME[hero.name]?.localized;
  if (localizedInfo) {
    document.getElementById('inspect-skill-name')!.innerText = localizedInfo.skillName[lang];
    document.getElementById('inspect-skill-desc')!.innerText = localizedInfo.desc[lang];
  } else {
    const template = Object.values(HERO_TEMPLATES).find(t => t.name === hero.name);
    document.getElementById('inspect-skill-name')!.innerText = hero.skillName;
    document.getElementById('inspect-skill-desc')!.innerText = template ? template.desc : (lang === 'en' ? 'Magical skill of the island.' : 'Abilità magica dell\'isola.');
  }

  // Colore del frame dell'avatar
  const avatarWrap = document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement;
  if (avatarWrap) {
    avatarWrap.style.borderColor = `var(--${hero.grade.toLowerCase()})`;
  }

  updateInspectorStats();
  modal.classList.add('active');
}

function closeHeroInspector() {
  document.getElementById('popup-hero-inspect')!.classList.remove('active');
  selectedInspectHero = null;
  selectedInspectIndex = null;
  selectedInspectArea = null;
}

function updateInspectorStats() {
  const hero = selectedInspectHero;
  if (!hero) return;

  const lang = gameState.language || 'en';

  // Mostra stelle dorate ⭐
  let starsText = '';
  for (let s = 0; s < 5; s++) {
    starsText += s < (hero.starRank || 0) ? '★' : '☆';
  }
  document.getElementById('inspect-rarity-stars')!.innerText = starsText;

  // Ricalcola le statistiche per includere l'equipaggiamento
  recalculateHeroStats(hero);

  // Statistiche correnti
  document.getElementById('inspect-stat-hp')!.innerText = hero.maxHp.toString();
  document.getElementById('inspect-stat-atk')!.innerText = hero.attack.toString();
  document.getElementById('inspect-stat-def')!.innerText = hero.defense.toString();
  document.getElementById('inspect-stat-cd')!.innerText = `${hero.skillCooldown}s`;

  // Livello & Costi
  document.getElementById('inspect-hero-level')!.innerText = hero.level.toString();
  
  const levelUpCost = hero.level * 150;
  const btnLevelUp = document.getElementById('btn-hero-level-up') as HTMLButtonElement;
  const lblLevelUpCost = document.getElementById('lbl-level-up-cost')!;

  const btnLevelUpLabel = btnLevelUp.querySelector('.act-lbl') as HTMLElement;
  if (btnLevelUpLabel) {
    btnLevelUpLabel.innerText = lang === 'en' ? `UPGRADE (LV. ${hero.level})` : `POTENZIA (LIV. ${hero.level})`;
  }

  if (hero.level >= 50) {
    btnLevelUp.disabled = true;
    lblLevelUpCost.innerText = lang === 'en' ? 'MAX LEVEL' : 'LIVELLO MAX';
  } else {
    btnLevelUp.disabled = gameState.coins < levelUpCost;
    lblLevelUpCost.innerText = `🪙 ${levelUpCost} Gold`;
  }

  // Fusione (Duplicato) / Ascensione
  const btnFuse = document.getElementById('btn-hero-fuse') as HTMLButtonElement;
  const lblFuseStatus = document.getElementById('lbl-fuse-status')!;
  const btnFuseLabel = btnFuse.querySelector('.act-lbl') as HTMLElement;
  
  // Conta quanti duplicati ci sono in INVENTARIO (non in team attivo) e che sono intatti (0 stelle, liv. 1)
  const duplicates = gameState.inventory.filter((invHero, invIdx) => {
    const isSameName = invHero.name === hero.name;
    const isSelf = selectedInspectArea === 'inventory' && invIdx === selectedInspectIndex;
    const isUntouched = (invHero.starRank || 0) === 0 && invHero.level === 1;
    return isSameName && !isSelf && isUntouched;
  });

  const nextTemplate = getAscensionTemplate(hero);

  if ((hero.starRank || 0) >= 5) {
    if (nextTemplate) {
      btnFuseLabel.innerText = lang === 'en' ? "ASCEND HERO" : "ASCENDI EROE";
      const goldCost = 1000;
      btnFuse.disabled = gameState.coins < goldCost;
      lblFuseStatus.innerText = `🪙 ${goldCost} Gold ➔ ${nextTemplate.name} (${nextTemplate.grade})`;
    } else {
      btnFuseLabel.innerText = lang === 'en' ? "FUSE DUPLICATE" : "FONDI DUPLICATO";
      btnFuse.disabled = true;
      lblFuseStatus.innerText = lang === 'en' ? 'MAX GRADE' : 'GRADO MASSIMO';
    }
  } else {
    btnFuseLabel.innerText = lang === 'en' ? "FUSE DUPLICATE" : "FONDI DUPLICATO";
    if (duplicates.length > 0) {
      btnFuse.disabled = false;
      lblFuseStatus.innerText = lang === 'en' ? `Ready (Available: ${duplicates.length})` : `Pronto (Disponibili: ${duplicates.length})`;
    } else {
      btnFuse.disabled = true;
      lblFuseStatus.innerText = lang === 'en' ? 'Requires Duplicate' : 'Richiede Duplicato';
    }
  }

  // Congedo / Vendita dell'eroe
  const btnSell = document.getElementById('btn-hero-sell') as HTMLButtonElement;
  const lblSellStatus = document.getElementById('lbl-sell-status')!;
  const btnSellLabel = btnSell.querySelector('.act-lbl') as HTMLElement;
  if (btnSellLabel) btnSellLabel.innerText = lang === 'en' ? "SELL / DISMISS HERO" : "VENDI / CONGEDA EROE";
  
  if (selectedInspectArea === 'active') {
    btnSell.disabled = true;
    lblSellStatus.innerText = lang === 'en' ? 'IN TEAM' : 'IN SQUADRA';
  } else {
    const sellValue = calculateHeroSellValue(hero);
    btnSell.disabled = false;
    lblSellStatus.innerText = `🪙 +${sellValue} Gold`;
  }

  // Visualizza equipaggiamento negli slot
  const slotWeapon = document.getElementById('slot-weapon')!;
  const slotAmulet = document.getElementById('slot-amulet')!;

  if (hero.equipWeapon) {
    slotWeapon.style.borderColor = 'var(--gold)';
    slotWeapon.innerHTML = `
      <span style="font-size: 1.1rem;">${hero.equipWeapon.icon}</span>
      <span style="font-size: 0.58rem; color: #fff; font-weight: 600;">${hero.equipWeapon.name}</span>
    `;
  } else {
    slotWeapon.style.borderColor = 'var(--gold-border)';
    slotWeapon.innerHTML = `
      <span style="font-size: 1.1rem; opacity: 0.4;">⚔️</span>
      <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 600;">${lang === 'en' ? 'Empty Weapon' : 'Arma vuota'}</span>
    `;
  }

  if (hero.equipAmulet) {
    slotAmulet.style.borderColor = 'var(--gold)';
    slotAmulet.innerHTML = `
      <span style="font-size: 1.1rem;">${hero.equipAmulet.icon}</span>
      <span style="font-size: 0.58rem; color: #fff; font-weight: 600;">${hero.equipAmulet.name}</span>
    `;
  } else {
    slotAmulet.style.borderColor = 'var(--gold-border)';
    slotAmulet.innerHTML = `
      <span style="font-size: 1.1rem; opacity: 0.4;">🔮</span>
      <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 600;">${lang === 'en' ? 'Empty Amulet' : 'Amuleto vuoto'}</span>
    `;
  }
}

function levelUpHero() {
  const hero = selectedInspectHero;
  if (!hero || hero.level >= 50) return;

  const cost = hero.level * 150;
  if (gameState.coins >= cost) {
    gameState.coins -= cost;
    hero.level += 1;
    
    // Ricalcola le statistiche e rigenera i HP
    recalculateHeroStats(hero);
    hero.currentHp = hero.maxHp;

    updateUI();
    updateInspectorStats();
    renderActiveSlots();
    renderInventorySlots();
    GameStorage.save();
    
    // Suono e particelle di Level Up!
    AudioSynth.playLevelUp();
    const avatarWrap = document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement;
    const canvasEl = document.getElementById('particle-canvas');
    if (avatarWrap && canvasEl) {
      const rect = avatarWrap.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const x = rect.left - canvasRect.left + rect.width / 2;
      const y = rect.top - canvasRect.top + rect.height / 2;
      ParticleManager.spawnExplosion(x, y, '#52B788', 15);
    }

    // Piccola animazione di floating text curativo
    spawnFloatingDamage("UP!", false, document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement, false, true);
  }
}

function fuseHero() {
  const hero = selectedInspectHero;
  if (!hero) return;

  const nextTemplate = getAscensionTemplate(hero);

  // Se è al livello stelle massimo (5 stelle), esegui l'Ascensione al rango superiore!
  if ((hero.starRank || 0) >= 5) {
    if (nextTemplate) {
      const goldCost = 1000;
      if (gameState.coins >= goldCost) {
        gameState.coins -= goldCost;
        
        // Rimuove eventuali equipaggiamenti per evitare conflitti o ricalcola
        // Modifica in-place mantenendo l'identità dell'oggetto
        hero.name = nextTemplate.name;
        hero.grade = nextTemplate.grade;
        hero.baseHp = nextTemplate.maxHp;
        hero.baseAtk = nextTemplate.attack;
        hero.baseDef = nextTemplate.defense;
        hero.maxHp = nextTemplate.maxHp;
        hero.attack = nextTemplate.attack;
        hero.defense = nextTemplate.defense;
        hero.skillName = nextTemplate.skillName;
        hero.skillCooldown = nextTemplate.skillCooldown;
        hero.icon = nextTemplate.icon;
        hero.desc = nextTemplate.desc;
        hero.element = nextTemplate.element;

        // Reset livelli ed evoluzioni sul nuovo grado
        hero.level = 1;
        hero.starRank = 0;
        hero.currentHp = hero.maxHp;

        // Ricalcola le statistiche e rigenera i HP
        recalculateHeroStats(hero);
        hero.currentHp = hero.maxHp;

        // Suono trionfale ed esplosione elementale!
        AudioSynth.playAscension();
        const avatarWrap = document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement;
        const canvasEl = document.getElementById('particle-canvas');
        if (avatarWrap && canvasEl) {
          const rect = avatarWrap.getBoundingClientRect();
          const canvasRect = canvasEl.getBoundingClientRect();
          const x = rect.left - canvasRect.left + rect.width / 2;
          const y = rect.top - canvasRect.top + rect.height / 2;
          ParticleManager.spawnElementalCascade(x, y, hero.element || 'VENTO');
        }

        const lang = gameState.language || 'en';
        const ascMsg = lang === 'en'
          ? `✨ ASCENSION COMPLETED! ✨\nYour warrior has ascended to a higher rank: ${hero.name} (${hero.grade})!\nTheir base stats have been boosted and a new skill has been unlocked.`
          : `✨ ASCENSIONE COMPLETATA! ✨\nIl tuo guerriero è asceso al rango superiore: ${hero.name} (${hero.grade})!\nLe sue statistiche base sono state potenziate e ha sbloccato una nuova abilità.`;
        alert(ascMsg);

        unlockCodexHero(hero.name);

        updateUI();
        updateInspectorStats();
        renderActiveSlots();
        renderInventorySlots();
        GameStorage.save();

        spawnFloatingDamage("ASCENSION!", false, document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement, true);
      }
    }
    return;
  }

  // Cerca un duplicato sacrificabile nell'inventario che sia intatto (0 stelle, liv. 1)
  const duplicateIndex = gameState.inventory.findIndex((invHero, invIdx) => {
    const isSameName = invHero.name === hero.name;
    const isSelf = selectedInspectArea === 'inventory' && invIdx === selectedInspectIndex;
    const isUntouched = (invHero.starRank || 0) === 0 && invHero.level === 1;
    return isSameName && !isSelf && isUntouched;
  });

  if (duplicateIndex !== -1) {
    // Rimuove il duplicato sacrificato dall'inventario
    gameState.inventory.splice(duplicateIndex, 1);
    
    // Aumenta il rango stelle ⭐
    hero.starRank = (hero.starRank || 0) + 1;
    
    // Ricalcola statistiche
    recalculateHeroStats(hero);
    hero.currentHp = hero.maxHp;

    // Se l'indice dell'eroe ispezionato si è spostato (perché si trovava in inventario dopo l'elemento rimosso)
    if (selectedInspectArea === 'inventory' && selectedInspectIndex !== null && duplicateIndex < selectedInspectIndex) {
      selectedInspectIndex -= 1;
    }

    // Suono e particelle di evoluzione stella!
    AudioSynth.playLevelUp();
    const avatarWrap = document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement;
    const canvasEl = document.getElementById('particle-canvas');
    if (avatarWrap && canvasEl) {
      const rect = avatarWrap.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const x = rect.left - canvasRect.left + rect.width / 2;
      const y = rect.top - canvasRect.top + rect.height / 2;
      ParticleManager.spawnExplosion(x, y, '#ffd700', 16);
    }

    updateUI();
    updateInspectorStats();
    renderActiveSlots();
    renderInventorySlots();
    GameStorage.save();

    spawnFloatingDamage("EVOLUTION!", false, document.querySelector('.inspect-hero-avatar-wrap') as HTMLElement, true);
  }
}

function sellHero() {
  const hero = selectedInspectHero;
  if (!hero || selectedInspectIndex === null || selectedInspectArea !== 'inventory') return;

  const value = calculateHeroSellValue(hero);
  const lang = gameState.language || 'en';
  
  const confirmSale = confirm(lang === 'en'
    ? `Are you sure you want to dismiss/sell ${hero.name} (${hero.grade}) for 🪙 ${value} Coins?\n(Any equipped Bronzetti will be removed and returned to inventory)`
    : `Sei sicuro di voler congedare/vendere ${hero.name} (${hero.grade}) per 🪙 ${value} Monete?\n(Gli eventuali Bronzetti equipaggiati verranno rimossi e restituiti all'inventario)`);
  if (!confirmSale) return;

  // Restituisci l'equipaggiamento se presente
  if (hero.equipWeapon) {
    gameState.equipmentInventory.push(hero.equipWeapon);
    hero.equipWeapon = undefined;
  }
  if (hero.equipAmulet) {
    gameState.equipmentInventory.push(hero.equipAmulet);
    hero.equipAmulet = undefined;
  }

  // Rimuovi dall'inventario
  gameState.inventory.splice(selectedInspectIndex, 1);
  
  // Aggiungi le monete
  gameState.coins += value;

  // Chiudi l'inspector e aggiorna UI
  closeHeroInspector();
  updateUI();
  renderInventorySlots();
  GameStorage.save();

  alert(lang === 'en'
    ? `💸 WARRIOR DISMISSED!\nYou sold your hero obtaining 🪙 ${value} Gold Coins.`
    : `💸 GUERRIERO CONGEDATO!\nHai venduto il tuo eroe ottenendo 🪙 ${value} Monete d'Oro.`);
}

// ─── GESTIONE EQUIPAGGIAMENTI (BRONZETTI) ───

function openEquipSelect(slotType: 'WEAPON' | 'AMULET') {
  if (!selectedInspectHero) return;
  selectedEquipSlotType = slotType;

  const overlay = document.getElementById('popup-equip-select')!;
  const title = document.getElementById('equip-select-title')!;
  const lang = gameState.language || 'en';
  
  title.innerText = slotType === 'WEAPON' 
    ? (lang === 'en' ? 'Select Weapon' : 'Seleziona Arma') 
    : (lang === 'en' ? 'Select Amulet' : 'Seleziona Amuleto');

  const descEl = overlay.querySelector('p');
  if (descEl) {
    descEl.innerText = lang === 'en'
      ? "Choose equipment from inventory to assign to hero"
      : "Scegli un equipaggiamento dall'inventario da assegnare all'eroe";
  }

  const btnUnequip = document.getElementById('btn-unequip');
  if (btnUnequip) {
    btnUnequip.innerText = lang === 'en' ? "Remove Equipment ❌" : "Rimuovi Equipaggiamento ❌";
  }

  const grid = document.getElementById('equip-list-grid')!;
  grid.innerHTML = '';

  // Filtra equipaggiamenti in inventario del tipo corretto e non ancora equipaggiati
  const availableEquips = gameState.equipmentInventory.filter(eq => eq.type === slotType);

  if (availableEquips.length === 0) {
    grid.innerHTML = `<p style="font-size: 0.72rem; color: var(--text-muted); padding: 1rem 0;">${lang === 'en' ? "No bronzetto available in inventory for this slot." : "Nessun bronzetto disponibile in inventario per questo slot."}</p>`;
  } else {
    availableEquips.forEach(eq => {
      const item = document.createElement('div');
      item.className = 'currency-item';
      item.style.justifyContent = 'space-between';
      item.style.padding = '0.5rem';
      item.style.cursor = 'pointer';
      
      let bonusText = '';
      if (eq.statBonus.atk) bonusText += `+${eq.statBonus.atk} ATK `;
      if (eq.statBonus.hp) bonusText += `+${eq.statBonus.hp} HP `;
      if (eq.statBonus.def) bonusText += `+${eq.statBonus.def} DEF `;

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.3rem;">${eq.icon}</span>
          <div style="text-align: left;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #fff;">${eq.name}</span>
            <p style="font-size: 0.58rem; color: var(--gold);">${bonusText}</p>
          </div>
        </div>
        <button class="btn-popup-close" style="font-size: 0.58rem; padding: 0.25rem 0.5rem; background: var(--gold); color: #000;">${lang === 'en' ? 'Equip' : 'Equipaggia'}</button>
      `;

      item.addEventListener('click', () => equipItem(eq));
      grid.appendChild(item);
    });
  }

  overlay.classList.add('active');
}

function equipItem(equip: Equipment) {
  const hero = selectedInspectHero;
  if (!hero || !selectedEquipSlotType) return;

  // Se c'è già un oggetto equipaggiato, rimettilo nell'inventario
  if (selectedEquipSlotType === 'WEAPON') {
    if (hero.equipWeapon) {
      gameState.equipmentInventory.push(hero.equipWeapon);
    }
    hero.equipWeapon = equip;
  } else {
    if (hero.equipAmulet) {
      gameState.equipmentInventory.push(hero.equipAmulet);
    }
    hero.equipAmulet = equip;
  }

  // Rimuovi l'oggetto dall'inventario
  const idx = gameState.equipmentInventory.findIndex(e => e.id === equip.id);
  if (idx !== -1) {
    gameState.equipmentInventory.splice(idx, 1);
  }

  // Ricalcola e salva
  recalculateHeroStats(hero);
  hero.currentHp = hero.maxHp;

  document.getElementById('popup-equip-select')!.classList.remove('active');
  updateInspectorStats();
  renderActiveSlots();
  renderInventorySlots();
  GameStorage.save();
}

function unequipSelectedSlot() {
  const hero = selectedInspectHero;
  if (!hero || !selectedEquipSlotType) return;

  if (selectedEquipSlotType === 'WEAPON' && hero.equipWeapon) {
    gameState.equipmentInventory.push(hero.equipWeapon);
    hero.equipWeapon = undefined;
  } else if (selectedEquipSlotType === 'AMULET' && hero.equipAmulet) {
    gameState.equipmentInventory.push(hero.equipAmulet);
    hero.equipAmulet = undefined;
  }

  recalculateHeroStats(hero);
  hero.currentHp = hero.maxHp;

  document.getElementById('popup-equip-select')!.classList.remove('active');
  updateInspectorStats();
  renderActiveSlots();
  renderInventorySlots();
  GameStorage.save();
}

// ─── EVENTI MERCANTE E SCELTE DEL DESTINO ───

function initMerchantAndDecisionListeners() {
  document.getElementById('btn-merchant-close')!.addEventListener('click', () => {
    document.getElementById('popup-merchant')!.classList.remove('active');

    // Ripristina aspetto normale del bottone dopo uso pre-boss
    const closeBtn = document.getElementById('btn-merchant-close')!;
    const lang = gameState.language || 'it';
    closeBtn.innerText = lang === 'it' ? 'Congedati ➔' : 'Leave Shop ➔';
    closeBtn.style.background = '#52B788';
    closeBtn.style.color = '#fff';

    // Ripristina titolo merchant normale
    const titleEl = document.querySelector('#popup-merchant h2') as HTMLElement;
    if (titleEl) titleEl.innerText = lang === 'it' ? 'Bottega del Shardana' : 'Shardana Shop';

    if (pendingBossCombat) {
      pendingBossCombat = false;
      startRealTimeCombat('BOSS');
    }
  });
  
  document.getElementById('btn-choice-risky')!.addEventListener('click', makeRiskyChoice);
  document.getElementById('btn-choice-safe')!.addEventListener('click', makeSafeChoice);
}

function openMerchantShop() {
  merchantHeroOffers = [];
  const lang = gameState.language || 'it';
  
  // Filtra tutti i template eroe sbloccati nella collezione permanente
  const eligibleTemplates = Object.values(HERO_TEMPLATES).filter(t => gameState.unlockedCollection.includes(t.name));
  
  // Mescola e prende al massimo 3 eroi unici
  const shuffled = [...eligibleTemplates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  selected.forEach(t => {
    let costCoins = 250;
    let costGems = 15;
    
    if (t.grade === 'R') {
      costCoins = 450;
      costGems = 30;
    } else if (t.grade === 'S') {
      costCoins = 800;
      costGems = 55;
    } else if (t.grade === 'SR') {
      costCoins = 1200;
      costGems = 90;
    }
    
    merchantHeroOffers.push({
      template: t,
      costCoins,
      costGems,
      bought: false
    });
  });
  
  renderMerchantItems();
  document.getElementById('popup-merchant')!.classList.add('active');
}

function renderMerchantItems() {
  const container = document.getElementById('merchant-items')!;
  container.innerHTML = '';
  
  // 1. Offerta Bronzetto Casuale (Equipaggiamento)
  const itemEquip = document.createElement('div');
  itemEquip.className = 'currency-item';
  itemEquip.style.justifyContent = 'space-between';
  itemEquip.style.padding = '0.6rem';
  itemEquip.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #fff; font-size: 0.72rem;">Bronzetto Casuale</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Arma o amuleto di bronzo rituale</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-equip" style="background: var(--gold); color: #000; font-size: 0.65rem; padding: 0.3rem 0.6rem;">🪙 600</button>
  `;
  container.appendChild(itemEquip);
  document.getElementById('btn-buy-equip')!.addEventListener('click', buyMerchantEquip);

  // 2. Offerta Ossidiana Vulcanica
  const itemGems = document.createElement('div');
  itemGems.className = 'currency-item';
  itemGems.style.justifyContent = 'space-between';
  itemGems.style.padding = '0.6rem';
  itemGems.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #fff; font-size: 0.72rem;">Ossidiana Vulcanica (+15 💎)</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Acquista minerali della mappa</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-gems" style="background: var(--gold); color: #000; font-size: 0.65rem; padding: 0.3rem 0.6rem;">🪙 350</button>
  `;
  container.appendChild(itemGems);
  document.getElementById('btn-buy-gems')!.addEventListener('click', buyMerchantGems);

  // 3. Offerta Evocazione Portale del Mercante
  const itemSummon = document.createElement('div');
  itemSummon.className = 'currency-item';
  itemSummon.style.justifyContent = 'space-between';
  itemSummon.style.padding = '0.6rem';
  itemSummon.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #a07cf8; font-size: 0.72rem;">Evoca con Ossidiana 🔮</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Tenta il risveglio di un eroe casuale</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-summon" style="background: var(--special); color: #fff; border: none; border-radius: 4px; font-size: 0.65rem; padding: 0.3rem 0.6rem; cursor: pointer;">💎 15</button>
  `;
  container.appendChild(itemSummon);
  document.getElementById('btn-buy-summon')!.addEventListener('click', buyMerchantSummon);

  // 4. Offerte Eroi Unici Selezionati
  merchantHeroOffers.forEach((offer, idx) => {
    const card = document.createElement('div');
    card.className = 'merchant-offer-card';
    
    let classEmoji = '⚔️';
    if (offer.template.heroClass === 'JANA') classEmoji = '🪄';
    else if (offer.template.heroClass === 'GIGANTE') classEmoji = '🛡️';
    else if (offer.template.heroClass === 'ACCABADORA') classEmoji = '💀';
    
    const gradeColor = GRADE_BORDER_COLOR[offer.template.grade] || '#8e9aa6';
    
    card.innerHTML = `
      <div class="merchant-offer-header">
        <div style="font-size: 1.4rem; background: rgba(255,255,255,0.03); border: 1px solid ${gradeColor}; border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          ${classEmoji}
        </div>
        <div class="merchant-offer-details">
          <span class="merchant-offer-name" style="color: ${gradeColor};">${offer.template.name}</span>
          <span class="merchant-offer-sub">${offer.template.heroClass} • Grado ${offer.template.grade}</span>
        </div>
      </div>
      <div class="merchant-offer-buttons">
        <button class="btn-merchant-buy" id="btn-buy-offer-coins-${idx}" ${offer.bought ? 'disabled' : ''}>
          ${offer.bought ? 'VENDUTO' : `🪙 ${offer.costCoins}`}
        </button>
        <button class="btn-merchant-buy" id="btn-buy-offer-gems-${idx}" style="color: #63b3ed; border-color: rgba(99, 179, 237, 0.3);" ${offer.bought ? 'disabled' : ''}>
          ${offer.bought ? 'VENDUTO' : `💎 ${offer.costGems}`}
        </button>
      </div>
    `;
    
    container.appendChild(card);
    
    if (!offer.bought) {
      document.getElementById(`btn-buy-offer-coins-${idx}`)!.addEventListener('click', () => buyMerchantOffer(idx, 'COINS'));
      document.getElementById(`btn-buy-offer-gems-${idx}`)!.addEventListener('click', () => buyMerchantOffer(idx, 'GEMS'));
    }
  });
}

function buyMerchantOffer(index: number, currency: 'COINS' | 'GEMS') {
  const offer = merchantHeroOffers[index];
  if (!offer || offer.bought) return;

  const lang = gameState.language || 'it';

  if (getRunHeroCount() >= 5) {
    alert(lang === 'it' ? '❌ Squadra al completo! Max 5 guerrieri per run.' : '❌ Team full! Max 5 warriors per run.');
    return;
  }

  if (currency === 'COINS') {
    if (gameState.coins < offer.costCoins) {
      alert(lang === 'it' ? "❌ Monete d'oro insufficienti!" : "❌ Insufficient gold coins!");
      return;
    }
    gameState.coins -= offer.costCoins;
  } else {
    if (gameState.gems < offer.costGems) {
      alert(lang === 'it' ? "❌ Ossidiana insufficiente!" : "❌ Insufficient Obsidian gems!");
      return;
    }
    gameState.gems -= offer.costGems;
  }
  
  offer.bought = true;
  const heroObj = instantiateHero(offer.template);
  gameState.inventory.push(heroObj);
  unlockCodexHero(heroObj.name);
  
  alert(lang === 'it'
    ? `🛒 ACQUISTO EFFETTUATO!\nHai reclutato: ${heroObj.name} (${heroObj.grade})! Aggiunto in riserva.`
    : `🛒 PURCHASE COMPLETED!\nYou recruited: ${heroObj.name} (${heroObj.grade})! Added to reserve.`);
    
  renderMerchantItems();
  renderInventorySlots();
  updateUI();
  GameStorage.save();
  AudioSynth.playLevelUp();
}

function buyMerchantSummon() {
  const lang = gameState.language || 'it';
  if (gameState.gems < 15) {
    alert(lang === 'it' ? "❌ Ossidiana insufficiente!" : "❌ Insufficient Obsidian gems!");
    return;
  }
  if (getRunHeroCount() >= 5) {
    alert(lang === 'it' ? '❌ Squadra al completo! Max 5 guerrieri per run.' : '❌ Team full! Max 5 warriors per run.');
    return;
  }
  gameState.gems -= 15;
  
  const grade = rollGachaGrade();
  const template = getRandomUnlockedTemplateOfGrade(grade);
  const heroObj = instantiateHero(template);
  gameState.inventory.push(heroObj);
  unlockCodexHero(heroObj.name);
  
  alert(lang === 'it'
    ? `🔮 EVOCAZIONE EFFETTUATA!\nHai risvegliato: ${heroObj.name} (${heroObj.grade})! Aggiunto in riserva.`
    : `🔮 SUMMON COMPLETED!\nYou awakened: ${heroObj.name} (${heroObj.grade})! Added to reserve.`);
    
  renderMerchantItems();
  renderInventorySlots();
  updateUI();
  GameStorage.save();
  AudioSynth.playAscension();
}

function buyMerchantGems() {
  const lang = gameState.language || 'en';
  if (gameState.coins < 350) {
    alert(lang === 'en' ? "❌ Insufficient gold coins!" : "❌ Monete d'oro insufficienti!");
    return;
  }
  gameState.coins -= 350;
  gameState.gems += 15;

  alert(lang === 'en'
    ? `🛒 PURCHASE COMPLETED!\nYou received +15 Obsidian Gems 💎!`
    : `🛒 ACQUISTO EFFETTUATO!\nHai ricevuto +15 Gemme di Ossidiana 💎!`);
  
  renderMerchantItems();
  updateUI();
  GameStorage.save();
}

function buyMerchantEquip() {
  const lang = gameState.language || 'en';
  if (gameState.coins < 600) {
    alert(lang === 'en' ? "❌ Insufficient gold coins!" : "❌ Monete d'oro insufficienti!");
    return;
  }
  gameState.coins -= 600;

  // Genera un bronzetto casuale
  const baseEquip = BRONZE_EQUIPMENTS[Math.floor(Math.random() * BRONZE_EQUIPMENTS.length)];
  const equip: Equipment = {
    ...baseEquip,
    id: 'eq_' + Math.random().toString(36).substring(2, 11)
  };
  gameState.equipmentInventory.push(equip);

  alert(lang === 'en'
    ? `🛒 PURCHASE COMPLETED!\nYou obtained the equipment: ${equip.icon} ${equip.name}! Added to inventory.`
    : `🛒 ACQUISTO EFFETTUATO!\nHai ottenuto l'equipaggiamento: ${equip.icon} ${equip.name}! Aggiunto in inventario.`);
  
  renderMerchantItems();
  updateUI();
  GameStorage.save();
}

function openPreBossShop() {
  const lang = gameState.language || 'it';
  pendingBossCombat = true;

  // Riusa il popup merchant con titolo e tasto dedicati
  const titleEl = document.querySelector('#popup-merchant h2') as HTMLElement;
  if (titleEl) titleEl.innerText = lang === 'it' ? '⚔️ Preparati alla Battaglia!' : '⚔️ Prepare for Battle!';

  const descEl = document.querySelector('#popup-merchant > div > p') as HTMLElement;
  if (descEl) descEl.innerText = lang === 'it'
    ? '"Usa le tue risorse prima dello scontro col Guardiano del Nuraghe!"'
    : '"Spend your resources before facing the Guardian of the Nuraghe!"';

  const closeBtn = document.getElementById('btn-merchant-close')!;
  closeBtn.innerText = lang === 'it' ? '⚔️ AFFRONTA IL BOSS →' : '⚔️ FIGHT THE BOSS →';
  closeBtn.style.background = '#E63946';
  closeBtn.style.color = '#fff';

  merchantHeroOffers = [];
  renderMerchantItems();
  document.getElementById('popup-merchant')!.classList.add('active');
}

function openDecisionEvent() {
  const lang = gameState.language || 'en';
  const descriptionsEN = [
    "You stand before an ancient Nuraghe that is partially collapsed. You hear noises and see a glow coming from inside.",
    "A secondary path winds deep into the thick holm oaks of Barbagia. It looks dark but might hide something.",
    "You have noticed ancient runic carvings on a basalt slab. Beneath the slab, there seems to be a hollow space."
  ];
  const descriptionsIT = [
    "Ti trovi di fronte ad un antico Nuraghe parzialmente crollato. Senti rumori ed un bagliore provenire dall'interno.",
    "Un sentiero secondario si addentra tra le fitte querce della Barbagia. Sembra oscuro ma potrebbe nascondere qualcosa.",
    "Hai notato delle antiche incisioni runiche su una lastra di basalto. Sotto la lastra, sembra esserci una cavità."
  ];
  const descList = lang === 'en' ? descriptionsEN : descriptionsIT;
  document.getElementById('decision-description')!.innerText = descList[Math.floor(Math.random() * descList.length)];
  document.getElementById('popup-decision')!.classList.add('active');
}

function makeSafeChoice() {
  const lang = gameState.language || 'en';
  document.getElementById('popup-decision')!.classList.remove('active');
  gameState.coins += 150;
  
  // Apri popup di notifica
  const overlay = document.getElementById('popup-event')!;
  const title = document.getElementById('popup-title')!;
  const icon = document.getElementById('popup-icon')!;
  const desc = document.getElementById('popup-desc')!;
  
  title.innerText = lang === 'en' ? 'Safe Path!' : 'Sentiero Sicuro!';
  icon.innerText = '🪙';
  desc.innerText = lang === 'en'
    ? 'You decided to continue on the safe path. You gain +150 Gold Coins!'
    : 'Hai deciso di proseguire sul sentiero battuto in piena sicurezza. Guadagni +150 Monete d\'Oro!';
  overlay.classList.add('active');

  updateUI();
  GameStorage.save();
}

function makeRiskyChoice() {
  const lang = gameState.language || 'en';
  document.getElementById('popup-decision')!.classList.remove('active');

  const overlay = document.getElementById('popup-event')!;
  const title = document.getElementById('popup-title')!;
  const icon = document.getElementById('popup-icon')!;
  const desc = document.getElementById('popup-desc')!;

  const isSuccess = Math.random() < 0.50;

  if (isSuccess) {
    gameState.gems += 30;
    title.innerText = lang === 'en' ? 'Great Success!' : 'Grande Successo!';
    icon.innerText = '💎';
    desc.innerText = lang === 'en'
      ? 'The exploration was successful! You mined +30 Obsidian Gems 💎!'
      : 'L\'esplorazione è andata a buon fine! Hai estratto ben +30 Gemme di Ossidiana 💎!';
  } else {
    // Malus trappola: 20% hp
    gameState.team.forEach(h => {
      if (h.currentHp > 0) {
        const dmg = Math.round(h.maxHp * 0.20);
        h.currentHp = Math.max(0, h.currentHp - dmg);
      }
    });

    const phoneCase = document.querySelector('.phone-case') as HTMLElement;
    if (phoneCase) {
      phoneCase.style.animation = 'floatDmg 0.15s ease-in 3';
      setTimeout(() => phoneCase.style.animation = '', 500);
    }

    title.innerText = lang === 'en' ? 'Nuragic Rockslide!' : 'Frana Nuragica!';
    icon.innerText = '🕸️';
    desc.innerText = lang === 'en'
      ? 'The passage collapsed! A rain of boulders hit the team, dealing 20% HP damage.'
      : 'Il passaggio è crollato! Una pioggia di massi ha colpito il team infliggendo il 20% di danno HP.';
  }

  overlay.classList.add('active');
  updateUI();
  GameStorage.save();
}

// ─── LANDMARK POPUP ───

function initLandmarkPopup() {
  document.getElementById('btn-landmark-go')!.addEventListener('click', closeLandmarkPopup);
  document.getElementById('btn-landmark-skip')!.addEventListener('click', closeLandmarkPopup);
}

function showLandmarkPopup(level: number) {
  const lang = gameState.language || 'it';
  const idx = Math.min(STAGE_VISUALS.length - 1, level - 1);
  const scenario = SCENARIOS_LOCALIZED[idx];
  const visual = STAGE_VISUALS[idx];

  // Testi
  document.getElementById('landmark-badge')!.textContent =
    lang === 'it' ? `TAPPA ${level}` : `STAGE ${level}`;
  document.getElementById('landmark-name')!.textContent =
    lang === 'it' ? scenario.name.it.replace(/^Tappa \d+: /, '') : scenario.name.en.replace(/^Stage \d+: /, '');
  document.getElementById('landmark-desc')!.textContent =
    lang === 'it' ? scenario.desc.it : scenario.desc.en;
  document.getElementById('landmark-icon-large')!.textContent = visual.icon;

  // Stile placeholder
  const placeholder = document.getElementById('landmark-placeholder')!;
  placeholder.style.background = visual.gradient;
  placeholder.classList.remove('hidden');

  // Colore pulsante accento per questo stage
  const btn = document.getElementById('btn-landmark-go') as HTMLButtonElement;
  btn.style.background = `linear-gradient(135deg, ${visual.accentColor} 0%, ${visual.accentColor}99 100%)`;

  // Tenta di caricare l'immagine generata; se esiste la mostra, altrimenti placeholder
  const img = document.getElementById('landmark-img') as HTMLImageElement;
  img.classList.remove('loaded');
  const imgPath = `assets/art/stages/stage_${String(level).padStart(2, '0')}.png`;
  const testImg = new Image();
  testImg.onload = () => {
    img.src = imgPath;
    img.classList.add('loaded');
    placeholder.classList.add('hidden');
  };
  testImg.src = imgPath;

  // Mostra popup
  const popup = document.getElementById('popup-landmark')!;
  popup.classList.add('active');
}

function closeLandmarkPopup() {
  document.getElementById('popup-landmark')!.classList.remove('active');
}

// ─── CODICE LA GROTTA DELLE EVOCAZIONI (GACHA STORE) ───

function initGachaStore() {
  document.getElementById('btn-gacha-single')!.addEventListener('click', () => pullGacha(1));
  document.getElementById('btn-gacha-multi')!.addEventListener('click', () => pullGacha(10));
  document.getElementById('btn-gacha-confirm')!.addEventListener('click', closeGachaReveal);
}

async function pullGacha(pullsCount: number) {
  const lang = gameState.language || 'en';
  const cost = pullsCount === 1 ? ECONOMY.PULL_SINGLE : ECONOMY.PULL_MULTI;

  if (gachaMode === 'SESSION') {
    if (gameState.gems < cost) {
      alert(lang === 'en'
        ? "❌ Insufficient Obsidian! Earn more gems by winning battles or clearing stages."
        : "❌ Ossidiana insufficiente! Ottieni altre gemme vincendo scontri o superando i livelli.");
      return;
    }
    gameState.gems -= cost;
  } else {
    if (gameState.eternalGems < cost) {
      alert(lang === 'en'
        ? "❌ Insufficient Eternal Gems! Convert obsidian in shop or make mock IAP purchases."
        : "❌ Gemme Primordiali insufficienti! Converti ossidiana nello shop o effettua un finto acquisto premium.");
      return;
    }
    gameState.eternalGems -= cost;
  }

  updateUI();
  GameStorage.save();

  // Avvia animazione visiva a tutto schermo
  const overlay = document.getElementById('popup-gacha-reveal')!;
  const vortex = document.getElementById('portal-vortex')!;
  const vortex2 = document.getElementById('portal-vortex-2')!;
  const vortex3 = document.getElementById('portal-vortex-3')!;
  const flash = document.getElementById('portal-flash')!;
  const revealContainer = document.getElementById('gacha-reveal-container')!;
  const cardsDisplay = document.getElementById('gacha-cards-display')!;

  overlay.classList.add('active');
  vortex.className = 'gacha-portal-vortex active';
  vortex2.className = 'gacha-portal-vortex-2 active';
  vortex3.className = 'gacha-portal-vortex-3 active';
  revealContainer.style.display = 'none';
  cardsDisplay.innerHTML = '';

  // Genera i tiri gacha ed individua la rarità massima per il colore del flash!
  const pulledHeroes: Hero[] = [];
  let maxGrade: HeroGrade = 'C';

  for (let p = 0; p < pullsCount; p++) {
    const grade = rollGachaGrade();
    // Aggiorna pity: reset su SR, incremento altrimenti
    if (grade === 'SR') {
      gameState.pityCounter = 0;
    } else {
      gameState.pityCounter += 1;
    }
    let template: HeroTemplate;
    if (gachaMode === 'SESSION') {
      template = getRandomUnlockedTemplateOfGrade(grade);
    } else {
      template = getRandomLevelEligibleTemplateOfGrade(grade);
    }
    const heroObj = instantiateHero(template);
    pulledHeroes.push(heroObj);

    // Aggiorna rarità massima
    if (grade === 'SR') maxGrade = 'SR';
    else if (grade === 'S' && maxGrade !== 'SR') maxGrade = 'S';
    else if (grade === 'R' && maxGrade !== 'SR' && maxGrade !== 'S') maxGrade = 'R';
  }

  // Durata della concentrazione runica
  await sleep(1500);

  // Colora i vortici in base alla rarità massima
  const rarityColor = maxGrade === 'SR' ? 'var(--super-rare)' : (maxGrade === 'S' ? 'var(--special)' : (maxGrade === 'R' ? 'var(--rare)' : 'var(--common)'));
  vortex.style.borderColor = rarityColor;
  vortex2.style.borderColor = rarityColor;
  vortex3.style.borderColor = rarityColor;
  if (maxGrade === 'SR') {
    vortex.style.boxShadow = '0 0 30px rgba(200,167,107,0.5), inset 0 0 40px rgba(200,167,107,0.15)';
  } else if (maxGrade === 'S') {
    vortex.style.boxShadow = '0 0 25px rgba(128,90,213,0.5), inset 0 0 30px rgba(128,90,213,0.1)';
  }

  await sleep(600);

  // Trigger flash bianco accecante
  flash.className = 'gacha-portal-flash flash-trigger';

  await sleep(350);

  // Nascondi vortici, mostra le carte
  vortex.className = 'gacha-portal-vortex';
  vortex2.className = 'gacha-portal-vortex-2';
  vortex3.className = 'gacha-portal-vortex-3';
  revealContainer.style.display = 'block';
  flash.className = 'gacha-portal-flash';

  // Titolo responsivo
  const revealTitle = document.getElementById('gacha-reveal-title')!;
  revealTitle.innerText = pullsCount === 1 
    ? (lang === 'en' ? 'Hero Awakened!' : 'Eroe Risvegliato!') 
    : (lang === 'en' ? 'Heroes Awakened!' : 'Eroi Risvegliati!');
  if (maxGrade === 'SR') {
    revealTitle.innerHTML = lang === 'en' 
      ? '✨ <span style="color: var(--super-rare); font-weight:700;">LEGENDARY AWAKENING!</span> ✨'
      : '✨ <span style="color: var(--super-rare); font-weight:700;">RISVEGLIO LEGGENDARIO!</span> ✨';
  }

  // Rende le carte svelate visivamente (inizialmente invisibili — flip reveal le animerà)
  pulledHeroes.forEach(hero => {
    const card = document.createElement('div');
    card.className = `hero-slot hero-framed grade-${hero.grade.toLowerCase()}`;
    card.style.width = '75px';
    card.style.height = '105px';
    card.style.cursor = 'default';
    card.style.opacity = '0';

    card.innerHTML = buildFramedCardInner(hero, { showElem: true, isIdle: false });

    // Reclutamento in-game vs. sblocco permanente
    if (gachaMode === 'SESSION') {
      gameState.inventory.push(hero);
      // Già sbloccato per vincolo logico, aggiorna codex per sicurezza
      unlockCodexHero(hero.name);
    } else {
      const isNew = !gameState.unlockedCollection.includes(hero.name);
      if (isNew) {
        gameState.unlockedCollection.push(hero.name);
        unlockCodexHero(hero.name);
        card.innerHTML += `<div class="permanent-unlock-badge">${lang === 'en' ? 'NEW UNLOCK!' : 'NUOVO SBLOCCO!'}</div>`;
      } else {
        // Doppione permanente: restituisce un rimborso di gemme
        gameState.eternalGems += 3;
        card.innerHTML += `<div class="permanent-unlock-badge" style="background:linear-gradient(90deg, transparent, #e0c79b, transparent); color:#000;">${lang === 'en' ? 'REFUND (+3 🔮)' : 'DUPLICATO (+3 🔮)'}</div>`;
      }
    }

    cardsDisplay.appendChild(card);
  });

  // Animazione sequenziale a cascata per rivelare le carte (effetto premium!)
  const renderedCards = cardsDisplay.querySelectorAll('.hero-slot') as NodeListOf<HTMLElement>;
  for (let c = 0; c < renderedCards.length; c++) {
    await sleep(160);
    // Rimuovi inline opacity e triggera l'animazione flip 3D
    renderedCards[c].style.opacity = '';
    renderedCards[c].classList.add('card-flip-reveal');

    // Suono e particelle di svelamento!
    const hero = pulledHeroes[c];
    AudioSynth.playGachaReveal(hero.grade);
    
    const cardEl = renderedCards[c];
    const canvasEl = document.getElementById('particle-canvas');
    if (cardEl && canvasEl) {
      const cardRect = cardEl.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const x = cardRect.left - canvasRect.left + cardRect.width / 2;
      const y = cardRect.top - canvasRect.top + cardRect.height / 2;
      ParticleManager.spawnGachaReveal(x, y, hero.grade);
    }
  }

  // Salva stato finale
  renderInventorySlots();
  GameStorage.save();
}

function rollGachaGrade(): HeroGrade {
  // Hard pity: garantisce SR
  if (gameState.pityCounter >= ECONOMY.PITY_HARD) return 'SR';

  // Soft pity: ogni pull oltre PITY_SOFT aggiunge PITY_SOFT_BONUS% alla probabilità SR
  const softOverflow = Math.max(0, gameState.pityCounter - ECONOMY.PITY_SOFT + 1);
  const srRate = ECONOMY.RATE_SR_BASE + softOverflow * ECONOMY.PITY_SOFT_BONUS;

  const roll = Math.random() * 100;
  if (roll < srRate) return 'SR';
  if (roll < srRate + ECONOMY.RATE_S) return 'S';
  if (roll < srRate + ECONOMY.RATE_S + ECONOMY.RATE_R) return 'R';
  return 'C';
}

function getRandomUnlockedTemplateOfGrade(grade: HeroGrade): HeroTemplate {
  const eligible = Object.values(HEROES)
    .map(h => h.template)
    .filter(t => t.grade === grade && gameState.unlockedCollection.includes(t.name));
  
  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  
  // Se non ci sono eroi sbloccati di questa rarità, effettua un degradamento automatico delle rarità
  const order: HeroGrade[] = ['SR', 'S', 'R', 'C'];
  const startIdx = order.indexOf(grade);
  for (let i = startIdx + 1; i < order.length; i++) {
    const fallbackGrade = order[i];
    const fallbackEligible = Object.values(HEROES)
      .map(h => h.template)
      .filter(t => t.grade === fallbackGrade && gameState.unlockedCollection.includes(t.name));
    if (fallbackEligible.length > 0) {
      return fallbackEligible[Math.floor(Math.random() * fallbackEligible.length)];
    }
  }
  
  // Fallback estremo garantito (Josto è sbloccato di default)
  return HERO_TEMPLATES.SHARDANA_C;
}

function getRandomLevelEligibleTemplateOfGrade(grade: HeroGrade): HeroTemplate {
  const eligible = Object.values(HERO_TEMPLATES).filter(t => {
    const reqLvl = t.requiredProfileLevel || 1;
    return t.grade === grade && reqLvl <= gameState.profileLevel;
  });
  
  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  
  // Se il livello profilo non consente questa rarità, degrada
  const order: HeroGrade[] = ['SR', 'S', 'R', 'C'];
  const startIdx = order.indexOf(grade);
  for (let i = startIdx + 1; i < order.length; i++) {
    const fallbackGrade = order[i];
    const fallbackEligible = Object.values(HERO_TEMPLATES).filter(t => {
      const reqLvl = t.requiredProfileLevel || 1;
      return t.grade === fallbackGrade && reqLvl <= gameState.profileLevel;
    });
    if (fallbackEligible.length > 0) {
      return fallbackEligible[Math.floor(Math.random() * fallbackEligible.length)];
    }
  }
  
  return HERO_TEMPLATES.SHARDANA_C;
}

function closeGachaReveal() {
  document.getElementById('popup-gacha-reveal')!.classList.remove('active');
}

// ─── UTILS & RENDERING GENERALE ───

function updateUI() {
  const coinsEl = document.getElementById('ui-coins');
  const gemsEl = document.getElementById('ui-gems');
  const lvlEl = document.getElementById('ui-current-level');
  const eternalEl = document.getElementById('ui-eternal-gems');

  if (coinsEl) coinsEl.innerText = gameState.coins.toString();
  if (gemsEl) gemsEl.innerText = gameState.gems.toString();
  if (lvlEl) lvlEl.innerText = gameState.level.toString();
  if (eternalEl) eternalEl.innerText = gameState.eternalGems.toString();

  // Aggiorna la Home Profile UI
  const profileLvlEl = document.getElementById('ui-profile-level');
  const profileExpBar = document.getElementById('ui-profile-exp-bar') as HTMLElement;
  const profileExpText = document.getElementById('ui-profile-exp-text');
  const homeAdvDesc = document.getElementById('ui-home-adventure-desc');

  if (profileLvlEl) profileLvlEl.innerText = gameState.profileLevel.toString();
  
  const requiredExp = gameState.profileLevel * 150;
  if (profileExpBar) {
    const percentage = Math.min(100, (gameState.profileExp / requiredExp) * 100);
    profileExpBar.style.width = `${percentage}%`;
  }
  if (profileExpText) {
    profileExpText.innerText = `${gameState.profileExp} / ${requiredExp} XP`;
  }
  if (homeAdvDesc) {
    const lang = gameState.language || 'it';
    const scenarioIdx = Math.min(SCENARIOS_LOCALIZED.length - 1, gameState.level - 1);
    const scenario = SCENARIOS_LOCALIZED[scenarioIdx];
    homeAdvDesc.innerText = lang === 'en'
      ? `Map: Stage ${gameState.level} (${scenario.name.en.split(': ')[1] || scenario.name.en})`
      : `Mappa: Tappa ${gameState.level} (${scenario.name.it.split(': ')[1] || scenario.name.it})`;
  }

  // Forza il rendering del deck iniziale e lo stato dei bottoni navigazione
  renderHomeStarterDeck();
  checkExplorationStatus();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function translateAllHeroInstanceNamesAndSkills() {
  const lang = gameState.language || 'en';
  
  const translateHero = (h: Hero) => {
    const loc = HEROES_BY_NAME[h.name]?.localized;
    if (loc) {
      h.skillName = loc.skillName[lang];
      h.desc = loc.desc[lang];
    }
  };
  
  gameState.team.forEach(translateHero);
  if (gameState.inventory) {
    gameState.inventory.forEach(translateHero);
  }
}

function applyTranslations() {
  const lang = gameState.language || 'en';
  
  // Set html lang attribute
  document.documentElement.lang = lang;
  
  // Update flag button
  const btnLang = document.getElementById('btn-toggle-lang');
  if (btnLang) {
    btnLang.innerText = lang === 'en' ? '🇬🇧' : '🇮🇹';
    btnLang.setAttribute('title', lang === 'en' ? "Switch to Italian" : "Passa a Inglese");
  }
  
  // Update static text elements in DOM
  for (const [id, value] of Object.entries(LOCALIZATION_DICTIONARY)) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = value[lang];
    }
  }
  
  // Translate bottom navigation labels
  const navLblHome = document.getElementById('nav-lbl-home');
  if (navLblHome) navLblHome.innerText = lang === 'en' ? "Home" : "Home";
  
  const navLblBoard = document.getElementById('nav-lbl-board');
  if (navLblBoard) navLblBoard.innerText = lang === 'en' ? "Board" : "Tavola";
  
  const navLblTeam = document.getElementById('nav-lbl-team');
  if (navLblTeam) navLblTeam.innerText = lang === 'en' ? "Team" : "Squadra";
  
  const navLblCodex = document.getElementById('nav-lbl-codex');
  if (navLblCodex) navLblCodex.innerText = lang === 'en' ? "Codex" : "Codice";
  
  const navLblGacha = document.getElementById('nav-lbl-gacha');
  if (navLblGacha) navLblGacha.innerText = lang === 'en' ? "Summon" : "Altare";
  
  // Gacha page title and description
  const gachaScreen = document.getElementById('screen-gacha');
  if (gachaScreen) {
    const bannerTitle = gachaScreen.querySelector('.scenario-banner h2');
    const bannerDesc = gachaScreen.querySelector('.scenario-banner p');
    if (bannerTitle) bannerTitle.textContent = lang === 'en' ? "Summoning Altar" : "Altare delle Evocazioni";
    if (bannerDesc) bannerDesc.textContent = lang === 'en' ? "Spend gems to awaken ancient Sardinian warriors" : "Spendi le gemme per risvegliare antichi guerrieri sardi";
    
    const ratesTitle = gachaScreen.querySelector('.rates-title');
    if (ratesTitle) ratesTitle.textContent = lang === 'en' ? "SUMMONING PROBABILITIES" : "PROBABILITÀ DI EVOCAZIONE";
    
    const singleLbl = document.querySelector('#btn-gacha-single .pull-lbl');
    if (singleLbl) singleLbl.textContent = lang === 'en' ? "Single Summon" : "Evoca Singola";
    
    const multiLbl = document.querySelector('#btn-gacha-multi .pull-lbl');
    if (multiLbl) multiLbl.textContent = lang === 'en' ? "Multi-Summon 10x" : "Multi-Evoca 10x";
  }

  // Update scenario titles/descriptions in board dynamically
  const container = document.getElementById('board-container');
  if (container) {
    const scenarioIndex = Math.min(SCENARIOS_LOCALIZED.length - 1, gameState.level - 1);
    const scenario = SCENARIOS_LOCALIZED[scenarioIndex];
    const bannerTitle = document.querySelector('#screen-board .scenario-banner h2');
    const bannerDesc = document.querySelector('#screen-board .scenario-banner p');
    if (bannerTitle) bannerTitle.textContent = scenario.name[lang];
    if (bannerDesc) bannerDesc.textContent = scenario.desc[lang];
  }
  
  // Translate combat screen title and elements
  const combatTitle = document.querySelector('#screen-combat h3');
  if (combatTitle) combatTitle.textContent = lang === 'en' ? "REAL-TIME COMBAT" : "SCONTRO IN TEMPO REALE";

  // Translate all active and inventory heroes
  translateAllHeroInstanceNamesAndSkills();
  
  // Re-render UI grids to reflect language change
  updateUI();
  renderCodexGrid();
  updateAutoCombatButtonUI();
}

function unlockCodexHero(name: string) {
  if (!gameState.unlockedCollection) {
    gameState.unlockedCollection = [];
  }
  if (!gameState.unlockedCollection.includes(name)) {
    gameState.unlockedCollection.push(name);
    // Render immediately if screen is active
    renderCodexGrid();
    GameStorage.save();
  }
}

function renderCodexGrid() {
  const grid = document.getElementById('codex-grid')!;
  if (!grid) return;
  
  grid.innerHTML = '';
  const lang = gameState.language || 'en';
  
  // Aggiorna contatore
  const unlockedCount = gameState.unlockedCollection ? gameState.unlockedCollection.length : 0;
  const progressEl = document.getElementById('lbl-codex-progress');
  if (progressEl) {
    progressEl.innerText = lang === 'en' 
      ? `UNLOCKED COLLECTION: ${unlockedCount} / 13`
      : `COLLEZIONE SBLOCCATA: ${unlockedCount} / 13`;
  }
  
  // Ciclo su tutti i 13 eroi del database ordinati
  const orderedHeroKeys = [
    'SHARDANA_C', 'ACCABADORA_C', 'GIGANTE_C', 'JANA_C',
    'GIGANTE_R', 'SHARDANA_R', 'JANA_R',
    'JANA_S', 'ACCABADORA_S', 'SHARDANA_S',
    'SHARDANA_SR', 'GIGANTE_SR', 'ACCABADORA_SR'
  ];
  
  orderedHeroKeys.forEach(key => {
    const template = HERO_TEMPLATES[key];
    const isUnlocked = gameState.unlockedCollection ? gameState.unlockedCollection.includes(template.name) : false;
    
    const card = document.createElement('div');
    card.className = `codex-card hero-framed grade-${template.grade.toLowerCase()} ${isUnlocked ? '' : 'locked'}`;

    if (isUnlocked) {
      card.innerHTML = buildFramedCardInner(template, { isIdle: true });
      card.addEventListener('click', () => openCodexLore(template.name));
    } else {
      const reqLvl = template.requiredProfileLevel || 1;
      card.innerHTML = `
        <img class="card-frame-bg" src="${getRarityFrameSrc(template.grade)}" alt="" style="filter: grayscale(1) opacity(0.3);">
        <div class="card-hero-emoji">🔒</div>
        <div class="card-hero-name-overlay">${lang === 'en' ? `Lvl ${reqLvl}+` : `Liv ${reqLvl}+`}</div>
        <span class="card-grade-badge ${template.grade.toLowerCase()}">${template.grade}</span>
      `;
    }
    
    grid.appendChild(card);
  });
}

function openCodexLore(heroName: string) {
  const overlay = document.getElementById('popup-codex-lore')!;
  const nameEl = document.getElementById('lore-hero-name')!;
  const titleEl = document.getElementById('lore-hero-title')!;
  const avatarEl = document.getElementById('lore-hero-avatar')!;
  const historyEl = document.getElementById('lore-hero-history')!;
  
  const lang = gameState.language || 'en';
  
  const template = Object.values(HERO_TEMPLATES).find(t => t.name === heroName);
  const lore = HEROES_BY_NAME[heroName]?.lore;
  
  if (template && lore) {
    nameEl.innerText = template.name;
    titleEl.innerText = lore.title[lang];
    avatarEl.innerHTML = getHeroAvatarHtml(template, true, 'large');
    historyEl.innerText = lore.history[lang];
    
    const popupBox = overlay.querySelector('.codex-lore-box') as HTMLElement;
    if (popupBox) {
      let rarityColor = 'var(--gold)';
      if (template.grade === 'C') rarityColor = 'var(--common)';
      else if (template.grade === 'R') rarityColor = 'var(--rare)';
      else if (template.grade === 'S') rarityColor = 'var(--special)';
      popupBox.style.borderColor = rarityColor;
    }
    
    overlay.classList.add('active');
  }
}

// ─── NUOVE FUNZIONI DI METAPROGRESSIONE, SHOP E GESTIONE RUN ───

let isExplorationActive = false;
let gachaMode: 'PERMANENT' | 'SESSION' = 'PERMANENT';
let isAutoCombat = false;
let activeEnemy: Enemy | null = null;
let currentBattleTime = 0.0;
let selectedRosterNames: string[] = [];
let merchantHeroOffers: { template: HeroTemplate, costCoins: number, costGems: number, bought: boolean }[] = [];
let pendingEliteRecruitment = false;
let pendingBossCombat = false;

function checkExplorationStatus() {
  isExplorationActive = gameState.team && gameState.team.length > 0;
  
  const btnBoard = document.getElementById('nav-btn-board')!;
  const btnTeam = document.getElementById('nav-btn-team')!;
  
  if (!isExplorationActive) {
    btnBoard.classList.add('disabled');
    btnTeam.classList.add('disabled');
    
    const adventureBtnLbl = document.getElementById('lbl-btn-start-adventure');
    if (adventureBtnLbl) {
      adventureBtnLbl.innerText = gameState.language === 'en' ? 'START EXPLORATION ➔' : 'INIZIA VIAGGIO ➔';
    }
  } else {
    btnBoard.classList.remove('disabled');
    btnTeam.classList.remove('disabled');
    
    const adventureBtnLbl = document.getElementById('lbl-btn-start-adventure');
    if (adventureBtnLbl) {
      adventureBtnLbl.innerText = gameState.language === 'en' ? 'RESUME EXPLORATION ➔' : 'RIPRENDI VIAGGIO ➔';
    }
  }
}

function updateGachaViewMode() {
  const lang = gameState.language || 'it';
  
  if (lastScreenBeforeGacha === 'screen-board' || lastScreenBeforeGacha === 'screen-team' || lastScreenBeforeGacha === 'screen-combat') {
    gachaMode = 'SESSION';
  } else {
    gachaMode = 'PERMANENT';
  }

  const titleEl = document.querySelector('#screen-gacha h2')!;
  const descEl = document.getElementById('lbl-premium-shop-desc') || document.querySelector('#screen-gacha p')!;
  const singleCostEl = document.querySelector('#btn-gacha-single .pull-cost')!;
  const multiCostEl = document.querySelector('#btn-gacha-multi .pull-cost')!;

  if (gachaMode === 'SESSION') {
    titleEl.innerHTML = lang === 'en' ? 'Run Session Summon' : 'Evocazione di Sessione';
    descEl.innerHTML = lang === 'en' 
      ? 'Spend in-game Obsidian Gems to temporarily recruit heroes from your unlocked collection.' 
      : 'Spendi Gemme di Ossidiana in-game per reclutare temporaneamente gli eroi dalla tua collezione sbloccata.';
    
    singleCostEl.innerHTML = `<img src="assets/art/ui_gem_icon.svg" class="curr-icon"> ${ECONOMY.PULL_SINGLE}`;
    multiCostEl.innerHTML = `<img src="assets/art/ui_gem_icon.svg" class="curr-icon"> ${ECONOMY.PULL_MULTI}`;
  } else {
    titleEl.innerHTML = lang === 'en' ? 'Ancestors Summon Altar' : 'Tempio degli Antenati';
    descEl.innerHTML = lang === 'en' 
      ? 'Spend Premium Eternal Gems to permanently unlock new mythological heroes based on your profile level.' 
      : 'Spendi Gemme Primordiali per sbloccare permanentemente nuovi eroi mitologici basati sul tuo livello profilo.';
    
    singleCostEl.innerHTML = `<span style="font-size:1rem; line-height:1;">🔮</span> ${ECONOMY.PULL_SINGLE}`;
    multiCostEl.innerHTML = `<span style="font-size:1rem; line-height:1;">🔮</span> ${ECONOMY.PULL_MULTI}`;
  }

  // Aggiorna barra pity
  const pityCount = document.getElementById('pity-count');
  const pityFill = document.getElementById('pity-bar-fill');
  if (pityCount && pityFill) {
    const counter = gameState.pityCounter;
    pityCount.textContent = `${counter}/${ECONOMY.PITY_HARD}`;
    const pct = Math.min(100, (counter / ECONOMY.PITY_HARD) * 100);
    pityFill.style.width = `${pct}%`;
    // Colore giallo oro quando vicino alla pity garantita
    if (counter >= ECONOMY.PITY_SOFT) {
      pityFill.style.background = 'linear-gradient(90deg, var(--special), var(--super-rare))';
    } else {
      pityFill.style.background = 'linear-gradient(90deg, var(--rare), var(--special), var(--super-rare))';
    }
  }
}

function navigateToScreen(screenId: string) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
  const navBtn = document.querySelector(`.nav-btn[data-screen="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');
  
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  
  if (screenId === 'screen-board') {
    setTimeout(scrollToPlayer, 100);
  }
}

function startOrResumeExplorationRun() {
  const lang = gameState.language || 'it';
  
  if (isExplorationActive) {
    // Riprendi
    navigateToScreen('screen-board');
    return;
  }
  
  // Avvia una nuova run
  if (confirm(lang === 'it' 
    ? "Stai per iniziare un nuovo viaggio sardo! Le monete e le gemme di ossidiana accumulate nella run precedente verranno azzerate. Confermi?" 
    : "You are about to start a new exploration run! In-game coins and obsidian gems from the previous run will be reset. Confirm?")) {
    
    openRosterSelectPopup();
  }
}

function renderHomeStarterDeck() {
  const container = document.getElementById('home-starter-deck-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  const starters = [
    HERO_TEMPLATES.SHARDANA_C, // Josto
    HERO_TEMPLATES.GIGANTE_C,  // Bruncu
    HERO_TEMPLATES.ACCABADORA_C // Caddozzo
  ];
  
  starters.forEach(t => {
    const el = document.createElement('div');
    el.className = 'hero-slot hero-framed grade-c';
    el.style.width = '100%';
    el.style.aspectRatio = '1 / 1.35';
    el.style.cursor = 'default';
    el.innerHTML = buildFramedCardInner(t, { showElem: true });
    container.appendChild(el);
  });
}

function buyPremiumPack(gemsGained: number, price: number) {
  const lang = gameState.language || 'it';
  
  // Simula l'IAP mobile nativo
  alert(lang === 'it'
    ? `📲 [SIMULAZIONE APP STORE / GOOGLE PLAY]\n\nProcedo al pagamento di € ${price.toFixed(2)} tramite il tuo account di sistema...\n\nAcquisto completato con successo! ✅`
    : `📲 [MOCK APP STORE / GOOGLE PLAY IN-APP PURCHASE]\n\nProcessing payment of € ${price.toFixed(2)} using your native sandbox account...\n\nTransaction completed successfully! ✅`);
  
  gameState.eternalGems += gemsGained;
  
  // Chiudi shop ed aggiorna
  document.getElementById('popup-premium-shop')!.classList.remove('active');
  updateUI();
  GameStorage.save();
  
  // Suonino monetizzazione
  AudioSynth.playAscension();
}

function convertExplorationGems() {
  const lang = gameState.language || 'it';
  
  if (gameState.gems < 100) {
    alert(lang === 'it'
      ? "❌ Ossidiana in-game insufficiente! Ti servono almeno 100 Ossidiane per effettuare la conversione."
      : "❌ Insufficient in-game Obsidian! You need at least 100 Obsidian to perform conversion.");
    return;
  }
  
  gameState.gems -= 100;
  gameState.eternalGems += 10;
  
  alert(lang === 'it'
    ? "🔄 Conversione completata! Hai scambiato 100 Ossidiane per 10 Gemme Primordiali."
    : "🔄 Conversion completed! You traded 100 Obsidian for 10 Eternal Gems.");
    
  updateUI();
  GameStorage.save();
  AudioSynth.playLevelUp();
}

function checkForProfileLevelUp(xpGained: number) {
  gameState.profileExp += xpGained;
  const reqExp = gameState.profileLevel * 150;
  const lang = gameState.language || 'it';
  let leveledUp = false;
  
  while (gameState.profileExp >= reqExp) {
    gameState.profileExp -= reqExp;
    gameState.profileLevel += 1;
    leveledUp = true;
    
    // Regalo per level up
    gameState.eternalGems += 15;
  }
  
  if (leveledUp) {
    setTimeout(() => {
      alert(lang === 'it'
        ? `🎉 NUOVO LIVELLO PROFILO GIOCATORE: LV. ${gameState.profileLevel}! 🎉\nHai sbloccato la possibilità di trovare eroi più rari e ottenuto +15 Gemme Primordiali! 🔮`
        : `🎉 NEW PLAYER PROFILE LEVEL: LV. ${gameState.profileLevel}! 🎉\nYou unlocked the chance to summon rarer heroes and earned +15 Eternal Gems! 🔮`);
      
      renderCodexGrid();
      updateUI();
      GameStorage.save();
    }, 800);
  }
}

function updateAutoCombatButtonUI() {
  const btnAuto = document.getElementById('btn-toggle-auto-combat');
  if (!btnAuto) return;
  const lang = gameState.language || 'it';
  
  if (isAutoCombat) {
    btnAuto.classList.add('auto-active');
    btnAuto.innerText = lang === 'it' ? "AUTO: SI 🤖" : "AUTO: ON 🤖";
  } else {
    btnAuto.classList.remove('auto-active');
    btnAuto.innerText = lang === 'it' ? "AUTO: NO 🤖" : "AUTO: OFF 🤖";
  }
}

function executeActiveHeroSkill(hero: Hero) {
  if (!activeEnemy) return;
  const enemy = activeEnemy;
  const battleTime = currentBattleTime;
  const synergies = CombatEngine.calculateSynergies(gameState.team);
  
  const combatLog: string[] = [];
  CombatEngine.castHeroSkill(hero, gameState.team, enemy, battleTime, combatLog);
  
  combatLog.forEach(l => {
    const isHeal = l.includes('SOFFIO DI DOMUS') || l.includes('lancia Soffio di Domus');
    const isCrit = l.includes('Colpo di spada mitico') || l.includes('Esecuzione letale');
    const elemAdv = l.includes('Vantaggio Elementale');
    
    const row = document.getElementById(`row-${hero.name.replace(/\s+/g, '')}`);
    if (row) {
      row.style.borderColor = 'var(--gold)';
      setTimeout(() => row.style.borderColor = 'var(--gold-border)', 300);
      
      // Animazione Claymation: Attacco Speciale Eroe
      const img = row.querySelector('.avatar-image');
      if (img) {
        img.classList.add('avatar-attack-left');
        setTimeout(() => img.classList.remove('avatar-attack-left'), 500);
      }
    }
    
    if (isHeal) {
      gameState.team.forEach(h => {
        if (h.currentHp > 0) {
          const healVal = Math.round(hero.attack * 2.0 * (synergies.healMultiplier));
          spawnFloatingDamage(healVal.toString(), false, document.getElementById(`row-${h.name.replace(/\s+/g, '')}`), false, true);
          
          const hRow = document.getElementById(`row-${h.name.replace(/\s+/g, '')}`);
          if (hRow) {
            const hImg = hRow.querySelector('.avatar-image');
            if (hImg) {
              hImg.classList.add('avatar-idle');
            }
          }
        }
      });
      addCombatLog(l, 'text-success');
    } else {
      const isExec = l.includes('Esecuzione letale') || l.includes('letale');
      const dmgVal = Math.max(5, Math.round(hero.attack * (isExec ? 5.5 : (l.includes('COLPO DI GRAZIA') || l.includes('Colpo di Grazia') ? 2.0 : 3.5)) - enemy.defense));
      const elemMult = CombatEngine.getElementalMultiplier(hero.element || 'VENTO', enemy.element || 'VENTO');
      const finalDmg = Math.round(dmgVal * elemMult);

      if (isCrit || elemAdv) {
        AudioSynth.playCritHit();
        const enemyVisual = document.querySelector('.enemy-visual') as HTMLElement;
        const canvasEl = document.getElementById('particle-canvas');
        if (enemyVisual && canvasEl) {
          const rect = enemyVisual.getBoundingClientRect();
          const canvasRect = canvasEl.getBoundingClientRect();
          const x = rect.left - canvasRect.left + rect.width / 2;
          const y = rect.top - canvasRect.top + rect.height / 2;
          ParticleManager.spawnExplosion(x, y, isCrit ? '#fbb6ce' : '#ffd700', isCrit ? 20 : 12);
        }
      }

      // Animazione Claymation: Nemico colpito o abbattuto
      const enemyAvatarEl = document.getElementById('enemy-avatar');
      if (enemyAvatarEl) {
        const img = enemyAvatarEl.querySelector('.avatar-image');
        if (img) {
          if (enemy.currentHp <= 0) {
            img.classList.add('avatar-dead');
          } else {
            img.classList.add('avatar-hit');
            setTimeout(() => img.classList.remove('avatar-hit'), 500);
          }
        }
      }

      spawnFloatingDamage(finalDmg.toString(), false, document.querySelector('.enemy-visual'), isCrit || elemAdv, false);
      addCombatLog(l, l.includes('SCUDO CONCENTRICO') || l.includes('Scudo Concentrico') ? 'text-purple' : 'text-gold');
    }
  });

  // Aggiorna l'HP del nemico dopo l'attacco
  const enemyHpBar = document.getElementById('enemy-hp-bar')!;
  const enemyHpText = document.getElementById('enemy-hp-text')!;
  const enemyHpPct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
  enemyHpBar.style.width = `${enemyHpPct}%`;
  enemyHpText.innerText = `${enemy.currentHp}/${enemy.maxHp}`;

  // Azzera il timer e la prontezza
  hero.skillTimer = 0;
  hero.skillReady = false;

  const skillBar = document.getElementById(`skill-bar-${hero.name.replace(/\s+/g, '')}`);
  if (skillBar) {
    skillBar.style.width = '0%';
    skillBar.classList.remove('ready');
  }

  renderCombatTeamGrid();
}

function openRosterSelectPopup() {
  const lang = gameState.language || 'it';
  
  // Resetta la selezione impostando i 3 eroi di partenza di default se disponibili, altrimenti vuoto
  selectedRosterNames = ['Josto', 'Bruncu', 'Caddozzo'].filter(name => gameState.unlockedCollection.includes(name));
  
  // Limita a un massimo di 3 in ogni caso
  selectedRosterNames = selectedRosterNames.slice(0, 3);
  
  renderRosterSelectGrid();
  document.getElementById('popup-roster-select')!.classList.add('active');
}

function renderRosterSelectGrid() {
  const grid = document.getElementById('roster-select-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const lang = gameState.language || 'it';
  
  // Cicla su tutti gli eroi sbloccati nella collezione permanente
  const unlockedHeroes = Object.values(HEROES)
    .map(h => h.template)
    .filter(t => gameState.unlockedCollection.includes(t.name));
    
  unlockedHeroes.forEach(t => {
    const slot = document.createElement('div');
    const isSelected = selectedRosterNames.includes(t.name);
    
    // Classi condizionali per la selezione
    slot.className = `roster-hero-slot ${isSelected ? 'selected' : ''}`;
    slot.style.width = '82px';
    slot.style.height = '112px';
    
    // Genera l'HTML interno del frame
    slot.innerHTML = buildFramedCardInner(instantiateHero(t), { showElem: true, isIdle: true });
    
    // Listener del click per selezionare/deselezionare
    slot.addEventListener('click', () => {
      if (isSelected) {
        // Deseleziona
        selectedRosterNames = selectedRosterNames.filter(name => name !== t.name);
      } else {
        // Seleziona se non abbiamo superato le 3 unità
        if (selectedRosterNames.length < 3) {
          selectedRosterNames.push(t.name);
        } else {
          // Sostituisci l'elemento più vecchio (UX scorrevole premium!)
          selectedRosterNames.shift();
          selectedRosterNames.push(t.name);
        }
      }
      
      // Rinfresca la griglia e gli indicatori
      renderRosterSelectGrid();
    });
    
    grid.appendChild(slot);
  });
  
  // Aggiorna il contatore UI
  const counterEl = document.getElementById('lbl-roster-select-count')!;
  counterEl.innerText = lang === 'it' 
    ? `SELEZIONATI: ${selectedRosterNames.length} / 3`
    : `SELEZIONATI: ${selectedRosterNames.length} / 3`;
    
  // Abilita o disabilita il pulsante di avvio
  const confirmBtn = document.getElementById('btn-roster-confirm') as HTMLButtonElement;
  if (confirmBtn) {
    confirmBtn.disabled = selectedRosterNames.length !== 3;
  }
}

function confirmStartingRosterAndStart() {
  if (selectedRosterNames.length !== 3) return;
  
  // Chiudi il popup
  document.getElementById('popup-roster-select')!.classList.remove('active');
  
  // Salva il roster di partenza per i reset successivi (morte/fine mappa)
  gameState.startingRosterNames = selectedRosterNames.slice();

  // Azzera le risorse in-game e imposta la posizione
  gameState.coins = 100;
  gameState.gems = 10;
  gameState.playerPosition = 0;
  gameState.inventory = [];

  // Inizializza la squadra attiva con i 3 eroi scelti dall'utente instanziandoli
  gameState.team = selectedRosterNames.map(name => {
    const entry = Object.values(HEROES).find(h => h.template.name === name);
    return instantiateHero(entry!.template);
  });
  
  // Rigenera il tabellone e gli slot della squadra
  initBoard();
  initTeamSlots();
  
  // Salva ed aggiorna la schermata di gioco
  GameStorage.save();
  updateUI();
  
  navigateToScreen('screen-board');

  // Suonino di avventura
  AudioSynth.playLevelUp();
}

// ─── RESET ROSTER & RECLUTAMENTO IN-RUN ───

function resetToStartingRoster() {
  const names = gameState.startingRosterNames.length === 3
    ? gameState.startingRosterNames
    : ['Josto', 'Bruncu', 'Caddozzo'];
  gameState.team = names.map(name => {
    const entry = Object.values(HEROES).find(h => h.template.name === name);
    return entry ? instantiateHero(entry.template) : instantiateHero(HERO_TEMPLATES.SHARDANA_C);
  });
  gameState.inventory = [];
}

function getRunHeroCount(): number {
  return gameState.team.length + gameState.inventory.length;
}

function openRecruitmentPopup(source: 'ELITE' | 'ACCAMPAMENTO') {
  const lang = gameState.language || 'it';
  const titleEl = document.getElementById('recruit-title')!;
  const iconEl = document.getElementById('recruit-icon')!;
  const descEl = document.getElementById('recruit-desc')!;
  const itemsEl = document.getElementById('recruit-items')!;

  itemsEl.innerHTML = '';

  if (getRunHeroCount() >= 5) {
    titleEl.innerText = lang === 'it' ? 'Squadra al Completo' : 'Team Full';
    iconEl.innerText = '⚔️';
    descEl.innerText = lang === 'it'
      ? 'La tua squadra ha già raggiunto il massimo di 5 guerrieri per questa run.'
      : 'Your team has already reached the maximum of 5 warriors for this run.';
    document.getElementById('popup-recruit')!.classList.add('active');
    return;
  }

  if (source === 'ELITE') {
    titleEl.innerText = lang === 'it' ? 'Ricompensa Elite! 👾' : 'Elite Reward! 👾';
    iconEl.innerText = '👾';
    descEl.innerText = lang === 'it'
      ? 'Hai sconfitto il Campione Elite! Un guerriero vuole unirsi a te per questa run.'
      : 'You defeated the Elite Champion! One warrior wants to join you for this run.';
    const offer = getRandomRecruitOffer();
    if (offer) renderRecruitCard(offer, 0, 'ELITE', itemsEl);
  } else {
    titleEl.innerText = lang === 'it' ? 'Accampamento Sardo ⛺' : 'Sardinian Camp ⛺';
    iconEl.innerText = '⛺';
    descEl.innerText = lang === 'it'
      ? 'Guerrieri sardi offrono i propri servigi. Reclutali con le tue monete per questa run.'
      : 'Sardinian warriors offer their services. Recruit them with your coins for this run.';
    const used: string[] = [];
    [0, 1].forEach(idx => {
      const offer = getRandomRecruitOffer(used);
      if (offer) {
        used.push(offer.name);
        renderRecruitCard(offer, idx, 'ACCAMPAMENTO', itemsEl);
      }
    });
  }

  document.getElementById('popup-recruit')!.classList.add('active');
}

function getRandomRecruitOffer(exclude: string[] = []): HeroTemplate | null {
  const eligible = Object.values(HERO_TEMPLATES).filter(t =>
    gameState.unlockedCollection.includes(t.name) && !exclude.includes(t.name)
  );
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function renderRecruitCard(template: HeroTemplate, idx: number, source: 'ELITE' | 'ACCAMPAMENTO', container: HTMLElement) {
  const lang = gameState.language || 'it';

  let costCoins = 0;
  if (source === 'ACCAMPAMENTO') {
    if (template.grade === 'C') costCoins = 180;
    else if (template.grade === 'R') costCoins = 300;
    else if (template.grade === 'S') costCoins = 500;
    else costCoins = 800; // SR
  }

  const gradeColor = GRADE_BORDER_COLOR[template.grade] || '#8e9aa6';
  let classEmoji = '⚔️';
  if (template.heroClass === 'JANA') classEmoji = '🪄';
  else if (template.heroClass === 'GIGANTE') classEmoji = '🛡️';
  else if (template.heroClass === 'ACCABADORA') classEmoji = '💀';

  const card = document.createElement('div');
  card.className = 'merchant-offer-card';
  card.id = `recruit-offer-${idx}`;
  card.innerHTML = `
    <div class="merchant-offer-header">
      <div style="font-size: 1.4rem; background: rgba(255,255,255,0.03); border: 1px solid ${gradeColor}; border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">${classEmoji}</div>
      <div class="merchant-offer-details">
        <span class="merchant-offer-name" style="color: ${gradeColor};">${template.name}</span>
        <span class="merchant-offer-sub">${template.heroClass} · ${template.element} · ${template.grade}</span>
      </div>
    </div>
    <div class="merchant-offer-buttons">
      <button class="btn-merchant-buy" id="btn-recruit-offer-${idx}">
        ${source === 'ELITE' ? (lang === 'it' ? '🎁 GRATIS' : '🎁 FREE') : `🪙 ${costCoins}`}
      </button>
    </div>
  `;
  container.appendChild(card);

  document.getElementById(`btn-recruit-offer-${idx}`)!.addEventListener('click', () => {
    if (source === 'ACCAMPAMENTO' && gameState.coins < costCoins) {
      alert(lang === 'it' ? '❌ Monete insufficienti!' : '❌ Insufficient coins!');
      return;
    }
    if (getRunHeroCount() >= 5) {
      alert(lang === 'it' ? '❌ Squadra al completo (max 5 guerrieri)!' : '❌ Team full (max 5 warriors)!');
      return;
    }
    if (source === 'ACCAMPAMENTO') gameState.coins -= costCoins;

    const hero = instantiateHero(template);
    if (gameState.team.length < 5) {
      gameState.team.push(hero);
    } else {
      gameState.inventory.push(hero);
    }

    const btn = document.getElementById(`btn-recruit-offer-${idx}`) as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerText = lang === 'it' ? 'RECLUTATO ✓' : 'RECRUITED ✓';
    }

    initTeamSlots();
    updateUI();
    GameStorage.save();
    AudioSynth.playLevelUp();
  });
}
