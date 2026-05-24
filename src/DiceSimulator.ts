import { BoardManager } from './BoardManager';
import { CombatEngine } from './CombatEngine';
import { Hero, GameState } from './types';

// 1. Inizializzazione della Squadra degli Eroi (Sardinian Mythology Theme)
const initialTeam: Hero[] = [
  {
    id: 'h1',
    name: 'Amsicora',
    heroClass: 'SHARDANA',
    grade: 'SR',
    level: 1,
    maxHp: 180,
    currentHp: 180,
    attack: 38,
    defense: 8,
    criticalChance: 0.15,
    element: 'OSSIDIANA',
    skillName: 'Furia del Bronzo',
    skillCastTime: 0.5,
    skillCooldown: 3.5, // 3.5 secondi ricarica
    skillTimer: 0,
    skillReady: false,
  },
  {
    id: 'h2',
    name: 'Jana Medusa',
    heroClass: 'JANA',
    grade: 'S',
    level: 1,
    maxHp: 120,
    currentHp: 120,
    attack: 28,
    defense: 4,
    criticalChance: 0.05,
    element: 'ACQUA',
    skillName: 'Soffio di Domus',
    skillCastTime: 0.8,
    skillCooldown: 4.0, // 4.0 secondi ricarica
    skillTimer: 0,
    skillReady: false,
  },
  {
    id: 'h3',
    name: 'Orthobene',
    heroClass: 'GIGANTE',
    grade: 'R',
    level: 1,
    maxHp: 250,
    currentHp: 250,
    attack: 22,
    defense: 12,
    criticalChance: 0.02,
    element: 'PIETRA',
    skillName: 'Scudo Concentrico',
    skillCastTime: 0.2,
    skillCooldown: 5.0, // 5.0 secondi ricarica
    skillTimer: 0,
    skillReady: false,
  },
  {
    id: 'h4',
    name: 'Eleonora',
    heroClass: 'ACCABADORA',
    grade: 'S',
    level: 1,
    maxHp: 130,
    currentHp: 130,
    attack: 34,
    defense: 5,
    criticalChance: 0.25,
    element: 'OSSIDIANA',
    skillName: 'Colpo di Grazia',
    skillCastTime: 0.4,
    skillCooldown: 3.0, // 3.0 secondi ricarica
    skillTimer: 0,
    skillReady: false,
  },
  {
    id: 'h5',
    name: 'Josto',
    heroClass: 'SHARDANA',
    grade: 'C',
    level: 1,
    maxHp: 100,
    currentHp: 100,
    attack: 20,
    defense: 5,
    criticalChance: 0.08,
    element: 'VENTO',
    skillName: 'Fendente del Cacciatore',
    skillCastTime: 0.5,
    skillCooldown: 3.8,
    skillTimer: 0,
    skillReady: false,
  }
];

// 2. Stato iniziale del Gioco
const state: GameState = {
  currentLevel: 1,
  playerPosition: 0,
  coins: 800, // Più soldi per consentire gli acquisti al mercante
  gems: 10,
  team: initialTeam,
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation() {
  console.log(`========================================================================`);
  console.log(`🏺 BENVENUTO A: AIjò Dice Gacha (Logica RPG - Sprint 2) 🏺`);
  console.log(`========================================================================`);
  console.log(`[Stato] Livello Attuale: ${state.currentLevel}`);
  console.log(`[Stato] Monete: ${state.coins} 🪙  | Gemme: ${state.gems} 💎`);
  console.log(`[Stato] Squadra di 5 eroi sardi pronta:`);
  state.team.forEach(h => console.log(`  - ${h.name} (${h.heroClass} - Grado ${h.grade} - Elemento: ${h.element}): HP ${h.currentHp}/${h.maxHp}, ATK ${h.attack}, DEF ${h.defense}`));
  
  // Generazione del tabellone di caselle per il livello
  const board = BoardManager.generateBoard(state.currentLevel);
  console.log(`\n[Tavola] Generato Percorso Lineare a Serpente di ${board.length} caselle!`);
  board.forEach(c => console.log(`  Casella ${c.id}: ${c.name} (${c.type})`));
  console.log(`========================================================================\n`);

  let turn = 1;
  const boardSize = board.length;

  // Ciclo principale sul tabellone lineare fino alla vittoria (Boss sconfitto) o sconfitta (HP a 0)
  while (state.playerPosition < boardSize && state.team.some(h => h.currentHp > 0)) {
    console.log(`--- [TURNO ${turn}] ---`);
    const roll = Math.floor(Math.random() * 6) + 1;
    const oldPos = state.playerPosition;
    state.playerPosition = BoardManager.movePlayer(state.playerPosition, roll, boardSize);

    console.log(`🎲 Lancio dadi: ottenuto ${roll}! Spostamento da Casella ${oldPos} a Casella ${state.playerPosition}.`);
    
    const landingCell = board[state.playerPosition];
    console.log(`📍 Atterrato su: ${landingCell.name} (${landingCell.type})`);

    // Gestione degli eventi di atterraggio
    switch (landingCell.type) {
      case 'COINS':
        state.coins += landingCell.value;
        console.log(`💰 Oro sardo trovato! +${landingCell.value} Monete (Totale: ${state.coins} 🪙)`);
        break;

      case 'GEMS':
        state.gems += landingCell.value;
        console.log(`💎 Minerale prezioso estratto! +${landingCell.value} Gemme (Totale: ${state.gems} 💎)`);
        break;

      case 'TEMPLE':
        // Cura della squadra
        state.team.forEach(h => {
          if (h.currentHp > 0) {
            const heal = Math.round(h.maxHp * (landingCell.value / 100));
            h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
          }
        });
        console.log(`🩹 L'acqua sacra cura la squadra! Ripristinato il ${landingCell.value}% dei HP agli eroi in vita.`);
        break;

      case 'TRAP':
        // Danno da trappola a tutta la squadra
        state.team.forEach(h => {
          if (h.currentHp > 0) {
            const damage = Math.round(h.maxHp * (landingCell.value / 100));
            h.currentHp = Math.max(0, h.currentHp - damage);
          }
        });
        console.log(`💥 Danno da trappola! Tutti gli eroi subiscono il ${landingCell.value}% di danno HP.`);
        const aliveCount = state.team.filter(h => h.currentHp > 0).length;
        console.log(`  [Squadra] Eroi rimasti in vita: ${aliveCount}/5`);
        break;

      case 'MERCHANT':
        // Simula acquisto dal mercante
        console.log(`🛒 Incontrato il Mercante Shardana!`);
        if (state.coins >= 400) {
          state.coins -= 400;
          console.log(`🛒 [Mercante] Comprato un Risveglio Casuale per 400 Monete! (Monete rimanenti: ${state.coins} 🪙)`);
        } else if (state.coins >= 350) {
          state.coins -= 350;
          state.gems += 15;
          console.log(`🛒 [Mercante] Comprato un pacchetto di 15 Gemme di Ossidiana per 350 Monete! (Gemme totali: ${state.gems} 💎, Monete: ${state.coins} 🪙)`);
        } else {
          console.log(`🛒 [Mercante] Non hai abbastanza monete d'oro per comprare nulla! Il mercante ti saluta.`);
        }
        break;

      case 'DECISION':
        // Simula Scelta del Destino
        console.log(`🔮 Incontro Misterioso: Scelta del Destino!`);
        // Simula scelta a caso (50% rischio, 50% sicurezza)
        if (Math.random() < 0.5) {
          console.log(`🔮 [Decisione] Hai deciso di rischiare ed esplorare le rovine del Nuraghe!`);
          if (Math.random() < 0.5) {
            state.gems += 30;
            console.log(`   💎 Successo! Hai estratto +30 Gemme di Ossidiana 💎! (Totale: ${state.gems} 💎)`);
          } else {
            state.team.forEach(h => {
              if (h.currentHp > 0) {
                const dmg = Math.round(h.maxHp * 0.20);
                h.currentHp = Math.max(0, h.currentHp - dmg);
              }
            });
            console.log(`   🕸️ Frana! Crollano massi sul team, infliggendo il 20% di danno HP a tutti.`);
          }
        } else {
          state.coins += 150;
          console.log(`   🪙 Hai deciso di seguire il sentiero sicuro in piena tranquillità. Ricevi +150 Monete! (Totale: ${state.coins} 🪙)`);
        }
        break;

      case 'COMMON_ENEMY':
      case 'ELITE_ENEMY':
      case 'BOSS':
        // Scontro a tempo reale - Convertiamo CellType in EnemyType per il CombatEngine
        let enemyType: 'COMMON' | 'ELITE' | 'BOSS' = 'COMMON';
        if (landingCell.type === 'ELITE_ENEMY') {
          enemyType = 'ELITE';
        } else if (landingCell.type === 'BOSS') {
          enemyType = 'BOSS';
        }
        
        const enemy = CombatEngine.spawnEnemy(state.currentLevel, enemyType);
        console.log(`⚔️ Incontro nemico ostile! Inizio dello scontro automatico in TEMPO REALE vs [Nemico: ${enemy.name} | Elemento: ${enemy.element}]`);
        
        const battle = CombatEngine.simulateRealTimeCombat(state.team, enemy);
        
        // Stampa il log completo della timeline della battaglia in tempo reale
        battle.log.forEach(l => console.log(`   ${l}`));

        if (!battle.victory) {
          console.log(`\n💀 GAME OVER! La squadra è stata sconfitta dal guardiano.`);
          return;
        } else {
          // Ricompensa per la vittoria del combattimento
          let rewardCoins = 100;
          let rewardGems = 5;
          if (landingCell.type === 'ELITE_ENEMY') {
            rewardCoins = 300;
            rewardGems = 15;
          } else if (landingCell.type === 'BOSS') {
            rewardCoins = 1000;
            rewardGems = 50;
          }
          state.coins += rewardCoins;
          state.gems += rewardGems;
          console.log(`🎉 Combattimento superato! Ricompensa scontro: +${rewardCoins} Monete 🪙  | +${rewardGems} Gemme 💎`);
        }
        break;
    }

    // Report finale degli HP della squadra per questo turno
    console.log(`📋 Punti Vita Squadra alla fine del turno:`);
    state.team.forEach(h => console.log(`  - ${h.name}: HP ${h.currentHp}/${h.maxHp} (${h.currentHp > 0 ? 'Vivo' : 'Deceduto'})`));
    console.log(`----------------------------------------\n`);

    if (state.playerPosition === boardSize - 1) {
      console.log(`🏆 CONGRATULAZIONI! Hai sconfitto il Boss Finale e superato il Livello ${state.currentLevel}!`);
      console.log(`🏆 Livello 1 completato con successo!`);
      console.log(`🏆 Bilancio Finale: ${state.coins} 🪙  | ${state.gems} 💎`);
      return;
    }

    turn++;
    await sleep(200); // Piccola pausa tra i turni per rendere la simulazione godibile
  }
}

runSimulation();
export default runSimulation;
