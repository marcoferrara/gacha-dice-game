import { Hero, Enemy, EnemyType, ElementType } from './types';

export class CombatEngine {
  /**
   * Genera un nemico in base al livello e alla tipologia (Common, Elite, Boss)
   */
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

    // Bilanciamento in base al livello
    const baseHp = hpMultiplier * (1 + (level - 1) * 0.15);
    const baseAttack = 15 * statMultiplier * (1 + (level - 1) * 0.12);
    const baseDefense = 4 * statMultiplier * (1 + (level - 1) * 0.1);

    // Assegna elemento in base alla rarità/tipo
    let element: ElementType = 'VENTO';
    if (type === 'BOSS') {
      element = 'PIETRA';
    } else if (type === 'ELITE') {
      element = 'OSSIDIANA';
    } else {
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
      skills: {
        name: type === 'BOSS' ? 'Terremoto Nuragico' : 'Fendente Oscuro',
        damage: Math.round(baseAttack * 1.8),
        cooldown: type === 'BOSS' ? 5.0 : 4.0,
        timer: 0,
      },
    };
  }

  /**
   * Restituisce il moltiplicatore di danno basato sulla ruota degli elementi:
   * OSSIDIANA > VENTO > PIETRA > ACQUA > OSSIDIANA
   */
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

  /**
   * Calcola le sinergie attive basate sulle classi della squadra
   */
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

    return {
      atkMultiplier,
      defBonus,
      healMultiplier,
      cooldownReduction,
      critChanceBonus,
      activeList
    };
  }

  /**
   * Esegue la simulazione di combattimento automatico in Tempo Reale.
   */
  public static simulateRealTimeCombat(team: Hero[], enemy: Enemy, language: 'en' | 'it' = 'en'): { victory: boolean; log: string[] } {
    const battleLog: string[] = [];
    
    const startMsg = language === 'en'
      ? `⚔️ REAL-TIME BATTLE STARTED vs. ${enemy.name} [Element: ${enemy.element}] (HP: ${enemy.maxHp}, ATK: ${enemy.attack}, DEF: ${enemy.defense})`
      : `⚔️ INIZIO BATTAGLIA IN TEMPO REALE vs. ${enemy.name} [Elemento: ${enemy.element}] (HP: ${enemy.maxHp}, ATK: ${enemy.attack}, DEF: ${enemy.defense})`;
    battleLog.push(startMsg);
    
    // Calcola le sinergie di squadra all'inizio dello scontro
    const synergies = this.calculateSynergies(team);
    if (synergies.activeList.length > 0) {
      battleLog.push(language === 'en' ? `🌟 Active team synergies:` : `🌟 Sinergie attive di squadra:`);
      synergies.activeList.forEach(s => {
        let localizedSynergy = s;
        if (language === 'en') {
          if (s.includes('Furia Guerriera Shardana')) localizedSynergy = 'Shardana Warrior Fury (+15% ATK)';
          else if (s.includes('Benedizione delle Janas')) localizedSynergy = 'Janas Blessing (+20% Healing, -10% CD)';
          else if (s.includes('Baluardo Basaltico dei Giganti')) localizedSynergy = 'Basaltic Bulwark of Giants (+3 DEF)';
          else if (s.includes('Rito del Trapasso delle Accabadore')) localizedSynergy = 'Accabadora Death Rite (+10% Crit)';
        }
        battleLog.push(`   * ${localizedSynergy}`);
      });
    }

    // Applica i bonus temporanei alle statistiche durante il combattimento
    const originalAttacks = team.map(h => h.attack);
    const originalDefenses = team.map(h => h.defense);
    const originalCooldowns = team.map(h => h.skillCooldown);
    const originalCrits = team.map(h => h.criticalChance);

    team.forEach((h, idx) => {
      if (h.currentHp > 0) {
        h.attack = Math.round(h.attack * synergies.atkMultiplier);
        h.defense += synergies.defBonus;
        h.skillCooldown = parseFloat(Math.max(1.0, h.skillCooldown * (1 - synergies.cooldownReduction)).toFixed(1));
        h.criticalChance += synergies.critChanceBonus;
      }
    });

    // Inizializza i timer delle abilità degli eroi
    team.forEach(h => {
      h.skillTimer = 0;
      h.skillReady = false;
    });

    let enemySkillTimer = 0;
    let time = 0.0;
    const tickRate = 0.1;
    const maxDuration = 45.0;

    // Ciclo principale in tempo reale
    while (enemy.currentHp > 0 && this.isTeamAlive(team) && time < maxDuration) {
      time = parseFloat((time + tickRate).toFixed(1));

      // 1. Accumulo timer abilità degli Eroi (Tempo di evocazione / Casting)
      team.forEach(hero => {
        if (hero.currentHp <= 0) return;

        hero.skillTimer = parseFloat((hero.skillTimer + tickRate).toFixed(1));
        
        if (hero.skillTimer >= hero.skillCooldown) {
          this.castHeroSkill(hero, team, enemy, time, battleLog, language);
          hero.skillTimer = 0;
        }
      });

      // 2. Accumulo timer abilità del Nemico
      enemySkillTimer = parseFloat((enemySkillTimer + tickRate).toFixed(1));
      if (enemySkillTimer >= enemy.skills.cooldown) {
        this.castEnemySkill(enemy, team, time, battleLog, language);
        enemySkillTimer = 0;
      }

      // 3. Attacchi Base (avvengono in tempo reale ogni 1.0 secondi)
      if (parseFloat((time % 1.0).toFixed(1)) === 0) {
        // Attacco base dei nostri Eroi vivi
        const aliveHeroes = team.filter(h => h.currentHp > 0);
        if (aliveHeroes.length > 0) {
          const attacker = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
          
          const attackerElement = attacker.element || 'VENTO';
          const targetElement = enemy.element || 'VENTO';
          const elemMult = this.getElementalMultiplier(attackerElement, targetElement);

          const baseDmg = Math.max(1, attacker.attack - enemy.defense);
          const dmg = Math.round(baseDmg * elemMult);
          
          enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
          
          let logMsg = language === 'en'
            ? `[${time}s] 🗡️ ${attacker.name} performs base attack: ${dmg} damage to ${enemy.name}.`
            : `[${time}s] 🗡️ ${attacker.name} sferra attacco base: ${dmg} danni a ${enemy.name}.`;
          if (elemMult > 1.0) logMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
          if (elemMult < 1.0) logMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
          logMsg += language === 'en' ? ` (Enemy HP: ${enemy.currentHp}/${enemy.maxHp})` : ` (HP Nemico: ${enemy.currentHp}/${enemy.maxHp})`;
          battleLog.push(logMsg);
        }

        // Attacco base del Nemico se ancora in vita
        if (enemy.currentHp > 0) {
          const target = this.selectEnemyTarget(team);
          if (target) {
            const attackerElement = enemy.element || 'VENTO';
            const targetElement = target.element || 'VENTO';
            const elemMult = this.getElementalMultiplier(attackerElement, targetElement);

            const baseDmg = Math.max(1, enemy.attack - target.defense);
            const dmg = Math.round(baseDmg * elemMult);
            
            target.currentHp = Math.max(0, target.currentHp - dmg);
            
            let logMsg = language === 'en'
              ? `[${time}s] 💥 ${enemy.name} strikes ${target.name}: ${dmg} damage dealt.`
              : `[${time}s] 💥 ${enemy.name} colpisce ${target.name}: ${dmg} danni inflitti.`;
            if (elemMult > 1.0) logMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
            if (elemMult < 1.0) logMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
            logMsg += language === 'en' ? ` (Hero HP: ${target.currentHp}/${target.maxHp})` : ` (HP Eroe: ${target.currentHp}/${target.maxHp})`;
            battleLog.push(logMsg);
          }
        }
      }
    }

    // Ripristina le statistiche originali degli eroi
    team.forEach((h, idx) => {
      h.attack = originalAttacks[idx];
      h.defense = originalDefenses[idx];
      h.skillCooldown = originalCooldowns[idx];
      h.criticalChance = originalCrits[idx];
    });

    const victory = enemy.currentHp <= 0;
    if (victory) {
      battleLog.push(language === 'en'
        ? `🏆 VICTORY! ${enemy.name} was defeated in ${time} seconds!`
        : `🏆 VITTORIA! ${enemy.name} è stato abbattuto in ${time} secondi!`);
    } else if (time >= maxDuration) {
      battleLog.push(language === 'en'
        ? `⏱️ TIME OUT! The heroes had to retreat due to exhaustion.`
        : `⏱️ TEMPO SCADUTO! Gli eroi si sono dovuti ritirare dalla stanchezza.`);
    } else {
      battleLog.push(language === 'en'
        ? `💀 DEFEAT! The entire team fell in battle against ${enemy.name}.`
        : `💀 SCONFITTA! L'intera squadra è caduta in battaglia contro ${enemy.name}.`);
    }

    return { victory, log: battleLog };
  }

  /**
   * Verifica se almeno un eroe della squadra è ancora vivo
   */
  public static isTeamAlive(team: Hero[]): boolean {
    return team.some(h => h.currentHp > 0);
  }

  /**
   * Seleziona il bersaglio del nemico in base al sistema di Aggro (i Giganti proteggono il team)
   */
  public static selectEnemyTarget(team: Hero[]): Hero | null {
    const aliveHeroes = team.filter(h => h.currentHp > 0);
    if (aliveHeroes.length === 0) return null;

    const giant = aliveHeroes.find(h => h.heroClass === 'GIGANTE');
    if (giant && Math.random() < 0.65) {
      return giant;
    }

    return aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
  }

  /**
   * Lancia l'abilità speciale di un eroe
   */
  public static castHeroSkill(hero: Hero, team: Hero[], enemy: Enemy, time: number, log: string[], language: 'en' | 'it' = 'en'): void {
    let dmg = 0;
    const elemMult = this.getElementalMultiplier(hero.element || 'VENTO', enemy.element || 'VENTO');
    
    switch (hero.heroClass) {
      case 'SHARDANA':
        // Furia del Bronzo: 3.5x attacco
        dmg = Math.max(5, Math.round(hero.attack * 3.5 - enemy.defense));
        dmg = Math.round(dmg * elemMult);
        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
        
        let shardanaMsg = language === 'en'
          ? `[${time}s] ✨ 🔥 ${hero.name} unleashes ${hero.skillName}: ${dmg} damage to ${enemy.name}.`
          : `[${time}s] ✨ 🔥 ${hero.name} scatena ${hero.skillName}: ${dmg} danni a ${enemy.name}.`;
        if (elemMult > 1.0) shardanaMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
        if (elemMult < 1.0) shardanaMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
        shardanaMsg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
        log.push(shardanaMsg);
        break;

      case 'JANA':
        // Soffio di Domus: Cura l'intero team o lancia saetta di broccato. Applica bonus cure da sinergia Janas
        const wounded = team.filter(h => h.currentHp > 0 && h.currentHp < h.maxHp);
        const janaCount = team.filter(h => h.currentHp > 0 && h.heroClass === 'JANA').length;
        const healMult = janaCount >= 2 ? 1.20 : 1.0;

        if (wounded.length > 0) {
          wounded.forEach(h => {
            const heal = Math.round(hero.attack * 2.0 * healMult);
            h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
            log.push(language === 'en'
              ? `[${time}s] ✨ 🩹 ${hero.name} casts ${hero.skillName}! Heals +${heal} HP on ${h.name}. (HP: ${h.currentHp}/${h.maxHp})`
              : `[${time}s] ✨ 🩹 ${hero.name} lancia ${hero.skillName}! Cura +${heal} HP a ${h.name}. (HP: ${h.currentHp}/${h.maxHp})`);
          });
        } else {
          dmg = Math.max(5, Math.round(hero.attack * 2.5));
          dmg = Math.round(dmg * elemMult);
          enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
          
          let janaDmgMsg = language === 'en'
            ? `[${time}s] ✨ ⚡ ${hero.name} casts BROCADE BOLT! Magical damage of ${dmg} to ${enemy.name}.`
            : `[${time}s] ✨ ⚡ ${hero.name} lancia SAETTA DI BROCCATO! Danno magico di ${dmg} a ${enemy.name}.`;
          if (elemMult > 1.0) janaDmgMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
          if (elemMult < 1.0) janaDmgMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
          janaDmgMsg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
          log.push(janaDmgMsg);
        }
        break;

      case 'GIGANTE':
        // Scudo Concentrico: Aumenta temporaneamente la difesa di tutta la squadra
        team.forEach(h => {
          if (h.currentHp > 0) {
            h.defense += 3;
          }
        });
        log.push(language === 'en'
          ? `[${time}s] ✨ 🛡️ ${hero.name} activates ${hero.skillName}! The entire team's defense increases by +3 points.`
          : `[${time}s] ✨ 🛡️ ${hero.name} attiva ${hero.skillName}! La difesa di tutta la squadra aumenta di +3 punti.`);
        break;

      case 'ACCABADORA':
        // Colpo di Grazia: 5.5x se HP nemico < 30%, altrimenti 2.0x
        const isLowHp = (enemy.currentHp / enemy.maxHp) < 0.3;
        const mult = isLowHp ? 5.5 : 2.0;
        dmg = Math.max(5, Math.round(hero.attack * mult - enemy.defense));
        dmg = Math.round(dmg * elemMult);
        enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
        
        let accabadoraMsg = language === 'en'
          ? `[${time}s] ✨ 💀 ${hero.name} unleashes ${hero.skillName}! Damage dealt: ${dmg} to ${enemy.name}${isLowHp ? ' (Lethal Execution! 🩸)' : ''}.`
          : `[${time}s] ✨ 💀 ${hero.name} scarica ${hero.skillName}! Danni sferrati: ${dmg} a ${enemy.name}${isLowHp ? ' (Esecuzione letale! 🩸)' : ''}.`;
        if (elemMult > 1.0) accabadoraMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
        if (elemMult < 1.0) accabadoraMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
        accabadoraMsg += ` (HP: ${enemy.currentHp}/${enemy.maxHp})`;
        log.push(accabadoraMsg);
        break;
    }
  }

  /**
   * Lancia l'abilità del nemico
   */
  public static castEnemySkill(enemy: Enemy, team: Hero[], time: number, log: string[], language: 'en' | 'it' = 'en'): void {
    const target = this.selectEnemyTarget(team);
    if (!target) return;

    const elemMult = this.getElementalMultiplier(enemy.element || 'VENTO', target.element || 'VENTO');
    const baseDmg = Math.max(5, Math.round(enemy.skills.damage - target.defense));
    const dmg = Math.round(baseDmg * elemMult);
    target.currentHp = Math.max(0, target.currentHp - dmg);
    
    let logMsg = language === 'en'
      ? `[${time}s] ⚠️ 💥 ${enemy.name} unleashes special skill '${enemy.skills.name}' on ${target.name}: ${dmg} damage dealt!`
      : `[${time}s] ⚠️ 💥 ${enemy.name} scatena abilità speciale '${enemy.skills.name}' su ${target.name}: ${dmg} danni inflitti!`;
    if (elemMult > 1.0) logMsg += language === 'en' ? ' (🔥 Element Advantage!)' : ' (🔥 Vantaggio Elementale!)';
    if (elemMult < 1.0) logMsg += language === 'en' ? ' (❄️ Element Disadvantage)' : ' (❄️ Svantaggio Elementale)';
    logMsg += ` (HP: ${target.currentHp}/${target.maxHp})`;
    log.push(logMsg);
  }
}
export default CombatEngine;
