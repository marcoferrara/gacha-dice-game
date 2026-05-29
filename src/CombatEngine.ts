import { Hero, Enemy, EnemyType, ElementType } from './types';

type SkillType = 'DAMAGE' | 'AOE' | 'HEAL' | 'DEBUFF';

interface EnemyRole {
  name: string;
  element: ElementType;
  skill: { name: string; type: SkillType; cooldown: number };
}
interface EnemyFamily {
  common: EnemyRole;
  elite:  EnemyRole;
  boss:   EnemyRole;
}

// 15 biome families — indexed 0-14 (stage 1-15)
const ENEMY_FAMILIES: EnemyFamily[] = [
  // 1: Nuraghe Losa — antiche rovine, guerrieri di pietra
  {
    common: { name: 'Guerriero Petroso del Nuraghe',      element: 'PIETRA',    skill: { name: 'Pugno Basaltico',       type: 'DAMAGE', cooldown: 4.5 } },
    elite:  { name: 'Sentinella del Nuraghe Losa',        element: 'PIETRA',    skill: { name: 'Muro di Basalto',       type: 'DEBUFF', cooldown: 5.0 } },
    boss:   { name: 'Guardiano del Nuraghe Losa',         element: 'PIETRA',    skill: { name: 'Terremoto Nuragico',    type: 'AOE',    cooldown: 5.0 } },
  },
  // 2: Domus de Janas di Sedini — grotte delle fate
  {
    common: { name: 'Larva delle Janas',                  element: 'ACQUA',    skill: { name: 'Nebbia Fatata',         type: 'DEBUFF', cooldown: 5.0 } },
    elite:  { name: 'Jana Oscura di Sedini',              element: 'ACQUA',    skill: { name: 'Maleficio delle Fate',  type: 'AOE',    cooldown: 5.0 } },
    boss:   { name: 'Strega delle Janas Antica',          element: 'ACQUA',    skill: { name: 'Torrente Incantato',    type: 'AOE',    cooldown: 4.5 } },
  },
  // 3: Tomba dei Giganti di Coddu Vecchiu — basalti sepolcrali
  {
    common: { name: 'Ombra del Gigante Tombale',          element: 'PIETRA',    skill: { name: 'Schianto Tombale',      type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Guardiano Tombale di Coddu Vecchiu', element: 'PIETRA',    skill: { name: 'Baluardo Ancestrale',   type: 'HEAL',   cooldown: 6.0 } },
    boss:   { name: 'Anima del Gigante di Coddu Vecchiu', element: 'PIETRA',    skill: { name: 'Collasso Tombale',      type: 'AOE',    cooldown: 5.0 } },
  },
  // 4: Monte d'Accoddi — ziggurat solare
  {
    common: { name: 'Sacerdote del Sole di Accoddi',      element: 'VENTO',     skill: { name: 'Raggio Solare',         type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Alto Sacerdote di Accoddi',          element: 'VENTO',     skill: { name: 'Tuono della Ziggurat',  type: 'AOE',    cooldown: 5.0 } },
    boss:   { name: 'Custode Solare di Monte d\'Accoddi', element: 'VENTO',     skill: { name: 'Eruzione Solare',       type: 'AOE',    cooldown: 5.0 } },
  },
  // 5: Pozzo Sacro di Santa Cristina — spiriti lunari dell'acqua
  {
    common: { name: 'Spirito dell\'Acqua Sacra',          element: 'ACQUA',    skill: { name: 'Vortice Sacro',         type: 'DAMAGE', cooldown: 4.5 } },
    elite:  { name: 'Custode del Pozzo Sacro',            element: 'ACQUA',    skill: { name: 'Onda Lunare',           type: 'DEBUFF', cooldown: 5.0 } },
    boss:   { name: 'Oracolo di Santa Cristina',          element: 'ACQUA',    skill: { name: 'Diluvio Lunare',        type: 'AOE',    cooldown: 5.0 } },
  },
  // 6: Grotte di Nettuno — labirinto sottomarino
  {
    common: { name: 'Sirena Oscura Sarda',                element: 'ACQUA',    skill: { name: 'Canto Abissale',        type: 'DEBUFF', cooldown: 4.5 } },
    elite:  { name: 'Tritone del Labirinto Sommerso',     element: 'ACQUA',    skill: { name: 'Corrente di Nettuno',   type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Re delle Grotte di Nettuno',         element: 'ACQUA',    skill: { name: 'Tsunami Abissale',      type: 'AOE',    cooldown: 4.5 } },
  },
  // 7: Su Nuraxi di Barumini — fortezza degli Shardana oscuri
  {
    common: { name: 'Shardana Oscuro di Barumini',        element: 'OSSIDIANA', skill: { name: 'Lama Ossidiana',        type: 'DAMAGE', cooldown: 3.5 } },
    elite:  { name: 'Capitano Shardana Oscuro',           element: 'OSSIDIANA', skill: { name: 'Assalto della Fortezza',type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Re Oscuro di Su Nuraxi',             element: 'OSSIDIANA', skill: { name: 'Conquista Shardana',    type: 'AOE',    cooldown: 4.5 } },
  },
  // 8: Foresta di Burgos — spiriti naturali dei cervi sacri
  {
    common: { name: 'Cervo Sacro Corrotto',               element: 'VENTO',     skill: { name: 'Corna Selvatiche',      type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Spirito Forestale di Burgos',        element: 'VENTO',     skill: { name: 'Vortice di Foglie',     type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Guardiano della Foresta di Burgos',  element: 'VENTO',     skill: { name: 'Uragano Boscoso',       type: 'AOE',    cooldown: 4.5 } },
  },
  // 9: Dune di Piscinas — spiriti del deserto dorato
  {
    common: { name: 'Spirito della Sabbia di Piscinas',   element: 'VENTO',     skill: { name: 'Tempesta di Sabbia',    type: 'DEBUFF', cooldown: 4.5 } },
    elite:  { name: 'Demone del Deserto Dorato',          element: 'VENTO',     skill: { name: 'Turbine Sabbioso',      type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Signore delle Dune di Piscinas',     element: 'VENTO',     skill: { name: 'Grande Tempesta Dorata',type: 'AOE',    cooldown: 5.0 } },
  },
  // 10: Altare Rupestre di Santo Stefano — preistoria incisa nella roccia
  {
    common: { name: 'Guerriero Preistorico Rupestre',     element: 'PIETRA',    skill: { name: 'Incisione Rupestre',    type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Officiante del Rito Antico',         element: 'PIETRA',    skill: { name: 'Rito della Roccia',     type: 'HEAL',   cooldown: 6.0 } },
    boss:   { name: 'Spirito Preistorico di Santo Stefano',element:'PIETRA',    skill: { name: 'Sacrificio Antico',     type: 'AOE',    cooldown: 5.0 } },
  },
  // 11: Monte Ortobene — vetta sacra, giganti silenti
  {
    common: { name: 'Gigante Silente di Ortobene',        element: 'PIETRA',    skill: { name: 'Lancio di Masso',       type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Guardiano della Vetta Sacra',        element: 'VENTO',     skill: { name: 'Vento della Cima',      type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Titano di Monte Ortobene',           element: 'VENTO',     skill: { name: 'Caduta della Vetta',    type: 'AOE',    cooldown: 4.5 } },
  },
  // 12: Is Zuddas — sculture di aragonite, cristalli viventi
  {
    common: { name: 'Cristallo Vivente di Is Zuddas',     element: 'ACQUA',    skill: { name: 'Scheggia di Aragonite', type: 'DAMAGE', cooldown: 4.0 } },
    elite:  { name: 'Golem di Aragonite',                 element: 'ACQUA',    skill: { name: 'Punta Cristallina',     type: 'DEBUFF', cooldown: 5.0 } },
    boss:   { name: 'Signore delle Stalattiti di Is Zuddas',element:'ACQUA',   skill: { name: 'Pioggia di Cristalli',  type: 'AOE',    cooldown: 4.5 } },
  },
  // 13: Tharros antica — rovine fenicie, mare oscuro
  {
    common: { name: 'Ombra Fenicia di Tharros',           element: 'OSSIDIANA', skill: { name: 'Maledizione Punica',    type: 'DEBUFF', cooldown: 4.5 } },
    elite:  { name: 'Mercenario Fenicio di Tharros',      element: 'OSSIDIANA', skill: { name: 'Ira di Baal',           type: 'AOE',    cooldown: 4.5 } },
    boss:   { name: 'Re dei Mari Fenici',                 element: 'ACQUA',    skill: { name: 'Tempesta Fenicia',      type: 'AOE',    cooldown: 4.5 } },
  },
  // 14: Barbagia Selvaggia — maschere rituali, oscurità
  {
    common: { name: 'Mamuthone Mascherato della Barbagia',element: 'OSSIDIANA', skill: { name: 'Colpo della Maschera',  type: 'DAMAGE', cooldown: 3.5 } },
    elite:  { name: 'Issohador Oscuro',                   element: 'OSSIDIANA', skill: { name: 'Danza della Morte',     type: 'AOE',    cooldown: 4.0 } },
    boss:   { name: 'Grande Mamuthone Capo della Barbagia',element:'OSSIDIANA', skill: { name: 'Rito del Trapasso',     type: 'AOE',    cooldown: 4.0 } },
  },
  // 15: Tempio di Antas — unione eterna con il Sardus Pater
  {
    common: { name: 'Ombra del Sardus Pater',             element: 'PIETRA',    skill: { name: 'Maledizione del Dio',   type: 'DEBUFF', cooldown: 4.0 } },
    elite:  { name: 'Custode del Tempio di Antas',        element: 'OSSIDIANA', skill: { name: 'Fuoco Divino',          type: 'AOE',    cooldown: 4.0 } },
    boss:   { name: 'Sardus Pater — Manifestazione Finale',element:'OSSIDIANA', skill: { name: 'Ira degli Dèi Sardi',   type: 'AOE',    cooldown: 4.0 } },
  },
];

export class CombatEngine {
  public static spawnEnemy(level: number, type: EnemyType): Enemy {
    const familyIdx = Math.min(level - 1, ENEMY_FAMILIES.length - 1);
    const family = ENEMY_FAMILIES[familyIdx];
    const roleKey = type === 'BOSS' ? 'boss' : type === 'ELITE' ? 'elite' : 'common';
    const role = family[roleKey];

    let hpMultiplier: number;
    let statMultiplier: number;
    switch (type) {
      case 'COMMON': hpMultiplier = 100; statMultiplier = 1.0; break;
      case 'ELITE':  hpMultiplier = 350; statMultiplier = 1.5; break;
      case 'BOSS':   hpMultiplier = 800; statMultiplier = 2.0; break;
    }

    const baseHp     = hpMultiplier * (1 + (level - 1) * 0.15);
    const baseAttack = 15 * statMultiplier * (1 + (level - 1) * 0.12);
    const baseDefense = 4 * statMultiplier * (1 + (level - 1) * 0.1);

    const skillDamageMult = type === 'BOSS' ? 2.2 : type === 'ELITE' ? 2.0 : 1.8;

    return {
      name: role.name,
      type,
      maxHp:     Math.round(baseHp),
      currentHp: Math.round(baseHp),
      attack:    Math.round(baseAttack),
      defense:   Math.round(baseDefense),
      element:   role.element,
      skills: [{
        name:     role.skill.name,
        type:     role.skill.type,
        damage:   Math.round(baseAttack * skillDamageMult),
        cooldown: role.skill.cooldown,
        timer:    0,
      }],
    };
  }

  // OSSIDIANA > VENTO > PIETRA > ACQUA > OSSIDIANA
  public static getElementalMultiplier(attacker: ElementType, target: ElementType): number {
    if (attacker === 'OSSIDIANA' && target === 'VENTO')    return 1.30;
    if (attacker === 'VENTO'     && target === 'PIETRA')   return 1.30;
    if (attacker === 'PIETRA'    && target === 'ACQUA')    return 1.30;
    if (attacker === 'ACQUA'     && target === 'OSSIDIANA')return 1.30;

    if (attacker === 'VENTO'     && target === 'OSSIDIANA')return 0.80;
    if (attacker === 'PIETRA'    && target === 'VENTO')    return 0.80;
    if (attacker === 'ACQUA'     && target === 'PIETRA')   return 0.80;
    if (attacker === 'OSSIDIANA' && target === 'ACQUA')    return 0.80;

    return 1.0;
  }

  public static calculateSynergies(team: Hero[]) {
    const alive = team.filter(h => h.currentHp > 0);
    const classes = alive.map(h => h.heroClass);

    const shardanaCount  = classes.filter(c => c === 'SHARDANA').length;
    const janaCount      = classes.filter(c => c === 'JANA').length;
    const giganteCount   = classes.filter(c => c === 'GIGANTE').length;
    const accabadoraCount= classes.filter(c => c === 'ACCABADORA').length;

    let atkMultiplier   = 1.0;
    let defBonus        = 0;
    let healMultiplier  = 1.0;
    let cooldownReduction = 0;
    let critChanceBonus = 0.0;
    const activeList: string[] = [];

    if (shardanaCount >= 3) {
      atkMultiplier = 1.15;
      activeList.push('Furia Guerriera Shardana (+15% ATK)');
    }
    if (janaCount >= 2) {
      healMultiplier = 1.20;
      cooldownReduction = 0.10;
      activeList.push('Benedizione delle Janas (+20% Cura, -10% CD)');
    }
    if (giganteCount >= 2) {
      defBonus = 3;
      activeList.push('Baluardo Basaltico dei Giganti (+3 DEF)');
    }
    if (accabadoraCount >= 2) {
      critChanceBonus = 0.10;
      activeList.push('Rito del Trapasso delle Accabadore (+10% Critico)');
    }

    return { atkMultiplier, defBonus, healMultiplier, cooldownReduction, critChanceBonus, activeList };
  }

  public static simulateRealTimeCombat(
    team: Hero[],
    enemy: Enemy,
    language: 'en' | 'it' = 'it'
  ): { victory: boolean; log: string[] } {
    const battleLog: string[] = [];

    battleLog.push(language === 'en'
      ? `⚔️ REAL-TIME BATTLE STARTED vs. ${enemy.name} [Element: ${enemy.element}] (HP: ${enemy.maxHp}, ATK: ${enemy.attack}, DEF: ${enemy.defense})`
      : `⚔️ INIZIO BATTAGLIA IN TEMPO REALE vs. ${enemy.name} [Elemento: ${enemy.element}] (HP: ${enemy.maxHp}, ATK: ${enemy.attack}, DEF: ${enemy.defense})`);

    const synergies = this.calculateSynergies(team);
    if (synergies.activeList.length > 0) {
      battleLog.push(language === 'en' ? `🌟 Active team synergies:` : `🌟 Sinergie attive di squadra:`);
      synergies.activeList.forEach(s => {
        let loc = s;
        if (language === 'en') {
          if (s.includes('Furia Guerriera Shardana'))         loc = 'Shardana Warrior Fury (+15% ATK)';
          else if (s.includes('Benedizione delle Janas'))     loc = 'Janas Blessing (+20% Healing, -10% CD)';
          else if (s.includes('Baluardo Basaltico dei Giganti'))loc = 'Basaltic Bulwark of Giants (+3 DEF)';
          else if (s.includes('Rito del Trapasso delle Accabadore'))loc = 'Accabadora Death Rite (+10% Crit)';
        }
        battleLog.push(`   * ${loc}`);
      });
    }

    const originalAttacks   = team.map(h => h.attack);
    const originalDefenses  = team.map(h => h.defense);
    const originalCooldowns = team.map(h => h.skillCooldown);
    const originalCrits     = team.map(h => h.criticalChance);

    team.forEach(h => {
      if (h.currentHp > 0) {
        h.attack       = Math.round(h.attack * synergies.atkMultiplier);
        h.defense     += synergies.defBonus;
        h.skillCooldown= parseFloat(Math.max(1.0, h.skillCooldown * (1 - synergies.cooldownReduction)).toFixed(1));
        h.criticalChance += synergies.critChanceBonus;
      }
      h.skillTimer = -(h.skillCastTime || 0);
      h.skillReady = false;
      h.tempCombatDef = 0;
    });

    enemy.skills[0].timer = 0;

    let ticks = 0;
    const TICK_RATE = 0.1;
    const MAX_TICKS = 450; // 45 seconds

    while (enemy.currentHp > 0 && this.isTeamAlive(team) && ticks < MAX_TICKS) {
      ticks++;
      const time = parseFloat((ticks * TICK_RATE).toFixed(1));

      team.forEach(hero => {
        if (hero.currentHp <= 0) return;
        hero.skillTimer = parseFloat((hero.skillTimer + TICK_RATE).toFixed(2));
        if (hero.skillTimer >= hero.skillCooldown) {
          this.castHeroSkill(hero, team, enemy, time, battleLog, language);
          hero.skillTimer = 0;
        }
      });

      enemy.skills[0].timer = parseFloat((enemy.skills[0].timer + TICK_RATE).toFixed(2));
      if (enemy.skills[0].timer >= enemy.skills[0].cooldown) {
        this.castEnemySkill(enemy, team, time, battleLog, language);
        enemy.skills[0].timer = 0;
      }

      if (ticks % 10 === 0) {
        const aliveHeroes = team.filter(h => h.currentHp > 0);
        aliveHeroes.forEach(attacker => {
          if (enemy.currentHp <= 0) return;
          const elemMult = this.getElementalMultiplier(attacker.element || 'VENTO', enemy.element || 'VENTO');
          const baseDmg  = Math.max(1, attacker.attack - enemy.defense);
          const isCrit   = Math.random() < attacker.criticalChance;
          const dmg      = Math.round(baseDmg * elemMult * (isCrit ? 1.5 : 1.0));
          enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

          let msg = language === 'en'
            ? `[${time}s] 🗡️ ${attacker.name} base attack: ${dmg} dmg to ${enemy.name}.`
            : `[${time}s] 🗡️ ${attacker.name} attacco base: ${dmg} danni a ${enemy.name}.`;
          if (isCrit)        msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
          if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Element Adv!)' : ' (🔥 Vantaggio Elem!)';
          if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Element Disadv)' : ' (❄️ Svantaggio Elem)';
          msg += language === 'en' ? ` (Enemy HP: ${enemy.currentHp}/${enemy.maxHp})` : ` (HP Nemico: ${enemy.currentHp}/${enemy.maxHp})`;
          battleLog.push(msg);
        });

        if (enemy.currentHp > 0) {
          const target = this.selectEnemyTarget(team);
          if (target) {
            const elemMult    = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
            const effectiveDef = target.defense + (target.tempCombatDef || 0);
            const baseDmg     = Math.max(1, enemy.attack - effectiveDef);
            const dmg         = Math.round(baseDmg * elemMult);
            target.currentHp  = Math.max(0, target.currentHp - dmg);

            let msg = language === 'en'
              ? `[${time}s] 💥 ${enemy.name} strikes ${target.name}: ${dmg} dmg.`
              : `[${time}s] 💥 ${enemy.name} colpisce ${target.name}: ${dmg} danni.`;
            if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Element Adv!)' : ' (🔥 Vantaggio Elem!)';
            if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Element Disadv)' : ' (❄️ Svantaggio Elem)';
            msg += language === 'en' ? ` (Hero HP: ${target.currentHp}/${target.maxHp})` : ` (HP Eroe: ${target.currentHp}/${target.maxHp})`;
            battleLog.push(msg);
          }
        }
      }
    }

    team.forEach((h, idx) => {
      h.attack        = originalAttacks[idx];
      h.defense       = originalDefenses[idx];
      h.skillCooldown = originalCooldowns[idx];
      h.criticalChance= originalCrits[idx];
      h.tempCombatDef = 0;
    });

    const victory = enemy.currentHp <= 0;
    const time    = parseFloat((ticks * TICK_RATE).toFixed(1));
    if (victory) {
      battleLog.push(language === 'en'
        ? `🏆 VICTORY! ${enemy.name} defeated in ${time}s!`
        : `🏆 VITTORIA! ${enemy.name} abbattuto in ${time} secondi!`);
    } else if (ticks >= MAX_TICKS) {
      battleLog.push(language === 'en'
        ? `⏱️ TIME OUT! The heroes had to retreat.`
        : `⏱️ TEMPO SCADUTO! Gli eroi si sono ritirati.`);
    } else {
      battleLog.push(language === 'en'
        ? `💀 DEFEAT! The team was wiped out against ${enemy.name}.`
        : `💀 SCONFITTA! L'intera squadra è caduta contro ${enemy.name}.`);
    }

    return { victory, log: battleLog };
  }

  public static isTeamAlive(team: Hero[]): boolean {
    return team.some(h => h.currentHp > 0);
  }

  // GIGANTE has 65% aggro pull — protects the team
  public static selectEnemyTarget(team: Hero[]): Hero | null {
    const alive = team.filter(h => h.currentHp > 0);
    if (alive.length === 0) return null;
    const giant = alive.find(h => h.heroClass === 'GIGANTE');
    if (giant && Math.random() < 0.65) return giant;
    return alive[Math.floor(Math.random() * alive.length)];
  }

  // DEBUFF skill targets the most vulnerable hero (lowest defense, bypasses GIGANTE aggro)
  private static selectDebuffTarget(team: Hero[]): Hero | null {
    const alive = team.filter(h => h.currentHp > 0);
    if (alive.length === 0) return null;
    return alive.reduce((weakest, h) => h.defense < weakest.defense ? h : weakest, alive[0]);
  }

  public static castHeroSkill(
    hero: Hero,
    team: Hero[],
    enemy: Enemy,
    time: number,
    log: string[],
    language: 'en' | 'it' = 'it'
  ): void {
    const elemMult = this.getElementalMultiplier(hero.element || 'VENTO', enemy.element || 'VENTO');

    switch (hero.heroClass) {
      case 'SHARDANA': {
        const isCrit = Math.random() < hero.criticalChance;
        let dmg = Math.max(5, Math.round(hero.attack * 3.5 - enemy.defense));
        dmg = Math.round(dmg * elemMult * (isCrit ? 1.5 : 1.0));
        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

        let msg = language === 'en'
          ? `[${time}s] ✨ 🔥 ${hero.name} unleashes ${hero.skillName}: ${dmg} dmg to ${enemy.name}.`
          : `[${time}s] ✨ 🔥 ${hero.name} scatena ${hero.skillName}: ${dmg} danni a ${enemy.name}.`;
        if (isCrit)        msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
        if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
        if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
        msg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
        log.push(msg);
        break;
      }

      case 'JANA': {
        const wounded    = team.filter(h => h.currentHp > 0 && h.currentHp < h.maxHp);
        const janaCount  = team.filter(h => h.currentHp > 0 && h.heroClass === 'JANA').length;
        const healMult   = janaCount >= 2 ? 1.20 : 1.0;

        if (wounded.length > 0) {
          wounded.forEach(h => {
            const heal = Math.round(hero.attack * 2.0 * healMult);
            h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
            log.push(language === 'en'
              ? `[${time}s] ✨ 🩹 ${hero.name} casts ${hero.skillName}: +${heal} HP on ${h.name}. (HP: ${h.currentHp}/${h.maxHp})`
              : `[${time}s] ✨ 🩹 ${hero.name} lancia ${hero.skillName}: cura +${heal} HP a ${h.name}. (HP: ${h.currentHp}/${h.maxHp})`);
          });
        } else {
          let dmg = Math.max(5, Math.round(hero.attack * 2.5));
          dmg = Math.round(dmg * elemMult);
          enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
          let msg = language === 'en'
            ? `[${time}s] ✨ ⚡ ${hero.name} casts BROCADE BOLT: ${dmg} magic dmg to ${enemy.name}.`
            : `[${time}s] ✨ ⚡ ${hero.name} lancia SAETTA DI BROCCATO: ${dmg} danni magici a ${enemy.name}.`;
          if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
          if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
          msg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
          log.push(msg);
        }
        break;
      }

      case 'GIGANTE': {
        team.forEach(h => { if (h.currentHp > 0) h.tempCombatDef = 3; });
        log.push(language === 'en'
          ? `[${time}s] ✨ 🛡️ ${hero.name} activates ${hero.skillName}! Team defense shield: +3 DEF.`
          : `[${time}s] ✨ 🛡️ ${hero.name} attiva ${hero.skillName}! Scudo difensivo del team: +3 DEF.`);
        break;
      }

      case 'ACCABADORA': {
        const isExecution = (enemy.currentHp / enemy.maxHp) < 0.3;
        const mult  = isExecution ? 5.5 : 2.0;
        const isCrit= Math.random() < hero.criticalChance;
        let dmg = Math.max(5, Math.round(hero.attack * mult - enemy.defense));
        dmg = Math.round(dmg * elemMult * (isCrit ? 1.5 : 1.0));
        if (isExecution) dmg = Math.min(dmg, Math.round(enemy.maxHp * 0.35));
        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

        let msg = language === 'en'
          ? `[${time}s] ✨ 💀 ${hero.name} unleashes ${hero.skillName}: ${dmg} dmg to ${enemy.name}${isExecution ? ' (Execution! 🩸)' : ''}.`
          : `[${time}s] ✨ 💀 ${hero.name} scarica ${hero.skillName}: ${dmg} danni a ${enemy.name}${isExecution ? ' (Esecuzione letale! 🩸)' : ''}.`;
        if (isCrit)        msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
        if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
        if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
        msg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
        log.push(msg);
        break;
      }
    }
  }

  public static castEnemySkill(
    enemy: Enemy,
    team: Hero[],
    time: number,
    log: string[],
    language: 'en' | 'it' = 'it'
  ): void {
    const skill     = enemy.skills[0];
    const skillType = skill.type ?? 'DAMAGE';

    // AOE — colpisce tutti gli eroi vivi per danno ridotto
    if (skillType === 'AOE') {
      const aliveHeroes = team.filter(h => h.currentHp > 0);
      const aoeDmg = Math.round(skill.damage * 0.55);
      const hits: string[] = [];
      aliveHeroes.forEach(target => {
        const elemMult    = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
        const effectiveDef = target.defense + (target.tempCombatDef || 0);
        const dmg         = Math.max(1, Math.round((aoeDmg - effectiveDef) * elemMult));
        target.currentHp  = Math.max(0, target.currentHp - dmg);
        hits.push(`${target.name} -${dmg}HP`);
      });
      log.push(language === 'en'
        ? `[${time}s] ⚠️ 💥 ${enemy.name} uses '${skill.name}' (AOE): ${hits.join(', ')}!`
        : `[${time}s] ⚠️ 💥 ${enemy.name} usa '${skill.name}' (AOE): ${hits.join(', ')}!`);
      return;
    }

    // HEAL — il nemico recupera il 18% degli HP massimi
    if (skillType === 'HEAL') {
      const healAmt   = Math.round(enemy.maxHp * 0.18);
      const before    = enemy.currentHp;
      enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + healAmt);
      const actual    = enemy.currentHp - before;
      log.push(language === 'en'
        ? `[${time}s] ⚠️ 💚 ${enemy.name} uses '${skill.name}': heals +${actual} HP. (HP: ${enemy.currentHp}/${enemy.maxHp})`
        : `[${time}s] ⚠️ 💚 ${enemy.name} usa '${skill.name}': recupera +${actual} HP. (HP: ${enemy.currentHp}/${enemy.maxHp})`);
      return;
    }

    // DEBUFF — prende di mira l'eroe con la difesa più bassa (ignora l'aggro del GIGANTE)
    const target = skillType === 'DEBUFF'
      ? this.selectDebuffTarget(team)
      : this.selectEnemyTarget(team);
    if (!target) return;

    const elemMult    = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
    const effectiveDef = target.defense + (target.tempCombatDef || 0);
    const baseDmg     = Math.max(5, Math.round(skill.damage - effectiveDef));
    const dmg         = Math.round(baseDmg * elemMult);
    target.currentHp  = Math.max(0, target.currentHp - dmg);

    let msg: string;
    if (skillType === 'DEBUFF') {
      msg = language === 'en'
        ? `[${time}s] ⚠️ 🌑 ${enemy.name} uses '${skill.name}' on ${target.name}: ${dmg} dmg (targets weakest hero!)`
        : `[${time}s] ⚠️ 🌑 ${enemy.name} usa '${skill.name}' su ${target.name}: ${dmg} danni (mira all'eroe più vulnerabile!)`;
    } else {
      msg = language === 'en'
        ? `[${time}s] ⚠️ 💥 ${enemy.name} uses '${skill.name}' on ${target.name}: ${dmg} dmg!`
        : `[${time}s] ⚠️ 💥 ${enemy.name} usa '${skill.name}' su ${target.name}: ${dmg} danni!`;
    }
    if (elemMult > 1.0)msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
    if (elemMult < 1.0)msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
    msg += language === 'en' ? ` (HP: ${target.currentHp}/${target.maxHp})` : ` (HP: ${target.currentHp}/${target.maxHp})`;
    log.push(msg);
  }
}
export default CombatEngine;
