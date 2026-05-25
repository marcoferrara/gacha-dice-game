import { HeroClass, HeroGrade, ElementType } from '../types';

export interface Translation {
  it: string;
  en: string;
}

export interface HeroTemplate {
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

export interface HeroLore {
  title: Translation;
  history: Translation;
}

export interface HeroEntry {
  template: HeroTemplate;
  lore: HeroLore;
  localized: { skillName: Translation; desc: Translation };
}

// Single source of truth for all hero data
export const HEROES: Record<string, HeroEntry> = {
  SHARDANA_C: {
    template: { name: 'Josto', heroClass: 'SHARDANA', grade: 'C', maxHp: 100, attack: 20, defense: 5, skillCooldown: 3.8, icon: '🏹', skillName: 'Fendente del Cacciatore', desc: 'Guerriero Shardana abile con l\'arco, colpisce rapidamente a distanza.', element: 'VENTO', image: 'josto.png' },
    lore: {
      title: { en: 'Son of Amsicora & Shardana Patriot', it: 'Figlio di Amsicora & Patriota Shardana' },
      history: {
        en: 'Josto was the brave son of the legendary leader Amsicora. During the Sardinian-Carthaginian rebellion against Roman rule in 215 BC, he commanded the rebel forces during his father\'s absence. Despite his tragic end in the Battle of Decimomannu, his youthful courage and sacrifice remain a powerful symbol of Sardinian resistance and fight for freedom.',
        it: 'Josto era il valoroso figlio del leggendario condottiero Amsicora. Durante la ribellione sardo-cartaginese contro il dominio romano nel 215 a.C., comandò le forze ribelli in assenza del padre. Nonostante la sua tragica fine nella battaglia di Decimomannu, il suo coraggio giovanile e il suo sacrificio rimangono un potente simbolo della resistenza sarda per la libertà.'
      }
    },
    localized: {
      skillName: { en: 'Hunter\'s Slash', it: 'Fendente del Cacciatore' },
      desc: { en: 'Skilled Shardana archer, strikes quickly from a distance.', it: 'Guerriero Shardana abile con l\'arco, colpisce rapidamente a distanza.' }
    }
  },
  ACCABADORA_C: {
    template: { name: 'Caddozzo', heroClass: 'ACCABADORA', grade: 'C', maxHp: 90, attack: 18, defense: 4, skillCooldown: 3.2, icon: '🔪', skillName: 'Taglio Rapido', desc: 'Apprendista del rito del trapasso, sferra colpi fulminei alle spalle.', element: 'ACQUA', image: 'caddozzo.png' },
    lore: {
      title: { en: 'Novice of the Trappas & Obsidian Shadow', it: 'Novizio del Trapasso & Ombra d\'Ossidiana' },
      history: {
        en: 'An apprentice under the grim Accabadora, Caddozzo is a shadow lurking in the dark alleys of ancient villages. Equipped with daggers of black Mount Arci obsidian, he performs silent tasks, learning the delicate boundary between life and death under the ancient traditions of Sardinia.',
        it: 'Apprendista sotto la guida della severa Accabadora, Caddozzo è un\'ombra che si aggira nei vicoli bui degli antichi villaggi. Equipaggiato con pugnali di ossidiana nera del Monte Arci, esegue compiti silenziosi, apprendendo il delicato confine tra la vita e la morte secondo le antiche tradizioni sarde.'
      }
    },
    localized: {
      skillName: { en: 'Quick Cut', it: 'Taglio Rapido' },
      desc: { en: 'Apprentice of the ritual of death, strikes lightning-fast blows from behind.', it: 'Apprendista del rito del trapasso, sferra colpi fulminei alle spalle.' }
    }
  },
  GIGANTE_C: {
    template: { name: 'Bruncu', heroClass: 'GIGANTE', grade: 'C', maxHp: 200, attack: 16, defense: 8, skillCooldown: 5.5, icon: '🧱', skillName: 'Muro di Rupi', desc: 'Guardia dei vecchi nuraghi, erige barriere di pietra protettiva.', element: 'PIETRA', image: 'bruncu.png' },
    lore: {
      title: { en: 'Basalt Sentry of the Giants', it: 'Sentinella Basaltica dei Giganti' },
      history: {
        en: 'A robust guardian of stone, Bruncu is a giant born from the basalt of ancient nuraghi. Standing like an unyielding rock, he is the first shield of the team, using protective stones to shield his allies from enemy onslaughts, embodying the prehistoric stability of Sardinian architecture.',
        it: 'Un robusto guardiano di pietra, Bruncu è un gigante nato dal basalto degli antichi nuraghi. Ritto come una roccia incrollabile, è il primo scudo del gruppo, utilizzando pietre protettive per proteggere i compagni dagli assalti nemici, incarnando la stabilità preistorica dell\'architettura sarda.'
      }
    },
    localized: {
      skillName: { en: 'Crag Wall', it: 'Muro di Rupi' },
      desc: { en: 'Sentry of the old nuraghi, erects protective stone barriers.', it: 'Guardia dei vecchi nuraghi, erige barriere di pietra protettiva.' }
    }
  },
  JANA_C: {
    template: { name: 'Mamuthoneddu', heroClass: 'JANA', grade: 'C', maxHp: 95, attack: 21, defense: 3, skillCooldown: 4.2, icon: '🎭', skillName: 'Squillo di Campanacci', desc: 'Spirito mascherato minore, disorienta i nemici col rumore dei campanacci.', element: 'VENTO', image: 'mamuthoneddu.png' },
    lore: {
      title: { en: 'Minor Spirit of the Mask', it: 'Spirito Minore della Maschera' },
      history: {
        en: 'A mischievous spirit dressed in black sheepskins and dark wooden masks, Mamuthoneddu is a playful yet eerie representation of the ancient Mamuthones. With his heavy bronze bells (campanacci), he creates rhythmic confusion, chasing away winter spirits and disorienting battle foes.',
        it: 'Uno spirito burlone vestito di pelli di pecora nera e maschere di legno scuro, Mamuthoneddu è una rappresentazione giocosa ma inquietante degli antichi Mamuthones. Con i suoi pesanti campanacci di bronzo, crea una ritmica confusione, scacciando gli spiriti dell\'inverno e disorientando i nemici in battaglia.'
      }
    },
    localized: {
      skillName: { en: 'Clanging Bells', it: 'Squillo di Campanacci' },
      desc: { en: 'Minor masked spirit, disorients enemies with the sound of bells.', it: 'Spirito mascherato minore, disorienta i nemici col rumore dei campanacci.' }
    }
  },
  GIGANTE_R: {
    template: { name: 'Orthobene', heroClass: 'GIGANTE', grade: 'R', maxHp: 250, attack: 22, defense: 12, skillCooldown: 5.0, icon: '🗿', skillName: 'Scudo Concentrico', desc: 'Colosso basaltico semovente, focalizza l\'aggro e aumenta la difesa del team.', element: 'PIETRA', image: 'orthobene.png' },
    lore: {
      title: { en: 'Colossus of the Silent Peak', it: 'Colosso della Vetta Silente' },
      history: {
        en: 'Orthobene is a colossal basalt golem named after the holy peak of Nuoro. Formed by primeval geological activity, he focuses the aggro of opponents, fortifying his body and drawing strength from the deep roots of Sardinian soil. He stands as a monumental guardian against foreign invaders.',
        it: 'Orthobene è un colossale golem basaltico che prende il nome dalla vetta sacra di Nuoro. Formatosi attraverso un\'attività geologica primordiale, concentra su di sé l\'ira degli avversari, fortificando il proprio corpo e traendo forza dalle profonde radici del suolo sardo. Si erge a difesa contro ogni invasore esterno.'
      }
    },
    localized: {
      skillName: { en: 'Concentric Shield', it: 'Scudo Concentrico' },
      desc: { en: 'Moving basalt colossus, draws aggro and increases team defense.', it: 'Colosso basaltico semovente, focalizza l\'aggro e aumenta la difesa del team.' }
    }
  },
  SHARDANA_R: {
    template: { name: 'Torico', heroClass: 'SHARDANA', grade: 'R', maxHp: 160, attack: 25, defense: 9, skillCooldown: 3.6, icon: '🛡️', skillName: 'Carica del Toro', desc: 'Guerriero d\'élite con corna di bronzo, travolge le prime linee nemiche.', element: 'OSSIDIANA', image: 'torico.png' },
    lore: {
      title: { en: 'Bronze Bull Captain', it: 'Capitano del Toro di Bronzo' },
      history: {
        en: 'Torico wears a horn-crested bronze helmet resembling the sacred bull statuettes found in nuragic sanctuaries. Representing strength, masculinity, and divine protection, he leads Shardana charges, crushing enemy defense barriers with relentless determination.',
        it: 'Torico indossa un elmo di bronzo crestato di corna che richiama le statuette taurine sacre rinvenute nei santuari nuragici. Rappresentando la forza, la virilità e la protezione divina, guida le cariche degli Shardana, travolgendo le barriere difensive nemiche con implacabile determinazione.'
      }
    },
    localized: {
      skillName: { en: 'Bull Charge', it: 'Carica del Toro' },
      desc: { en: 'Elite warrior with bronze horns, crashes through enemy frontlines.', it: 'Guerriero d\'élite con corna di bronzo, travolge le prime linee nemiche.' }
    }
  },
  JANA_R: {
    template: { name: 'Vento di Janas', heroClass: 'JANA', grade: 'R', maxHp: 110, attack: 26, defense: 5, skillCooldown: 4.1, icon: '🌬️', skillName: 'Brezza di Sedini', desc: 'Fata delle grotte che manipola le correnti curative e rinfrescanti.', element: 'VENTO', image: 'vento_di_janas.png' },
    lore: {
      title: { en: 'Fairy of the Sedini Winds', it: 'Fata dei Venti di Sedini' },
      history: {
        en: 'A mystical Jana who resides inside the cave-dwellings (Domus de Janas) of Sedini. She commands the swift, refreshing breeze to heal wounded warriors, weave protective shields of stardust, and blow away toxins and curses cast by enemy shamans.',
        it: 'Una mistica Jana che risiede nelle case delle fate (Domus de Janas) di Sedini. Comanda la brezza fresca e veloce per curare i guerrieri feriti, tessere scudi protettivi di polvere stellare e spazzare via le tossine e le maledizioni scagliate dagli sciamani nemici.'
      }
    },
    localized: {
      skillName: { en: 'Breeze of Sedini', it: 'Brezza di Sedini' },
      desc: { en: 'Cave fairy who manipulates healing and cooling wind currents.', it: 'Fata delle grotte che manipola le correnti curative e rinfrescanti.' }
    }
  },
  JANA_S: {
    template: { name: 'Jana Medusa', heroClass: 'JANA', grade: 'S', maxHp: 120, attack: 28, defense: 4, skillCooldown: 4.0, icon: '✨', skillName: 'Soffio di Domus', desc: 'Fata tessitrice di filigrana magica, lancia potenti incantesimi di cura del team.', element: 'ACQUA', image: 'jana_medusa.png' },
    lore: {
      title: { en: 'Gold Filigree Weaver', it: 'Tessitrice di Filigrana d\'Oro' },
      history: {
        en: 'Jana Medusa is a royal fairy of Sardinian folklore, famous for weaving precious threads of golden filigree on her ancient loom. Her spells can bind the wounds of the entire squad, restoring vitality and shielding them with ancient Nuragic protective runes.',
        it: 'Jana Medusa è una fata regale del folklore sardo, famosa per tessere preziosi fili di filigrana d\'oro sul suo antico telaio. I suoi incantesimi curativi fasciano le ferite dell\'intera squadra, ripristinando la vitalità e proteggendoli con antiche rune nuragiche di difesa.'
      }
    },
    localized: {
      skillName: { en: 'Sigh of the Domus', it: 'Soffio di Domus' },
      desc: { en: 'Fairy weaver of magic filigree, casts powerful team healing spells.', it: 'Fata tessitrice di filigrana magica, lancia potenti incantesimi di cura del team.' }
    }
  },
  ACCABADORA_S: {
    template: { name: 'Eleonora', heroClass: 'ACCABADORA', grade: 'S', maxHp: 130, attack: 34, defense: 5, skillCooldown: 3.0, icon: '💀', skillName: 'Colpo di Grazia', desc: 'Sacerdotessa dell\'ossidiana, giustizia i nemici feriti infliggendo danni fatali.', element: 'OSSIDIANA', image: 'eleonora.png' },
    lore: {
      title: { en: 'Judge of Arborea & Obsidian Priestess', it: 'Giudicessa d\'Arborea & Sacerdotessa dell\'Ossidiana' },
      history: {
        en: 'Named after Eleonora of Arborea, the legendary ruler who promulgated the famous \'Carta de Logu\' code of laws in the 14th century. In our mythos, she acts as an Obsidian Priestess, wielding the power of judicial fate to execute injured adversaries with a swift strike.',
        it: 'Prende il nome da Eleonora d\'Arborea, la leggendaria regnante che promuò il celebre codice di leggi \'Carta de Logu\' nel XIV secolo. Nel nostro mito, agisce come una Sacerdotessa dell\'Ossidiana, brandendo il potere del destino giudiziario per giustiziare con un colpo rapido gli avversari feriti.'
      }
    },
    localized: {
      skillName: { en: 'Grace Strike', it: 'Colpo di Grazia' },
      desc: { en: 'Priestess of obsidian, executes wounded enemies with fatal damage.', it: 'Sacerdotessa dell\'ossidiana, giustizia i nemici feriti infliggendo danni fatali.' }
    }
  },
  SHARDANA_S: {
    template: { name: 'Mariano', heroClass: 'SHARDANA', grade: 'S', maxHp: 140, attack: 30, defense: 7, skillCooldown: 3.5, icon: '📜', skillName: 'Carta de Logu', desc: 'Giudice legislatore sardo, ordina attacchi coordinati aumentando l\'efficacia.', element: 'PIETRA', image: 'mariano.png' },
    lore: {
      title: { en: 'Sardinian Sovereign & Tactician', it: 'Sovrano Sardo & Tattico' },
      history: {
        en: 'A prominent judge-king of Sardinian history, Mariano is a master tactician. By organizing coordinated military ranks, he enhances the attack power and critical hit rate of all allies on the board, demonstrating the strategic genius of ancient Sardinian self-governance.',
        it: 'Un importante re-giudice della storia sarda, Mariano è un maestro di tattica. Organizzando ranghi militari coordinati, potenzia il potere d\'attacco e il tasso critico di tutti gli alleati sul campo, dimostrando il genio strategico dell\'antico autogoverno sardo.'
      }
    },
    localized: {
      skillName: { en: 'Carta de Logu', it: 'Carta de Logu' },
      desc: { en: 'Sardinian judge-legislator, orders coordinated strikes boosting team power.', it: 'Giudice legislatore sardo, ordina attacchi coordinati aumentando l\'efficacia.' }
    }
  },
  SHARDANA_SR: {
    template: { name: 'Amsicora', heroClass: 'SHARDANA', grade: 'SR', maxHp: 180, attack: 38, defense: 8, skillCooldown: 3.5, icon: '⚔️', skillName: 'Furia del Bronzo', desc: 'Leggendario condottiero sardo, scatena colpi fulminei ad altissimo danno critico.', element: 'OSSIDIANA', image: 'amsicora.png' },
    lore: {
      title: { en: 'The Legendary Leader of Rebellion', it: 'Il Leggendario Leader della Ribellione' },
      history: {
        en: 'Amsicora was a noble Sardinian-Carthaginian landowner and military leader who spearheaded the great rebellion against the Roman Republic in 215 BC. Armed with a heavy bronze sword, he represents the unyielding spirit of Sardinian independence, executing critical blows that shatter enemy formations.',
        it: 'Amsicora fu un nobile proprietario terriero sardo-cartaginese e leader militare che guidò la grande ribellione contro la Repubblica Romana nel 215 a.C. Armato di una pesante spada di bronzo, rappresenta lo spirito indomito dell\'indipendenza sarda, infliggendo colpi critici che frantumano le difese nemiche.'
      }
    },
    localized: {
      skillName: { en: 'Bronze Fury', it: 'Furia del Bronzo' },
      desc: { en: 'Legendary Sardinian leader, unleashes high crit damage lightning strikes.', it: 'Leggendario condottiero sardo, scatena colpi fulminei ad altissimo danno critico.' }
    }
  },
  GIGANTE_SR: {
    template: { name: 'Gigante Prama', heroClass: 'GIGANTE', grade: 'SR', maxHp: 320, attack: 28, defense: 15, skillCooldown: 4.8, icon: '🏛️', skillName: 'Pugno Ancestrale', desc: 'Colosso basaltico millenario dagli occhi a cerchio, incassa ingenti danni.', element: 'PIETRA', image: 'gigante_prama.png' },
    lore: {
      title: { en: 'Ancient Basalt Warrior of Mont\'e Prama', it: 'Antico Guerriero Basaltico di Mont\'e Prama' },
      history: {
        en: 'Inspired by the famous stone giants discovered at Mont\'e Prama (dating back to the 10th-8th century BC), this monumental basalt warrior possesses iconic concentric circles for eyes and carries a massive shield. He is virtually indestructible, absorbing heavy hits for the entire party.',
        it: 'Ispirato ai celebri giganti di pietra scoperti a Mont\'e Prama (risalenti al X-VIII secolo a.C.), questo monumentale guerriero di basalto possiede gli iconici occhi a cerchi concentrici e porta un massiccio scudo. È praticamente indistruttibile, assorbendo colpi devastanti al posto della squadra.'
      }
    },
    localized: {
      skillName: { en: 'Ancestral Fist', it: 'Pugno Ancestrale' },
      desc: { en: 'Millennial basalt giant with circular eyes, absorbs massive damage.', it: 'Colosso basaltico millenario dagli occhi a cerchio, incassa ingenti danni.' }
    }
  },
  ACCABADORA_SR: {
    template: { name: 'Liba', heroClass: 'ACCABADORA', grade: 'SR', maxHp: 150, attack: 40, defense: 6, skillCooldown: 2.8, icon: '🪵', skillName: 'Mazzuolo del Destino', desc: 'L\'Accabadora Suprema, esegue istantaneamente i nemici sotto il 30% di salute.', element: 'VENTO', image: 'liba.png' },
    lore: {
      title: { en: 'The Supreme Accabadora', it: 'L\'Accabadora Suprema' },
      history: {
        en: 'The ultimate \'Accabadora\' (from the Sardinian \'acabà\', meaning to finish), Liba is a mythic priestess dressed in black. Armed with a ritual olive-wood mallet, she brings a merciful release to the suffering. In battle, she immediately executes any enemy falling below 30% of their maximum health.',
        it: 'La suprema \'Accabadora\' (dal sardo \'acabà\', finire), Liba è una mitica sacerdotessa vestita di nero. Armata di un mazzuolo rituale di legno d\'olivo, porta una misericordiosa fine alle sofferenze. In battaglia, esegue istantaneamente qualsiasi nemico scenda sotto il 30% dei suoi HP massimi.'
      }
    },
    localized: {
      skillName: { en: 'Mallet of Destiny', it: 'Mazzuolo del Destino' },
      desc: { en: 'The Supreme Accabadora, immediately executes enemies below 30% HP.', it: 'L\'Accabadora Suprema, esegue istantaneamente i nemici sotto il 30% di salute.' }
    }
  }
};

// Lookup by hero display name (e.g. 'Amsicora', 'Jana Medusa')
export const HEROES_BY_NAME: Record<string, HeroEntry> = Object.fromEntries(
  Object.values(HEROES).map(e => [e.template.name, e])
);
