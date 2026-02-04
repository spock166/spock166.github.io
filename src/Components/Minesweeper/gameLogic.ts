import { Cell } from './types';

// Seeded random number generator for deterministic infinite board
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  nextInRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Hash function to convert coordinates to deterministic seed
export function coordsToSeed(x: number, y: number, baseSeed: number = 12345): number {
  // Simple hash function
  let hash = baseSeed;
  hash = ((hash << 5) - hash) + x;
  hash = hash & hash;
  hash = ((hash << 5) - hash) + y;
  hash = hash & hash;
  return Math.abs(hash);
}

// Check if a coordinate is a mine using seeded random
export function isMineAtCoord(x: number, y: number, mineDensity: number, baseSeed: number): boolean {
  const seed = coordsToSeed(x, y, baseSeed);
  const rng = new SeededRandom(seed);
  return rng.next() < mineDensity;
}

// Calculate adjacent mines for a cell
export function calculateAdjacentMines(
  x: number,
  y: number,
  getCellOrCheck: (x: number, y: number) => Cell | boolean
): number {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const result = getCellOrCheck(x + dx, y + dy);
      if (typeof result === 'boolean') {
        if (result) count++;
      } else if (result && result.isMine) {
        count++;
      }
    }
  }
  return count;
}

// Fisher-Yates shuffle for classic mode mine placement
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate positions for classic mode, avoiding first click
export function generateClassicMinePositions(
  width: number,
  height: number,
  mineCount: number,
  safeX: number,
  safeY: number
): Set<string> {
  const positions: Array<{ x: number; y: number }> = [];
  
  // Generate all possible positions except the safe cell and its neighbors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isSafe = Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1;
      if (!isSafe) {
        positions.push({ x, y });
      }
    }
  }

  // Shuffle and take first mineCount positions
  const shuffled = shuffleArray(positions);
  const minePositions = new Set<string>();
  
  for (let i = 0; i < Math.min(mineCount, shuffled.length); i++) {
    const pos = shuffled[i];
    minePositions.add(`${pos.x},${pos.y}`);
  }

  return minePositions;
}

// Get adjacent coordinates
export function getAdjacentCoords(x: number, y: number): Array<{ x: number; y: number }> {
  const coords: Array<{ x: number; y: number }> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      coords.push({ x: x + dx, y: y + dy });
    }
  }
  return coords;
}
