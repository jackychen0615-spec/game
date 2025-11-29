export enum GamePhase {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  position: [number, number, number];
}

export interface EnemyData {
  id: string;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  isDead: boolean;
  type: 'minion' | 'boss';
}

export interface Loot {
  id: string;
  position: [number, number, number];
  type: 'health' | 'weapon';
}

export interface GameState {
  enemies: EnemyData[];
  loots: Loot[];
  score: number;
}