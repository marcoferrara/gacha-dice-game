import { BoardManager } from './BoardManager';
import { CombatEngine } from './CombatEngine';
import { Hero, Cell, GameState, HeroClass, HeroGrade, ElementType, Equipment, CellType, EnemyType } from './types';

// ─── TEMPLATE E COSTANTI ───

interface HeroTemplate {
  name: string;
  heroClass: HeroClass;
  grade: HeroGrade;
  maxHp: number;
  attack: number;
  defense: number;
  skillCooldown: number;
  icon: string;
  skillName: string;
  desc: string;
  element: ElementType;
  image?: string;
}

const HERO_TEMPLATES: Record<string, HeroTemplate> = {
  // C Grade (Comuni - 70% rate)
  SHARDANA_C: { name: 'Josto', heroClass: 'SHARDANA', grade: 'C', maxHp: 100, attack: 20, defense: 5, skillCooldown: 3.8, icon: '🏹', skillName: 'Fendente del Cacciatore', desc: 'Guerriero Shardana abile con l\'arco, colpisce rapidamente a distanza.', element: 'VENTO', image: 'josto.png' },
  ACCABADORA_C: { name: 'Caddozzo', heroClass: 'ACCABADORA', grade: 'C', maxHp: 90, attack: 18, defense: 4, skillCooldown: 3.2, icon: '🔪', skillName: 'Taglio Rapido', desc: 'Apprendista del rito del trapasso, sferra colpi fulminei alle spalle.', element: 'ACQUA', image: 'caddozzo.png' },
  GIGANTE_C: { name: 'Bruncu', heroClass: 'GIGANTE', grade: 'C', maxHp: 200, attack: 16, defense: 8, skillCooldown: 5.5, icon: '🧱', skillName: 'Muro di Rupi', desc: 'Guardia dei vecchi nuraghi, erige barriere di pietra protettiva.', element: 'PIETRA', image: 'bruncu.png' },
  JANA_C: { name: 'Mamuthoneddu', heroClass: 'JANA', grade: 'C', maxHp: 95, attack: 21, defense: 3, skillCooldown: 4.2, icon: '🎭', skillName: 'Squillo di Campanacci', desc: 'Spirito mascherato minore, disorienta i nemici col rumore dei campanacci.', element: 'VENTO', image: 'mamuthoneddu.png' },

  // R Grade (Rari - 20% rate)
  GIGANTE_R: { name: 'Orthobene', heroClass: 'GIGANTE', grade: 'R', maxHp: 250, attack: 22, defense: 12, skillCooldown: 5.0, icon: '🗿', skillName: 'Scudo Concentrico', desc: 'Colosso basaltico semovente, focalizza l\'aggro e aumenta la difesa del team.', element: 'PIETRA', image: 'orthobene.png' },
  SHARDANA_R: { name: 'Torico', heroClass: 'SHARDANA', grade: 'R', maxHp: 160, attack: 25, defense: 9, skillCooldown: 3.6, icon: '🛡️', skillName: 'Carica del Toro', desc: 'Guerriero d\'élite con corna di bronzo, travolge le prime linee nemiche.', element: 'OSSIDIANA', image: 'torico.png' },
  JANA_R: { name: 'Vento di Janas', heroClass: 'JANA', grade: 'R', maxHp: 110, attack: 26, defense: 5, skillCooldown: 4.1, icon: '🌬️', skillName: 'Brezza di Sedini', desc: 'Fata delle grotte che manipola le correnti curative e rinfrescanti.', element: 'VENTO', image: 'vento_di_janas.png' },

  // S Grade (Speciali - 8% rate)
  JANA_S: { name: 'Jana Medusa', heroClass: 'JANA', grade: 'S', maxHp: 120, attack: 28, defense: 4, skillCooldown: 4.0, icon: '✨', skillName: 'Soffio di Domus', desc: 'Fata tessitrice di filigrana magica, lancia potenti incantesimi di cura del team.', element: 'ACQUA', image: 'jana_medusa.png' },
  ACCABADORA_S: { name: 'Eleonora', heroClass: 'ACCABADORA', grade: 'S', maxHp: 130, attack: 34, defense: 5, skillCooldown: 3.0, icon: '💀', skillName: 'Colpo di Grazia', desc: 'Sacerdotessa dell\'ossidiana, giustizia i nemici feriti infliggendo danni fatali.', element: 'OSSIDIANA', image: 'eleonora.png' },
  SHARDANA_S: { name: 'Mariano', heroClass: 'SHARDANA', grade: 'S', maxHp: 140, attack: 30, defense: 7, skillCooldown: 3.5, icon: '📜', skillName: 'Carta de Logu', desc: 'Giudice legislatore sardo, ordina attacchi coordinati aumentando l\'efficacia.', element: 'PIETRA', image: 'mariano.png' },

  // SR Grade (Super Rari - 2% rate)
  SHARDANA_SR: { name: 'Amsicora', heroClass: 'SHARDANA', grade: 'SR', maxHp: 180, attack: 38, defense: 8, skillCooldown: 3.5, icon: '⚔️', skillName: 'Furia del Bronzo', desc: 'Leggendario condottiero sardo, scatena colpi fulminei ad altissimo danno critico.', element: 'OSSIDIANA', image: 'amsicora.png' },
  GIGANTE_SR: { name: 'Gigante Prama', heroClass: 'GIGANTE', grade: 'SR', maxHp: 320, attack: 28, defense: 15, skillCooldown: 4.8, icon: '🏛️', skillName: 'Pugno Ancestrale', desc: 'Colosso basaltico millenario dagli occhi a cerchio, incassa ingenti danni.', element: 'PIETRA', image: 'gigante_prama.png' },
  ACCABADORA_SR: { name: 'Liba', heroClass: 'ACCABADORA', grade: 'SR', maxHp: 150, attack: 40, defense: 6, skillCooldown: 2.8, icon: '🪵', skillName: 'Mazzuolo del Destino', desc: 'L\'Accabadora Suprema, esegue istantaneamente i nemici sotto il 30% di salute.', element: 'VENTO', image: 'liba.png' }
};

interface Translation {
  it: string;
  en: string;
}

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

const LOCALIZATION_DICTIONARY: Record<string, Translation> = {
  'lbl-header-level': { en: "LV.", it: "LIV." },
  'btn-settings': { en: "Reset Save", it: "Reset Salvataggio" },
  'btn-toggle-audio': { en: "Mute", it: "Attiva Audio" },
  'btn-toggle-frame': { en: "Fullscreen", it: "Schermo Intero" },
  'btn-toggle-lang': { en: "🇬🇧", it: "🇮🇹" },
  
  // Board Screen
  'nav-lbl-board': { en: "Board", it: "Tavola" },
  'dice-img': { en: "Roll Dice", it: "Lancia Dado" },
  
  // Combat Screen
  'screen-combat-title': { en: "REAL-TIME COMBAT", it: "SCONTRO IN TEMPO REALE" },
  
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
  'nav-lbl-gacha': { en: "Summon", it: "Tempio" },
  'gacha-banner-title': { en: "Summoning Temple", it: "Tempio delle Evocazioni" },
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

interface HeroLore {
  title: Translation;
  history: Translation;
}

const HERO_LORE_DATABASE: Record<string, HeroLore> = {
  'Josto': {
    title: {
      en: "Son of Amsicora & Shardana Patriot",
      it: "Figlio di Amsicora & Patriota Shardana"
    },
    history: {
      en: "Josto was the brave son of the legendary leader Amsicora. During the Sardinian-Carthaginian rebellion against Roman rule in 215 BC, he commanded the rebel forces during his father's absence. Despite his tragic end in the Battle of Decimomannu, his youthful courage and sacrifice remain a powerful symbol of Sardinian resistance and fight for freedom.",
      it: "Josto era il valoroso figlio del leggendario condottiero Amsicora. Durante la ribellione sardo-cartaginese contro il dominio romano nel 215 a.C., comandò le forze ribelli in assenza del padre. Nonostante la sua tragica fine nella battaglia di Decimomannu, il suo coraggio giovanile e il suo sacrificio rimangono un potente simbolo della resistenza sarda per la libertà."
    }
  },
  'Caddozzo': {
    title: {
      en: "Novice of the Trappas & Obsidian Shadow",
      it: "Novizio del Trapasso & Ombra d'Ossidiana"
    },
    history: {
      en: "An apprentice under the grim Accabadora, Caddozzo is a shadow lurking in the dark alleys of ancient villages. Equipped with daggers of black Mount Arci obsidian, he performs silent tasks, learning the delicate boundary between life and death under the ancient traditions of Sardinia.",
      it: "Apprendista sotto la guida della severa Accabadora, Caddozzo è un'ombra che si aggira nei vicoli bui degli antichi villaggi. Equipaggiato con pugnali di ossidiana nera del Monte Arci, esegue compiti silenziosi, apprendendo il delicato confine tra la vita e la morte secondo le antiche tradizioni sarde."
    }
  },
  'Bruncu': {
    title: {
      en: "Basalt Sentry of the Giants",
      it: "Sentinella Basaltica dei Giganti"
    },
    history: {
      en: "A robust guardian of stone, Bruncu is a giant born from the basalt of ancient nuraghi. Standing like an unyielding rock, he is the first shield of the team, using protective stones to shield his allies from enemy onslaughts, embodying the prehistoric stability of Sardinian architecture.",
      it: "Un robusto guardiano di pietra, Bruncu è un gigante nato dal basalto degli antichi nuraghi. Ritto come una roccia incrollabile, è il primo scudo del gruppo, utilizzando pietre protettive per proteggere i compagni dagli assalti nemici, incarnando la stabilità preistorica dell'architettura sarda."
    }
  },
  'Mamuthoneddu': {
    title: {
      en: "Minor Spirit of the Mask",
      it: "Spirito Minore della Maschera"
    },
    history: {
      en: "A mischievous spirit dressed in black sheepskins and dark wooden masks, Mamuthoneddu is a playful yet eerie representation of the ancient Mamuthones. With his heavy bronze bells (campanacci), he creates rhythmic confusion, chasing away winter spirits and disorienting battle foes.",
      it: "Uno spirito burlone vestito di pelli di pecora nera e maschere di legno scuro, Mamuthoneddu è una rappresentazione giocosa ma inquietante degli antichi Mamuthones. Con i suoi pesanti campanacci di bronzo, crea una ritmica confusione, scacciando gli spiriti dell'inverno e disorientando i nemici in battaglia."
    }
  },
  'Orthobene': {
    title: {
      en: "Colossus of the Silent Peak",
      it: "Colosso della Vetta Silente"
    },
    history: {
      en: "Orthobene is a colossal basalt golem named after the holy peak of Nuoro. Formed by primeval geological activity, he focuses the aggro of opponents, fortifying his body and drawing strength from the deep roots of Sardinian soil. He stands as a monumental guardian against foreign invaders.",
      it: "Orthobene è un colossale golem basaltico che prende il nome dalla vetta sacra di Nuoro. Formatosi attraverso un'attività geologica primordiale, concentra su di sé l'ira degli avversari, fortificando il proprio corpo e traendo forza dalle profonde radici del suolo sardo. Si erge a difesa contro ogni invasore esterno."
    }
  },
  'Torico': {
    title: {
      en: "Bronze Bull Captain",
      it: "Capitano del Toro di Bronzo"
    },
    history: {
      en: "Torico wears a horn-crested bronze helmet resembling the sacred bull statuettes found in nuragic sanctuaries. Representing strength, masculinity, and divine protection, he leads Shardana charges, crushing enemy defense barriers with relentless determination.",
      it: "Torico indossa un elmo di bronzo crestato di corna che richiama le statuette taurine sacre rinvenute nei santuari nuragici. Rappresentando la forza, la virilità e la protezione divina, guida le cariche degli Shardana, travolgendo le barriere difensive nemiche con implacabile determinazione."
    }
  },
  'Vento di Janas': {
    title: {
      en: "Fairy of the Sedini Winds",
      it: "Fata dei Venti di Sedini"
    },
    history: {
      en: "A mystical Jana who resides inside the cave-dwellings (Domus de Janas) of Sedini. She commands the swift, refreshing breeze to heal wounded warriors, weave protective shields of stardust, and blow away toxins and curses cast by enemy shamans.",
      it: "Una mistica Jana che risiede nelle case delle fate (Domus de Janas) di Sedini. Comanda la brezza fresca e veloce per curare i guerrieri feriti, tessere scudi protettivi di polvere stellare e spazzare via le tossine e le maledizioni scagliate dagli sciamani nemici."
    }
  },
  'Jana Medusa': {
    title: {
      en: "Gold Filigree Weaver",
      it: "Tessitrice di Filigrana d'Oro"
    },
    history: {
      en: "Jana Medusa is a royal fairy of Sardinian folklore, famous for weaving precious threads of golden filigree on her ancient loom. Her spells can bind the wounds of the entire squad, restoring vitality and shielding them with ancient Nuragic protective runes.",
      it: "Jana Medusa è una fata regale del folklore sardo, famosa per tessere preziosi fili di filigrana d'oro sul suo antico telaio. I suoi incantesimi curativi fasciano le ferite dell'intera squadra, ripristinando la vitalità e proteggendoli con antiche rune nuragiche di difesa."
    }
  },
  'Eleonora': {
    title: {
      en: "Judge of Arborea & Obsidian Priestess",
      it: "Giudicessa d'Arborea & Sacerdotessa dell'Ossidiana"
    },
    history: {
      en: "Named after Eleonora of Arborea, the legendary ruler who promulgated the famous 'Carta de Logu' code of laws in the 14th century. In our mythos, she acts as an Obsidian Priestess, wielding the power of judicial fate to execute injured adversaries with a swift strike.",
      it: "Prende il nome da Eleonora d'Arborea, la leggendaria regnante che promuò il celebre codice di leggi 'Carta de Logu' nel XIV secolo. Nel nostro mito, agisce come una Sacerdotessa dell'Ossidiana, brandendo il potere del destino giudiziario per giustiziare con un colpo rapido gli avversari feriti."
    }
  },
  'Mariano': {
    title: {
      en: "Sardinian Sovereign & Tactician",
      it: "Sovrano Sardo & Tattico"
    },
    history: {
      en: "A prominent judge-king of Sardinian history, Mariano is a master tactician. By organizing coordinated military ranks, he enhances the attack power and critical hit rate of all allies on the board, demonstrating the strategic genius of ancient Sardinian self-governance.",
      it: "Un importante re-giudice della storia sarda, Mariano è un maestro di tattica. Organizzando ranghi militari coordinati, potenzia il potere d'attacco e il tasso critico di tutti gli alleati sul campo, dimostrando il genio strategico dell'antico autogoverno sardo."
    }
  },
  'Amsicora': {
    title: {
      en: "The Legendary Leader of Rebellion",
      it: "Il Leggendario Leader della Ribellione"
    },
    history: {
      en: "Amsicora was a noble Sardinian-Carthaginian landowner and military leader who spearheaded the great rebellion against the Roman Republic in 215 BC. Armed with a heavy bronze sword, he represents the unyielding spirit of Sardinian independence, executing critical blows that shatter enemy formations.",
      it: "Amsicora fu un nobile proprietario terriero sardo-cartaginese e leader militare che guidò la grande ribellione contro la Repubblica Romana nel 215 a.C. Armato di una pesante spada di bronzo, rappresenta lo spirito indomito dell'indipendenza sarda, infliggendo colpi critici che frantumano le difese nemiche."
    }
  },
  'Gigante Prama': {
    title: {
      en: "Ancient Basalt Warrior of Mont'e Prama",
      it: "Antico Guerriero Basaltico di Mont'e Prama"
    },
    history: {
      en: "Inspired by the famous stone giants discovered at Mont'e Prama (dating back to the 10th-8th century BC), this monumental basalt warrior possesses iconic concentric circles for eyes and carries a massive shield. He is virtually indestructible, absorbing heavy hits for the entire party.",
      it: "Ispirato ai celebri giganti di pietra scoperti a Mont'e Prama (risalenti al X-VIII secolo a.C.), questo monumentale guerriero di basalto possiede gli iconici occhi a cerchi concentrici e porta un massiccio scudo. È praticamente indistruttibile, assorbendo colpi devastanti al posto della squadra."
    }
  },
  'Liba': {
    title: {
      en: "The Supreme Accabadora",
      it: "L'Accabadora Suprema"
    },
    history: {
      en: "The ultimate 'Accabadora' (from the Sardinian 'acabà', meaning to finish), Liba is a mythic priestess dressed in black. Armed with a ritual olive-wood mallet, she brings a merciful release to the suffering. In battle, she immediately executes any enemy falling below 30% of their maximum health.",
      it: "La suprema 'Accabadora' (dal sardo 'acabà', finire), Liba è una mitica sacerdotessa vestita di nero. Armata di un mazzuolo rituale di legno d'olivo, porta una misericordiosa fine alle sofferenze. In battaglia, esegue istantaneamente qualsiasi nemico scenda sotto il 30% dei suoi HP massimi."
    }
  }
};

const LOCALIZED_HERO_TEMPLATES: Record<string, { skillName: Translation; desc: Translation }> = {
  'Josto': {
    skillName: { en: "Hunter's Slash", it: "Fendente del Cacciatore" },
    desc: { en: "Skilled Shardana archer, strikes quickly from a distance.", it: "Guerriero Shardana abile con l'arco, colpisce rapidamente a distanza." }
  },
  'Caddozzo': {
    skillName: { en: "Quick Cut", it: "Taglio Rapido" },
    desc: { en: "Apprentice of the ritual of death, strikes lightning-fast blows from behind.", it: "Apprendista del rito del trapasso, sferra colpi fulminei alle spalle." }
  },
  'Bruncu': {
    skillName: { en: "Crag Wall", it: "Muro di Rupi" },
    desc: { en: "Sentry of the old nuraghi, erects protective stone barriers.", it: "Guardia dei vecchi nuraghi, erige barriere di pietra protettiva." }
  },
  'Mamuthoneddu': {
    skillName: { en: "Clanging Bells", it: "Squillo di Campanacci" },
    desc: { en: "Minor masked spirit, disorients enemies with the sound of bells.", it: "Spirito mascherato minore, disorienta i nemici col rumore dei campanacci." }
  },
  'Orthobene': {
    skillName: { en: "Concentric Shield", it: "Scudo Concentrico" },
    desc: { en: "Moving basalt colossus, draws aggro and increases team defense.", it: "Colosso basaltico semovente, focalizza l'aggro e aumenta la difesa del team." }
  },
  'Torico': {
    skillName: { en: "Bull Charge", it: "Carica del Toro" },
    desc: { en: "Elite warrior with bronze horns, crashes through enemy frontlines.", it: "Guerriero d'élite con corna di bronzo, travolge le prime linee nemiche." }
  },
  'Vento di Janas': {
    skillName: { en: "Breeze of Sedini", it: "Brezza di Sedini" },
    desc: { en: "Cave fairy who manipulates healing and cooling wind currents.", it: "Fata delle grotte che manipola le correnti curative e rinfrescanti." }
  },
  'Jana Medusa': {
    skillName: { en: "Sigh of the Domus", it: "Soffio di Domus" },
    desc: { en: "Fairy weaver of magic filigree, casts powerful team healing spells.", it: "Fata tessitrice di filigrana magica, lancia potenti incantesimi di cura del team." }
  },
  'Eleonora': {
    skillName: { en: "Grace Strike", it: "Colpo di Grazia" },
    desc: { en: "Priestess of obsidian, executes wounded enemies with fatal damage.", it: "Sacerdotessa dell'ossidiana, giustizia i nemici feriti infliggendo danni fatali." }
  },
  'Mariano': {
    skillName: { en: "Carta de Logu", it: "Carta de Logu" },
    desc: { en: "Sardinian judge-legislator, orders coordinated strikes boosting team power.", it: "Giudice legislatore sardo, ordina attacchi coordinati aumentando l'efficacia." }
  },
  'Amsicora': {
    skillName: { en: "Bronze Fury", it: "Furia del Bronzo" },
    desc: { en: "Legendary Sardinian leader, unleashes high crit damage lightning strikes.", it: "Leggendario condottiero sardo, scatena colpi fulminei ad altissimo danno critico." }
  },
  'Gigante Prama': {
    skillName: { en: "Ancestral Fist", it: "Pugno Ancestrale" },
    desc: { en: "Millennial basalt giant with circular eyes, absorbs massive damage.", it: "Colosso basaltico millenario dagli occhi a cerchio, incassa ingenti danni." }
  },
  'Liba': {
    skillName: { en: "Mallet of Destiny", it: "Mazzuolo del Destino" },
    desc: { en: "The Supreme Accabadora, immediately executes enemies below 30% HP.", it: "L'Accabadora Suprema, esegue istantaneamente i nemici sotto il 30% di salute." }
  }
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
  const id = 'h_' + Math.random().toString(36).substr(2, 9);
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
  if (hero.image) {
    const idleClass = isIdle ? ' avatar-idle' : '';
    let imgSize = 'max-height: 52px;';
    let containerSize = 'height: 52px;';
    let marginTop = 'margin-top: 6px;';
    
    if (mode === 'compact') {
      imgSize = 'max-height: 28px;';
      containerSize = 'height: 30px;';
      marginTop = 'margin-top: 0;';
    } else if (mode === 'large') {
      imgSize = 'max-height: 72px;';
      containerSize = 'height: 76px;';
      marginTop = 'margin-top: 0;';
    }

    return `
      <div style="${containerSize} display: flex; align-items: center; justify-content: center; ${marginTop} margin-bottom: 2px; position: relative; width: 100%;">
        <img class="avatar-image${idleClass}" src="assets/art/heroes/${hero.image}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="${imgSize}">
        <div style="font-size: ${mode === 'compact' ? '1rem' : (mode === 'large' ? '2.4rem' : '1.4rem')}; display: none;">${hero.icon || '👤'}</div>
      </div>
    `;
  }
  
  const fontSize = mode === 'compact' ? '1.1rem' : (mode === 'large' ? '2.4rem' : '1.4rem');
  const marginTop = mode === 'compact' ? '0' : (mode === 'large' ? '0' : '6px');
  return `<div style="font-size: ${fontSize}; margin-top: ${marginTop}; margin-bottom: 2px;">${hero.icon || '👤'}</div>`;
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

// ─── AUDIO SYNTHESIZER (WEB AUDIO API) ───

class AudioSynth {
  private static audioCtx: AudioContext | null = null;
  private static isMuted = true;
  private static bgmInterval: number | null = null;
  private static bgmStep = 0;
  private static currentBgmMode: 'relaxing' | 'intense' = 'relaxing';

  private static init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass();
    }
  }

  public static toggleMute(): boolean {
    this.init();
    
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    
    return this.isMuted;
  }

  public static setMuted(muted: boolean) {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended' && !muted) {
      this.audioCtx.resume();
    }
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
  }

  public static getMuteState(): boolean {
    return this.isMuted;
  }

  public static setBgmMode(mode: 'relaxing' | 'intense') {
    if (this.currentBgmMode === mode) return;
    this.currentBgmMode = mode;
    if (!this.isMuted) {
      this.stopBgm();
      this.startBgm();
    }
  }

  private static startBgm() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;

    if (this.bgmInterval) clearInterval(this.bgmInterval);
    
    const tempo = this.currentBgmMode === 'relaxing' ? 320 : 200;
    const notesRelaxing = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
    const notesIntense = [110, 130.81, 146.83, 164.81, 196.00, 220, 261.63, 293.66];

    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (!this.audioCtx || this.isMuted) return;
      
      const step = this.bgmStep;
      this.bgmStep = (this.bgmStep + 1) % 16;
      
      if (step === 0 || step === 8) {
        const bassFreq = this.currentBgmMode === 'relaxing' ? 110 : 55;
        this.playTone(bassFreq, 'triangle', 0.8, 0.12);
      }

      if (this.currentBgmMode === 'intense') {
        if (step % 2 === 0) {
          if (step % 4 === 0) {
            this.playDrumKick();
          } else {
            this.playDrumSnare();
          }
        }
      } else {
        if (step === 4 || step === 12) {
          this.playTone(165, 'sine', 0.3, 0.04);
        }
      }

      if (this.currentBgmMode === 'relaxing') {
        if (step % 4 === 0 || (step % 4 === 2 && Math.random() < 0.6)) {
          const randNote = notesRelaxing[Math.floor(Math.random() * notesRelaxing.length)];
          this.playTone(randNote, 'sine', 0.6, 0.06);
        }
      } else {
        if (step % 2 === 0) {
          const patternIndex = [0, 2, 3, 4, 3, 2, 5, 4, 3, 2, 0, 1, 0, 2, 4, 5][step];
          const noteFreq = notesIntense[patternIndex % notesIntense.length];
          this.playTone(noteFreq, 'sawtooth', 0.6, 0.08, true);
        }
      }
    }, tempo);
  }

  private static stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private static playTone(freq: number, type: OscillatorType, duration: number, volume: number, useLowpass = false) {
    if (!this.audioCtx || this.isMuted) return;
    
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      if (useLowpass) {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + duration);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  private static playDrumKick() {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  private static playDrumSnare() {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.1;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
      
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
      noise.stop(this.audioCtx.currentTime + 0.1);
    } catch(e) {}
  }

  public static playDiceRoll() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;

    const now = this.audioCtx.currentTime;
    for (let i = 0; i < 6; i++) {
      const timeOffset = i * 0.12;
      this.playTickAtTime(now + timeOffset);
    }
  }

  private static playTickAtTime(time: number) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.frequency.setValueAtTime(800 + Math.random() * 400, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.04);
      
      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.04);
    } catch(e) {}
  }

  public static playCritHit() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
      
      this.playTone(1200, 'sine', 0.08, 0.06);
    } catch(e) {}
  }

  public static playGachaReveal(grade: HeroGrade) {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    
    if (grade === 'C') {
      this.playToneAtTime(261.63, 0, 0.3, 'sine', 0.15); 
      this.playToneAtTime(329.63, 0.1, 0.3, 'sine', 0.15); 
      this.playToneAtTime(392, 0.2, 0.4, 'sine', 0.15); 
    } else if (grade === 'R') {
      this.playToneAtTime(220, 0, 0.3, 'sine', 0.2); 
      this.playToneAtTime(277.18, 0.1, 0.3, 'sine', 0.2); 
      this.playToneAtTime(329.63, 0.2, 0.5, 'sine', 0.2); 
    } else if (grade === 'S') {
      const notes = [293.66, 349.23, 440, 523.25, 587.33]; 
      notes.forEach((freq, idx) => {
        this.playToneAtTime(freq, idx * 0.08, 0.4, 'triangle', 0.12);
      });
    } else {
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5]; 
      notes.forEach((freq, idx) => {
        this.playToneAtTime(freq, idx * 0.06, 0.6, 'sine', 0.1);
      });
      this.playToneAtTime(130.81, 0, 0.8, 'triangle', 0.25);
    }
  }

  private static playToneAtTime(freq: number, delay: number, duration: number, type: OscillatorType, volume: number) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const time = this.audioCtx.currentTime + delay;
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + duration);
    } catch(e) {}
  }

  public static playLevelUp() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    this.playToneAtTime(523.25, 0, 0.25, 'sine', 0.2);
    this.playToneAtTime(659.25, 0.08, 0.25, 'sine', 0.2);
    this.playToneAtTime(783.99, 0.16, 0.4, 'sine', 0.2);
  }

  public static playAscension() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    try {
      const notes = [130.81, 261.63, 392, 523.25];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const filter = this.audioCtx!.createBiquadFilter();
        const gain = this.audioCtx!.createGain();
        const time = now + idx * 0.12;
        const duration = 0.8 - idx * 0.1;
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + duration);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx!.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      });
    } catch(e) {}
  }
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
  level: number;
  playerPosition: number;
  coins: number;
  gems: number;
  team: Hero[];
  inventory: Hero[];
  equipmentInventory: Equipment[];
  language: 'en' | 'it';
  unlockedCollection: string[];
}

const gameState: GameWebState = {
  level: 1,
  playerPosition: 0,
  coins: 1500, // Dotazione iniziale ricca per consentire il test immediato di level up
  gems: 80,    // Dotazione iniziale per consentire 8 pull o quasi una multi 10x immediata
  team: [
    instantiateHero(HERO_TEMPLATES.SHARDANA_SR),
    instantiateHero(HERO_TEMPLATES.JANA_S),
    instantiateHero(HERO_TEMPLATES.GIGANTE_R),
    instantiateHero(HERO_TEMPLATES.ACCABADORA_S),
    instantiateHero(HERO_TEMPLATES.SHARDANA_C)
  ],
  inventory: [
    instantiateHero(HERO_TEMPLATES.ACCABADORA_C),
    instantiateHero(HERO_TEMPLATES.GIGANTE_C)
  ],
  equipmentInventory: [
    { id: 'eq1', name: 'Spada di Bronzo Shardana', type: 'WEAPON', statBonus: { atk: 15 }, icon: '⚔️' },
    { id: 'eq2', name: 'Pendente Nuragico Sacro', type: 'AMULET', statBonus: { hp: 80 }, icon: '📿' },
    { id: 'eq3', name: 'Scudo di Basalto', type: 'AMULET', statBonus: { def: 5 }, icon: '🛡️' }
  ],
  language: 'en',
  unlockedCollection: []
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
        gameState.level = parsed.level || 1;
        gameState.playerPosition = parsed.playerPosition || 0;
        gameState.coins = parsed.coins !== undefined ? parsed.coins : 100;
        gameState.gems = parsed.gems !== undefined ? parsed.gems : 10;
        gameState.language = parsed.language || 'en';
        gameState.unlockedCollection = parsed.unlockedCollection || [];
        
        if (parsed.team) gameState.team = parsed.team;
        if (parsed.inventory) gameState.inventory = parsed.inventory;
        if (parsed.equipmentInventory) gameState.equipmentInventory = parsed.equipmentInventory;

        // Auto-unlock migration: sblocca nel Codex tutti gli eroi attualmente posseduti
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
    // Per un nuovo gioco, sblocca comunque gli eroi iniziali di default
    const initialHeroNames = [
      ...gameState.team.map(h => h.name),
      ...gameState.inventory.map(h => h.name)
    ];
    initialHeroNames.forEach(name => {
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

  // Chiusura Modale Lore Codex
  document.getElementById('btn-close-codex-lore')!.addEventListener('click', () => {
    document.getElementById('popup-codex-lore')!.classList.remove('active');
  });
  document.getElementById('btn-close-lore-confirm')!.addEventListener('click', () => {
    document.getElementById('popup-codex-lore')!.classList.remove('active');
  });

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
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      const targetScreen = btn.getAttribute('data-screen')!;
      document.getElementById(targetScreen)!.classList.add('active');
      
      // Se torniamo alla tavola, ri-centra la telecamera sul giocatore
      if (targetScreen === 'screen-board') {
        setTimeout(scrollToPlayer, 100);
      }
      
      // Se andiamo al codex, rigenera la griglia
      if (targetScreen === 'screen-codex') {
        renderCodexGrid();
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
    
    // Icona ed ID Casella
    el.innerHTML = `
      <span class="cell-num">${cell.id}</span>
      <span style="font-size: 1.1rem;">${getCellEmoji(cell.type)}</span>
    `;
    
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
  
  // Centra il sensore all'avvio
  setTimeout(scrollToPlayer, 200);
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
}

// Centra la telecamera del board container sulla pedina
function scrollToPlayer() {
  const container = document.getElementById('board-container');
  const token = document.getElementById('player-token');
  if (container && token) {
    const tokenTop = parseFloat(token.style.top);
    container.scrollTo({
      top: tokenTop - container.clientHeight / 2,
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

    case 'COMMON_ENEMY':
    case 'ELITE_ENEMY':
    case 'BOSS':
      startRealTimeCombat(cell.type);
      break;
  }
}

function closePopup() {
  document.getElementById('popup-event')!.classList.remove('active');
  
  // Se abbiamo superato l'ultima casella ed il Boss è morto: Vittoria Livello!
  const finalCell = board[gameState.playerPosition];
  if (gameState.playerPosition === board.length - 1 && finalCell && finalCell.type === 'BOSS' && (finalCell as any).defeated) {
    const oldLevel = gameState.level;
    gameState.level += 1;
    gameState.playerPosition = 0;
    
    // Ricompensa di transizione
    const completionGold = 1000 + (oldLevel * 300);
    const completionGems = 50 + (oldLevel * 10);
    gameState.coins += completionGold;
    gameState.gems += completionGems;
    
    alert(`🏆 TAPPA ${oldLevel} SUPERATA!\nHai sconfitto il Guardiano ed evocato le divinità!\n\nRicevi:\n🪙 +${completionGold} Monete\n💎 +${completionGems} Gemme`);
    
    initBoard();
    updateUI();
    GameStorage.save();
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
  const enemyElemEmoji = getElementEmoji(enemy.element);

  enemyName.innerText = `${enemy.name} ${enemyElemEmoji} (LIV. ${gameState.level})`;
  enemyAvatar.innerHTML = getEnemyAvatarHtml(enemyType);
  
  // HP Nemico UI
  enemyHpBar.style.width = '100%';
  enemyHpText.innerText = `${enemy.currentHp}/${enemy.maxHp}`;
  
  renderCombatTeamGrid();

  let battleTime = 0.0;
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
    battleTime = parseFloat((battleTime + tickRate).toFixed(1));
    timerEl.innerText = `${battleTime}s`;

    // 1. Carica le abilità speciali degli eroi (evocazione/casting)
    gameState.team.forEach(hero => {
      if (hero.currentHp <= 0) return;
      
      const skillBar = document.getElementById(`skill-bar-${hero.name.replace(/\s+/g, '')}`);
      if (skillBar) {
        hero.skillTimer = parseFloat((hero.skillTimer + tickRate).toFixed(1));
        const percentage = Math.min(100, (hero.skillTimer / hero.skillCooldown) * 100);
        skillBar.style.width = `${percentage}%`;
        
        if (percentage >= 100) {
          skillBar.classList.add('ready');
          
          // Esegui abilità speciale con CombatEngine!
          const combatLog: string[] = [];
          CombatEngine.castHeroSkill(hero, gameState.team, enemy, battleTime, combatLog);
          
          combatLog.forEach(l => {
            const isHeal = l.includes('SOFFIO DI DOMUS') || l.includes('lancia Soffio di Domus');
            const isCrit = l.includes('Colpo di spada mitico') || l.includes('Esecuzione letale');
            const elemAdv = l.includes('Vantaggio Elementale');
            const elemDis = l.includes('Svantaggio Elementale');

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
                  
                  // Animazione guarigione: flash o leggero sobbalzo
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
          
          hero.skillTimer = 0;
          skillBar.classList.remove('ready');
          renderCombatTeamGrid();
        }
      }
    });

    // 2. Carica abilità nemica
    enemy.skills.timer = parseFloat((enemy.skills.timer + tickRate).toFixed(1));
    if (enemy.skills.timer >= enemy.skills.cooldown) {
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
          const dmgVal = Math.max(5, Math.round(enemy.skills.damage - target.defense));
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
      
      enemy.skills.timer = 0;
      renderCombatTeamGrid();
    }

    // 3. Attacchi base dei nostri Eroi vivi (ogni 1.0s)
    if (parseFloat((battleTime % 1.0).toFixed(1)) === 0) {
      const aliveHeroes = gameState.team.filter(h => h.currentHp > 0);
      if (aliveHeroes.length > 0) {
        const attacker = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        
        const attackerElement = attacker.element || 'VENTO';
        const targetElement = enemy.element || 'VENTO';
        const elemMult = CombatEngine.getElementalMultiplier(attackerElement, targetElement);

        const baseDmg = Math.max(1, attacker.attack - enemy.defense);
        const dmg = Math.round(baseDmg * elemMult);
        
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

        spawnFloatingDamage(dmg.toString(), false, document.querySelector('.enemy-visual'), elemMult > 1.0);
        
        let logMsg = `[${battleTime}s] 🗡️ ${attacker.name} colpisce ${enemy.name} per ${dmg} danni.`;
        if (elemMult > 1.0) logMsg += ' (🔥 Element Advantage!)';
        if (elemMult < 1.0) logMsg += ' (❄️ Element Disadvantage)';
        addCombatLog(logMsg);
        
        // Aggiorna HP nemico
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

          const baseDmg = Math.max(1, enemy.attack - target.defense);
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
      });

      setTimeout(() => endCombat(false, cellType), 1500);
    }
  }, 100);
}

function renderCombatTeamGrid() {
  const grid = document.getElementById('combat-team-grid')!;
  grid.innerHTML = '';

  gameState.team.forEach(hero => {
    const row = document.createElement('div');
    row.className = `combat-hero-row ${hero.currentHp <= 0 ? 'dead' : ''}`;
    row.id = `row-${hero.name.replace(/\s+/g, '')}`;

    const hpPercentage = (hero.currentHp / hero.maxHp) * 100;
    const elemEmoji = getElementEmoji(hero.element);

    row.innerHTML = `
      <div class="ch-avatar-wrap" style="border-color: var(--${hero.grade.toLowerCase()}); display: flex; align-items: center; justify-content: center; position: relative; overflow: visible;">${getHeroAvatarHtml(hero, hero.currentHp > 0, 'compact')}</div>
      <div class="ch-info">
        <div style="display: flex; justify-content: space-between;">
          <span class="ch-name">${hero.name} ${elemEmoji} (LIV. ${hero.level})</span>
          <span class="ch-name" style="font-size: 0.6rem;">HP ${hero.currentHp}/${hero.maxHp}</span>
        </div>
        <div class="hp-bar-wrapper" style="height: 6px; margin-top: 2px;">
          <div class="hp-bar ch-hp-bar" style="width: ${hpPercentage}%; background-color: ${hero.currentHp <= 0 ? '#555' : ''};"></div>
        </div>
        <div class="ch-skill-bar-wrapper">
          <div class="ch-skill-bar" id="skill-bar-${hero.name.replace(/\s+/g, '')}"></div>
        </div>
      </div>
    `;

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
    } else if (cellType === 'BOSS') {
      baseCoins = 1000;
      baseGems = 50;
    }

    const rewardCoins = Math.round(baseCoins * rewardMult);
    const rewardGems = Math.round(baseGems * rewardMult);

    gameState.coins += rewardCoins;
    gameState.gems += rewardGems;

    title.innerText = 'Vittoria Epica!';
    icon.innerText = '🏆';
    desc.innerText = `Hai sconfitto i Mamuthones selvaggi! Ricevi +${rewardCoins} Monete 🪙 e +${rewardGems} Gemme 💎!`;
    overlay.classList.add('active');
    
    updateUI();
    GameStorage.save();
  } else {
    alert("💀 LA SQUADRA È CADUTA!\nVerrai teletrasportato all'inizio del sentiero per ricaricare le forze.");
    // Resetta HP
    gameState.team.forEach(h => h.currentHp = h.maxHp);
    gameState.playerPosition = 0;
    updatePlayerTokenPosition(0);
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
    el.className = `hero-slot active-card grade-${hero.grade.toLowerCase()}`;
    el.setAttribute('draggable', 'true');
    el.dataset.index = index.toString();
    el.dataset.area = 'active';

    let starsHtml = '';
    for (let s = 0; s < (hero.starRank || 0); s++) {
      starsHtml += '⭐';
    }

    const elemEmoji = getElementEmoji(hero.element);

    el.innerHTML = `
      <button class="inspect-btn-trigger" title="Dettagli" style="position: absolute; top: 1px; right: 1px; background: none; border: none; font-size: 0.58rem; cursor: pointer; color: var(--gold);">🔍</button>
      <span style="position: absolute; top: 1px; left: 1px; font-size: 0.52rem;">${elemEmoji}</span>
      ${getHeroAvatarHtml(hero, true, 'card')}
      <div style="font-size: 0.52rem; font-weight:700; color: #fff;">${hero.name}</div>
      <div style="font-size: 0.45rem; color: var(--gold);">LIV. ${hero.level}</div>
      <div style="font-size: 0.38rem; color: #fff4d4; margin-top: 1px;">${starsHtml}</div>
    `;

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
    el.className = `hero-slot grade-${hero.grade.toLowerCase()}`;
    el.setAttribute('draggable', 'true');
    el.dataset.index = index.toString();
    el.dataset.area = 'inventory';

    let starsHtml = '';
    for (let s = 0; s < (hero.starRank || 0); s++) {
      starsHtml += '⭐';
    }

    const elemEmoji = getElementEmoji(hero.element);

    el.innerHTML = `
      <button class="inspect-btn-trigger" title="Dettagli" style="position: absolute; top: 1px; right: 1px; background: none; border: none; font-size: 0.58rem; cursor: pointer; color: var(--gold);">🔍</button>
      <span style="position: absolute; top: 1px; left: 1px; font-size: 0.52rem;">${elemEmoji}</span>
      ${getHeroAvatarHtml(hero, true, 'card')}
      <div style="font-size: 0.52rem; font-weight:700; color: #fff;">${hero.name}</div>
      <div style="font-size: 0.45rem; color: #8892b0;">LIV. ${hero.level}</div>
      <div style="font-size: 0.38rem; color: #fff4d4; margin-top: 1px;">${starsHtml}</div>
    `;

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
  const localizedInfo = LOCALIZED_HERO_TEMPLATES[hero.name];
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
  });
  
  document.getElementById('btn-choice-risky')!.addEventListener('click', makeRiskyChoice);
  document.getElementById('btn-choice-safe')!.addEventListener('click', makeSafeChoice);
}

function openMerchantShop() {
  renderMerchantItems();
  document.getElementById('popup-merchant')!.classList.add('active');
}

function renderMerchantItems() {
  const container = document.getElementById('merchant-items')!;
  container.innerHTML = '';
  
  // Offerta 1: Evocazione casuale
  const item1 = document.createElement('div');
  item1.className = 'currency-item';
  item1.style.justifyContent = 'space-between';
  item1.style.padding = '0.6rem';
  item1.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #fff; font-size: 0.72rem;">Risveglio Casuale (C-R)</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Sblocca un eroe in inventario</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-hero" style="background: var(--gold); color: #000; font-size: 0.65rem; padding: 0.3rem 0.6rem;">🪙 400</button>
  `;
  
  // Offerta 2: Gemme
  const item2 = document.createElement('div');
  item2.className = 'currency-item';
  item2.style.justifyContent = 'space-between';
  item2.style.padding = '0.6rem';
  item2.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #fff; font-size: 0.72rem;">Ossidiana Vulcanica (+15 💎)</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Acquista minerali per evocare eroi</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-gems" style="background: var(--gold); color: #000; font-size: 0.65rem; padding: 0.3rem 0.6rem;">🪙 350</button>
  `;

  // Offerta 3: Bronzetto Casuale
  const item3 = document.createElement('div');
  item3.className = 'currency-item';
  item3.style.justifyContent = 'space-between';
  item3.style.padding = '0.6rem';
  item3.innerHTML = `
    <div style="text-align: left;">
      <span style="font-weight: 700; color: #fff; font-size: 0.72rem;">Bronzetto Casuale</span>
      <p style="font-size: 0.58rem; color: var(--text-muted); margin-top: 1px;">Ricevi un'arma o un amuleto di bronzo</p>
    </div>
    <button class="btn-popup-close" id="btn-buy-equip" style="background: var(--gold); color: #000; font-size: 0.65rem; padding: 0.3rem 0.6rem;">🪙 600</button>
  `;

  container.appendChild(item1);
  container.appendChild(item2);
  container.appendChild(item3);
  
  document.getElementById('btn-buy-hero')!.addEventListener('click', buyMerchantHero);
  document.getElementById('btn-buy-gems')!.addEventListener('click', buyMerchantGems);
  document.getElementById('btn-buy-equip')!.addEventListener('click', buyMerchantEquip);
}

function buyMerchantHero() {
  const lang = gameState.language || 'en';
  if (gameState.coins < 400) {
    alert(lang === 'en' ? "❌ Insufficient gold coins!" : "❌ Monete d'oro insufficienti!");
    return;
  }
  gameState.coins -= 400;
  
  // Evoca un eroe a caso
  const roll = Math.random() < 0.20 ? 'R' : 'C';
  const template = getRandomHeroTemplateOfGrade(roll);
  const heroObj = instantiateHero(template);
  gameState.inventory.push(heroObj);
  unlockCodexHero(heroObj.name);

  alert(lang === 'en' 
    ? `🛒 PURCHASE COMPLETED!\nYou have awakened: ${heroObj.name} (${heroObj.grade})! Added to inventory.`
    : `🛒 ACQUISTO EFFETTUATO!\nHai risvegliato: ${heroObj.name} (${heroObj.grade})! Aggiunto in Inventario.`);
  
  renderInventorySlots();
  renderMerchantItems();
  updateUI();
  GameStorage.save();
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
    id: 'eq_' + Math.random().toString(36).substr(2, 9)
  };
  gameState.equipmentInventory.push(equip);

  alert(lang === 'en'
    ? `🛒 PURCHASE COMPLETED!\nYou obtained the equipment: ${equip.icon} ${equip.name}! Added to inventory.`
    : `🛒 ACQUISTO EFFETTUATO!\nHai ottenuto l'equipaggiamento: ${equip.icon} ${equip.name}! Aggiunto in inventario.`);
  
  renderMerchantItems();
  updateUI();
  GameStorage.save();
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

// ─── CODICE LA GROTTA DELLE EVOCAZIONI (GACHA STORE) ───

function initGachaStore() {
  document.getElementById('btn-gacha-single')!.addEventListener('click', () => pullGacha(1));
  document.getElementById('btn-gacha-multi')!.addEventListener('click', () => pullGacha(10));
  document.getElementById('btn-gacha-confirm')!.addEventListener('click', closeGachaReveal);
}

async function pullGacha(pullsCount: number) {
  const lang = gameState.language || 'en';
  const cost = pullsCount === 1 ? 10 : 90;
  if (gameState.gems < cost) {
    alert(lang === 'en'
      ? "❌ Insufficient Obsidian! Earn more gems by winning battles or clearing stages."
      : "❌ Ossidiana insufficiente! Ottieni altre gemme vincendo scontri o superando i livelli.");
    return;
  }

  // Deduci gemme
  gameState.gems -= cost;
  updateUI();
  GameStorage.save();

  // Avvia animazione visiva a tutto schermo
  const overlay = document.getElementById('popup-gacha-reveal')!;
  const vortex = document.getElementById('portal-vortex')!;
  const flash = document.getElementById('portal-flash')!;
  const revealContainer = document.getElementById('gacha-reveal-container')!;
  const cardsDisplay = document.getElementById('gacha-cards-display')!;

  overlay.classList.add('active');
  vortex.style.display = 'block';
  vortex.className = 'gacha-portal-vortex active';
  revealContainer.style.display = 'none';
  cardsDisplay.innerHTML = '';

  // Genera i tiri gacha ed individua la rarità massima per il colore del flash!
  const pulledHeroes: Hero[] = [];
  let maxGrade: HeroGrade = 'C';

  for (let p = 0; p < pullsCount; p++) {
    const grade = rollGachaGrade();
    const template = getRandomHeroTemplateOfGrade(grade);
    const heroObj = instantiateHero(template);
    pulledHeroes.push(heroObj);
    
    // Aggiorna rarità massima
    if (grade === 'SR') maxGrade = 'SR';
    else if (grade === 'S' && maxGrade !== 'SR') maxGrade = 'S';
    else if (grade === 'R' && maxGrade !== 'SR' && maxGrade !== 'S') maxGrade = 'R';
  }

  // Durata della concentrazione runica
  await sleep(1500);

  // Colora la spirale runica in base alla rarità massima prima del flash!
  let glowColor = 'rgba(142, 154, 166, 0.4)'; // Comune
  if (maxGrade === 'SR') glowColor = 'rgba(200, 167, 107, 0.9)';
  else if (maxGrade === 'S') glowColor = 'rgba(128, 90, 213, 0.8)';
  else if (maxGrade === 'R') glowColor = 'rgba(49, 130, 206, 0.8)';
  
  vortex.style.borderColor = maxGrade === 'SR' ? 'var(--super-rare)' : (maxGrade === 'S' ? 'var(--special)' : (maxGrade === 'R' ? 'var(--rare)' : 'var(--common)'));

  await sleep(600);

  // Trigger flash bianco accecante
  flash.className = 'gacha-portal-flash flash-trigger';
  
  await sleep(350);

  // Nascondi vortex, mostra le carte
  vortex.style.display = 'none';
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

  // Rende le carte svelate visivamente
  pulledHeroes.forEach(hero => {
    const card = document.createElement('div');
    card.className = `hero-slot grade-${hero.grade.toLowerCase()}`;
    card.style.width = '75px';
    card.style.height = '105px';
    card.style.cursor = 'default';
    card.style.transform = 'scale(0.1)';
    card.style.opacity = '0';
    card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
    
    const elemEmoji = getElementEmoji(hero.element);

    card.innerHTML = `
      <span style="position: absolute; top: 1px; left: 1px; font-size: 0.52rem;">${elemEmoji}</span>
      <div style="font-size: 1.6rem; margin-top: 6px; margin-bottom: 2px;">${hero.icon}</div>
      <div style="font-size: 0.58rem; font-weight:700; color: #fff;">${hero.name}</div>
      <div style="font-size: 0.48rem; color: var(--${hero.grade.toLowerCase()}); font-weight:600; text-transform: uppercase;">${hero.grade}</div>
    `;

    cardsDisplay.appendChild(card);
    
    // Inserisce nell'inventario di gioco
    gameState.inventory.push(hero);
    unlockCodexHero(hero.name);
  });

  // Animazione sequenziale a cascata per rivelare le carte (effetto premium!)
  const renderedCards = cardsDisplay.querySelectorAll('.hero-slot') as NodeListOf<HTMLElement>;
  for (let c = 0; c < renderedCards.length; c++) {
    await sleep(150);
    renderedCards[c].style.transform = 'scale(1)';
    renderedCards[c].style.opacity = '1';
    
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
  const roll = Math.random() * 100;
  if (roll < 2) return 'SR';   // 2%
  if (roll < 10) return 'S';   // 8%
  if (roll < 30) return 'R';   // 20%
  return 'C';                 // 70%
}

function getRandomHeroTemplateOfGrade(grade: HeroGrade): HeroTemplate {
  const eligible = Object.values(HERO_TEMPLATES).filter(h => h.grade === grade);
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function closeGachaReveal() {
  document.getElementById('popup-gacha-reveal')!.classList.remove('active');
}

// ─── UTILS & RENDERING GENERALE ───

function updateUI() {
  document.getElementById('ui-coins')!.innerText = gameState.coins.toString();
  document.getElementById('ui-gems')!.innerText = gameState.gems.toString();
  document.getElementById('ui-current-level')!.innerText = gameState.level.toString();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function translateAllHeroInstanceNamesAndSkills() {
  const lang = gameState.language || 'en';
  
  const translateHero = (h: Hero) => {
    const loc = LOCALIZED_HERO_TEMPLATES[h.name];
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
  const navLblBoard = document.getElementById('nav-lbl-board');
  if (navLblBoard) navLblBoard.innerText = lang === 'en' ? "Board" : "Tavola";
  
  const navLblTeam = document.getElementById('nav-lbl-team');
  if (navLblTeam) navLblTeam.innerText = lang === 'en' ? "Team" : "Squadra";
  
  const navLblCodex = document.getElementById('nav-lbl-codex');
  if (navLblCodex) navLblCodex.innerText = lang === 'en' ? "Codex" : "Codice";
  
  const navLblGacha = document.getElementById('nav-lbl-gacha');
  if (navLblGacha) navLblGacha.innerText = lang === 'en' ? "Summon" : "Tempio";
  
  // Gacha page title and description
  const gachaScreen = document.getElementById('screen-gacha');
  if (gachaScreen) {
    const bannerTitle = gachaScreen.querySelector('.scenario-banner h2');
    const bannerDesc = gachaScreen.querySelector('.scenario-banner p');
    if (bannerTitle) bannerTitle.textContent = lang === 'en' ? "Summoning Temple" : "Tempio delle Evocazioni";
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
    card.className = `codex-card ${isUnlocked ? '' : 'locked'}`;
    
    // Mostra il grado
    const gradeBadge = `<span class="codex-card-grade ${template.grade.toLowerCase()}">${template.grade}</span>`;
    
    if (isUnlocked) {
      card.innerHTML = `
        ${gradeBadge}
        <div class="codex-card-avatar" style="width: 100%; display: flex; align-items: center; justify-content: center;">${getHeroAvatarHtml(template, true, 'card')}</div>
        <div class="codex-card-name">${template.name}</div>
      `;
      card.addEventListener('click', () => openCodexLore(template.name));
    } else {
      card.innerHTML = `
        ${gradeBadge}
        <div class="codex-card-avatar">🔒</div>
        <div class="codex-card-name">???</div>
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
  const lore = HERO_LORE_DATABASE[heroName];
  
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
