export type CellState = 'hidden' | 'revealed' | 'flagged';

export type GameMode = 'classic' | 'infinite';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface ClassicBoardConfig {
  width: number;
  height: number;
  mineCount: number;
}

export interface InfiniteBoardConfig {
  mineDensity: number; // 0-1, percentage of cells that are mines
  chunkSize: number; // size of generation chunks
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, ClassicBoardConfig> = {
  easy: { width: 9, height: 9, mineCount: 10 },
  medium: { width: 16, height: 16, mineCount: 40 },
  hard: { width: 30, height: 16, mineCount: 99 },
};

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}
