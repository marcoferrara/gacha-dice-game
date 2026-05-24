import { Cell, CellType } from './types';

export class BoardManager {
  /**
   * Genera una tavola lineare a serpente basata sul livello di gioco.
   * Livello 1: 15 caselle.
   * Il tabellone cresce gradualmente all'aumentare del livello.
   * Dal Livello 15 in poi: Cappa a un massimo di 50 caselle.
   */
  public static generateBoard(level: number): Cell[] {
    // Formula di crescita: Livello 1 = 15, Livello 2 = 18, Livello 3 = 21, ..., Cappa a 50 dal livello 13+ (e quindi sicuramente al 15+)
    const size = Math.min(15 + (level - 1) * 3, 50);
    const board: Cell[] = [];

    // Casella 0: Partenza (Pozzo Sacro)
    board.push({
      id: 0,
      type: 'TEMPLE',
      name: 'Partenza (Pozzo Sacro di Santa Cristina)',
      value: 30, // Ricarica HP iniziale
    });

    const typesPool: CellType[] = ['COINS', 'GEMS', 'TRAP', 'COMMON_ENEMY', 'TEMPLE'];

    for (let i = 1; i < size - 1; i++) {
      // Casella Elite a metà tracciato
      if (i === Math.floor(size / 2)) {
        board.push({
          id: i,
          type: 'ELITE_ENEMY',
          name: 'Incontro Elite: Mamuthone Oscuro Capo',
          value: 0,
        });
        continue;
      }

      // Distribuzione casuale ponderata delle caselle
      const rand = Math.random();
      let type: CellType;
      let name = '';
      let value = 0;

      if (rand < 0.25) {
        type = 'COINS';
        name = `Casella Tesoro: Monete Shardana (+${50 + Math.floor(Math.random() * 150)} 🪙)`;
        value = 50 + Math.floor(Math.random() * 150);
      } else if (rand < 0.35) {
        type = 'GEMS';
        name = `Casella Tesoro: Ossidiana Preziosa (+${10 + Math.floor(Math.random() * 20)} 💎)`;
        value = 10 + Math.floor(Math.random() * 20);
      } else if (rand < 0.50) {
        type = 'TRAP';
        name = 'Casella Trappola: Frana di Rocce Nuragiche! 🕸️';
        value = 15; // 15% di danno HP alla squadra
      } else if (rand < 0.65) {
        type = 'COMMON_ENEMY';
        name = 'Incontro Nemico: Guerriero Selvaggio Oscuro';
        value = 0;
      } else if (rand < 0.75) {
        type = 'TEMPLE';
        name = 'Tempio Sacro: Acqua Benedetta di Fonte Janas 🩹';
        value = 25; // Cura il 25% degli HP
      } else if (rand < 0.87) {
        type = 'MERCHANT';
        name = 'Bottega Sarda: Il Mercante Shardana 🛒';
        value = 0;
      } else {
        type = 'DECISION';
        name = 'Incontro Misterioso: Scelta del Destino 🔮';
        value = 0;
      }

      board.push({
        id: i,
        type,
        name: `Casella ${i}: ${name}`,
        value,
      });
    }

    // Ultima Casella: Boss di fine livello
    board.push({
      id: size - 1,
      type: 'BOSS',
      name: `Casella ${size - 1} [Boss]: Il Guardiano del Nuraghe (Mamuthone Antico)`,
      value: 0,
    });

    return board;
  }

  /**
   * Sposta il giocatore sul tabellone lineare.
   * Trattandosi di un percorso lineare, il giocatore non fa loop: se supera l'ultima casella,
   * atterra esattamente sul Boss finale dell'ultima casella.
   */
  public static movePlayer(currentPosition: number, diceRoll: number, boardSize: number): number {
    const nextPosition = currentPosition + diceRoll;
    if (nextPosition >= boardSize - 1) {
      return boardSize - 1; // Atterrato sul boss finale
    }
    return nextPosition;
  }
}
export default BoardManager;
