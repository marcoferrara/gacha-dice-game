import { Hero, Enemy, EnemyType, ElementType } from './types';

export class CombatEngine {
  public static spawnEnemy(level: number, type: EnemyType): Enemy {
    let name = '';
    let hpMultiplier = 1;
    let statMultiplier = 1;

    switch (type) {
      case 'COMMON':
        name = 'Mamuthone Selvaggio';
        hpMultiplier = 100;
        statMultiplier = 1.0;
        break;
      case 'ELITE':
        name = 'Mamuthone Capo della Tribù (Elite)';
        hpMultiplier = 350;
        statMultiplier = 1.5;
        break;
      case 'BOSS':
        name = 'Il Guardiano del Nuraghe (Antico Boss)';
        hpMultiplier = 800;
        statMultiplier = 2.0;
        break;
    }

    const baseHp = hpMultiplier * (1 + (level - 1) * 0.15);
    const baseAttack = 15 * statMultiplier * (1 + (level - 1) * 0.12);
    const baseDefense = 4 * statMultiplier * (1 + (level - 1) * 0.1);

    let element: ElementType = 'VENTO';
    if (type === 'BOSS') element = 'PIETRA';
    else if (type === 'ELITE') element = 'OSSIDIANA';
    else {
      const elements: ElementType[] = ['VENTO', 'ACQUA', 'PIETRA', 'OSSIDIANA'];
      element = elements[Math.floor(Math.random() * elements.length)];
    }

    return {
      name,
      type,
      maxHp: Math.round(baseHp),
      currentHp: Math.round(baseHp),
      attack: Math.round(baseAttack),
      defense: Math.round(baseDefense),
      element,
      skills: [
        {
          name: type === 'BOSS' ? 'Terremoto Nuragico' : 'Fendente Oscuro',
          damage: Math.round(baseAttack * 1.8),
          cooldown: type === 'BOSS' ? 5.0 : 4.0,
          timer: 0,
        }
      ],
    };
  }

  // OSSIDIANA > VENTO > PIETRA > ACQUA > OSSIDIANA
  public static getElementalMultiplier(attacker: ElementType, target: ElementType): number {
    if (attacker === 'OSSIDIANA' && target === 'VENTO') return 1.30;
    if (attacker === 'VENTO' && target === 'PIETRA') return 1.30;
    if (attacker === 'PIETRA' && target === 'ACQUA') return 1.30;
    if (attacker === 'ACQUA' && target === 'OSSIDIANA') return 1.30;

    if (attacker === 'VENTO' && target === 'OSSIDIANA') return 0.80;
    if (attacker === 'PIETRA' && target === 'VENTO') return 0.80;
    if (attacker === 'ACQUA' && target === 'PIETRA') return 0.80;
    if (attacker === 'OSSIDIANA' && target === 'ACQUA') return 0.80;

    return 1.0;
  }

  public static calculateSynergies(team: Hero[]) {
    const alive = team.filter(h => h.currentHp > 0);
    const classes = alive.map(h => h.heroClass);

    const shardanaCount = classes.filter(c => c === 'SHARDANA').length;
    const janaCount = classes.filter(c => c === 'JANA').length;
    const giganteCount = classes.filter(c => c === 'GIGANTE').length;
    const accabadoraCount = classes.filter(c => c === 'ACCABADORA').length;

    let atkMultiplier = 1.0;
    let defBonus = 0;
    let healMultiplier = 1.0;
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
          if (s.includes('Furia Guerriera Shardana')) loc = 'Shardana Warrior Fury (+15% ATK)';
          else if (s.includes('Benedizione delle Janas')) loc = 'Janas Blessing (+20% Healing, -10% CD)';
          else if (s.includes('Baluardo Basaltico dei Giganti')) loc = 'Basaltic Bulwark of Giants (+3 DEF)';
          else if (s.includes('Rito del Trapasso delle Accabadore')) loc = 'Accabadora Death Rite (+10% Crit)';
        }
        battleLog.push(`   * ${loc}`);
      });
    }

    // Save originals and apply synergy bonuses
    const originalAttacks = team.map(h => h.attack);
    const originalDefenses = team.map(h => h.defense);
    const originalCooldowns = team.map(h => h.skillCooldown);
    const originalCrits = team.map(h => h.criticalChance);

    team.forEach((h) => {
      if (h.currentHp > 0) {
        h.attack = Math.round(h.attack * synergies.atkMultiplier);
        h.defense += synergies.defBonus;
        h.skillCooldown = parseFloat(Math.max(1.0, h.skillCooldown * (1 - synergies.cooldownReduction)).toFixed(1));
        h.criticalChance += synergies.critChanceBonus;
      }
      // skillCastTime used as initial delay before first skill is available
      h.skillTimer = -(h.skillCastTime || 0);
      h.skillReady = false;
      h.tempCombatDef = 0;
    });

    enemy.skills[0].timer = 0;

    // Integer tick counter avoids float-accumulation precision issues
    let ticks = 0;
    const TICK_RATE = 0.1;
    const MAX_TICKS = 450; // 45 seconds

    while (enemy.currentHp > 0 && this.isTeamAlive(team) && ticks < MAX_TICKS) {
      ticks++;
      const time = parseFloat((ticks * TICK_RATE).toFixed(1));

      // 1. Hero skill timers
      team.forEach(hero => {
        if (hero.currentHp <= 0) return;
        hero.skillTimer = parseFloat((hero.skillTimer + TICK_RATE).toFixed(2));
        if (hero.skillTimer >= hero.skillCooldown) {
          this.castHeroSkill(hero, team, enemy, time, battleLog, language);
          hero.skillTimer = 0;
        }
      });

      // 2. Enemy skill timer
      enemy.skills[0].timer = parseFloat((enemy.skills[0].timer + TICK_RATE).toFixed(2));
      if (enemy.skills[0].timer >= enemy.skills[0].cooldown) {
        this.castEnemySkill(enemy, team, time, battleLog, language);
        enemy.skills[0].timer = 0;
      }

      // 3. Base attacks every 1.0s (ticks % 10 === 0, no float comparison)
      if (ticks % 10 === 0) {
        // Every alive hero attacks
        const aliveHeroes = team.filter(h => h.currentHp > 0);
        aliveHeroes.forEach(attacker => {
          if (enemy.currentHp <= 0) return;

          const elemMult = this.getElementalMultiplier(attacker.element || 'VENTO', enemy.element || 'VENTO');
          const baseDmg = Math.max(1, attacker.attack - enemy.defense);
          const isCrit = Math.random() < attacker.criticalChance;
          const dmg = Math.round(baseDmg * elemMult * (isCrit ? 1.5 : 1.0));

          enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

          let msg = language === 'en'
            ? `[${time}s] 🗡️ ${attacker.name} base attack: ${dmg} dmg to ${enemy.name}.`
            : `[${time}s] 🗡️ ${attacker.name} attacco base: ${dmg} danni a ${enemy.name}.`;
          if (isCrit) msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
          if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Element Adv!)' : ' (🔥 Vantaggio Elem!)';
          if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Element Disadv)' : ' (❄️ Svantaggio Elem)';
          msg += language === 'en' ? ` (Enemy HP: ${enemy.currentHp}/${enemy.maxHp})` : ` (HP Nemico: ${enemy.currentHp}/${enemy.maxHp})`;
          battleLog.push(msg);
        });

        // Enemy base attack (single target)
        if (enemy.currentHp > 0) {
          const target = this.selectEnemyTarget(team);
          if (target) {
            const elemMult = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
            const effectiveDef = target.defense + (target.tempCombatDef || 0);
            const baseDmg = Math.max(1, enemy.attack - effectiveDef);
            const dmg = Math.round(baseDmg * elemMult);

            target.currentHp = Math.max(0, target.currentHp - dmg);

            let msg = language === 'en'
              ? `[${time}s] 💥 ${enemy.name} strikes ${target.name}: ${dmg} dmg.`
              : `[${time}s] 💥 ${enemy.name} colpisce ${target.name}: ${dmg} danni.`;
            if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Element Adv!)' : ' (🔥 Vantaggio Elem!)';
            if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Element Disadv)' : ' (❄️ Svantaggio Elem)';
            msg += language === 'en' ? ` (Hero HP: ${target.currentHp}/${target.maxHp})` : ` (HP Eroe: ${target.currentHp}/${target.maxHp})`;
            battleLog.push(msg);
          }
        }
      }
    }

    // Restore original stats and clear combat buffs
    team.forEach((h, idx) => {
      h.attack = originalAttacks[idx];
      h.defense = originalDefenses[idx];
      h.skillCooldown = originalCooldowns[idx];
      h.criticalChance = originalCrits[idx];
      h.tempCombatDef = 0;
    });

    const victory = enemy.currentHp <= 0;
    const time = parseFloat((ticks * TICK_RATE).toFixed(1));
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

  // GIGANTE has 65% aggro pull (protects the team)
  public static selectEnemyTarget(team: Hero[]): Hero | null {
    const alive = team.filter(h => h.currentHp > 0);
    if (alive.length === 0) return null;
    const giant = alive.find(h => h.heroClass === 'GIGANTE');
    if (giant && Math.random() < 0.65) return giant;
    return alive[Math.floor(Math.random() * alive.length)];
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
        if (isCrit) msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
        if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
        if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
        msg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
        log.push(msg);
        break;
      }

      case 'JANA': {
        const wounded = team.filter(h => h.currentHp > 0 && h.currentHp < h.maxHp);
        const janaCount = team.filter(h => h.currentHp > 0 && h.heroClass === 'JANA').length;
        const healMult = janaCount >= 2 ? 1.20 : 1.0;

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
          if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
          if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
          msg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
          log.push(msg);
        }
        break;
      }

      case 'GIGANTE': {
        // Sets a fixed defense shield — does NOT accumulate across casts
        team.forEach(h => {
          if (h.currentHp > 0) h.tempCombatDef = 3;
        });
        log.push(language === 'en'
          ? `[${time}s] ✨ 🛡️ ${hero.name} activates ${hero.skillName}! Team defense shield: +3 DEF.`
          : `[${time}s] ✨ 🛡️ ${hero.name} attiva ${hero.skillName}! Scudo difensivo del team: +3 DEF.`);
        break;
      }

      case 'ACCABADORA': {
        const isExecution = (enemy.currentHp / enemy.maxHp) < 0.3;
        const mult = isExecution ? 5.5 : 2.0;
        const isCrit = Math.random() < hero.criticalChance;
        let dmg = Math.max(5, Math.round(hero.attack * mult - enemy.defense));
        dmg = Math.round(dmg * elemMult * (isCrit ? 1.5 : 1.0));
        // Cap execution damage at 35% of enemy max HP to prevent one-shots at high levels
        if (isExecution) dmg = Math.min(dmg, Math.round(enemy.maxHp * 0.35));
        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);

        let msg = language === 'en'
          ? `[${time}s] ✨ 💀 ${hero.name} unleashes ${hero.skillName}: ${dmg} dmg to ${enemy.name}${isExecution ? ' (Execution! 🩸)' : ''}.`
          : `[${time}s] ✨ 💀 ${hero.name} scarica ${hero.skillName}: ${dmg} danni a ${enemy.name}${isExecution ? ' (Esecuzione letale! 🩸)' : ''}.`;
        if (isCrit) msg += language === 'en' ? ' (💥 CRITICAL!)' : ' (💥 CRITICO!)';
        if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
        if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
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
    const target = this.selectEnemyTarget(team);
    if (!target) return;

    const skill = enemy.skills[0];
    const elemMult = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
    const effectiveDef = target.defense + (target.tempCombatDef || 0);
    const baseDmg = Math.max(5, Math.round(skill.damage - effectiveDef));
    const dmg = Math.round(baseDmg * elemMult);
    target.currentHp = Math.max(0, target.currentHp - dmg);

    let msg = language === 'en'
      ? `[${time}s] ⚠️ 💥 ${enemy.name} uses '${skill.name}' on ${target.name}: ${dmg} dmg!`
      : `[${time}s] ⚠️ 💥 ${enemy.name} usa '${skill.name}' su ${target.name}: ${dmg} danni!`;
    if (elemMult > 1.0) msg += language === 'en' ? ' (🔥 Elem Adv!)' : ' (🔥 Vantaggio Elem!)';
    if (elemMult < 1.0) msg += language === 'en' ? ' (❄️ Elem Disadv)' : ' (❄️ Svantaggio Elem)';
    msg += ` (HP: ${target.currentHp}/${target.maxHp})`;
    log.push(msg);
  }
}
export default CombatEngine;
