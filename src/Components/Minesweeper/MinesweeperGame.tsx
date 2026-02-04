import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameMode, GameStatus, Difficulty, Cell, ClassicBoardConfig, DIFFICULTY_CONFIGS } from './types';
import { generateClassicMinePositions, calculateAdjacentMines, isMineAtCoord, getAdjacentCoords } from './gameLogic';
import './Minesweeper.css';

const CELL_SIZE = 32; // pixels
const INFINITE_MINE_DENSITY = 0.15;
const INFINITE_SEED = 42069;

const MinesweeperGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [board, setBoard] = useState<Map<string, Cell>>(new Map());
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [boardConfig, setBoardConfig] = useState<ClassicBoardConfig>(DIFFICULTY_CONFIGS.easy);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCountRef = useRef(0);
  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);

  // Timer logic
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  const getCellKey = (x: number, y: number) => `${x},${y}`;

  const getCell = useCallback((x: number, y: number): Cell | undefined => {
    return board.get(getCellKey(x, y));
  }, [board]);

  const isMineAt = useCallback((x: number, y: number): boolean => {
    if (gameMode === 'infinite') {
      return isMineAtCoord(x, y, INFINITE_MINE_DENSITY, INFINITE_SEED);
    }
    const cell = getCell(x, y);
    return cell ? cell.isMine : false;
  }, [gameMode, getCell]);

  const isInBounds = useCallback((x: number, y: number): boolean => {
    if (gameMode === 'infinite') return true;
    return x >= 0 && x < boardConfig.width && y >= 0 && y < boardConfig.height;
  }, [gameMode, boardConfig]);

  const generateOrGetCell = useCallback((x: number, y: number): Cell => {
    const existing = getCell(x, y);
    if (existing) return existing;

    // Generate new cell for infinite mode
    const isMine = isMineAt(x, y);
    const adjacentMines = calculateAdjacentMines(x, y, (ax, ay) => isMineAtCoord(ax, ay, INFINITE_MINE_DENSITY, INFINITE_SEED));
    
    return {
      x,
      y,
      isMine,
      adjacentMines,
      state: 'hidden',
    };
  }, [getCell, isMineAt]);

  const initializeClassicBoard = useCallback((firstClickX: number, firstClickY: number) => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    setBoardConfig(config);
    
    const minePositions = generateClassicMinePositions(
      config.width,
      config.height,
      config.mineCount,
      firstClickX,
      firstClickY
    );

    const newBoard = new Map<string, Cell>();

    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const isMine = minePositions.has(getCellKey(x, y));
        newBoard.set(getCellKey(x, y), {
          x,
          y,
          isMine,
          adjacentMines: 0,
          state: 'hidden',
        });
      }
    }

    // Calculate adjacent mines
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const cell = newBoard.get(getCellKey(x, y))!;
        if (!cell.isMine) {
          cell.adjacentMines = calculateAdjacentMines(x, y, (ax, ay) => {
            const adjacentCell = newBoard.get(getCellKey(ax, ay));
            return adjacentCell ? adjacentCell.isMine : false;
          });
        }
      }
    }

    return newBoard;
  }, [difficulty]);

  const revealCell = useCallback((x: number, y: number) => {
    if (!isInBounds(x, y)) return;
    
    let cell = getCell(x, y);
    let newBoard = new Map(board);
    
    // Initialize classic board on first click
    if (gameStatus === 'idle' && gameMode === 'classic') {
      newBoard = initializeClassicBoard(x, y);
      setBoard(newBoard);
      setGameStatus('playing');
      setTimer(0);
      setFlagCount(0);
      cell = newBoard.get(getCellKey(x, y));
    }
    
    // For infinite mode, generate and persist the cell if it doesn't exist
    if (!cell && gameMode === 'infinite') {
      cell = generateOrGetCell(x, y);
      if (gameStatus === 'idle') {
        setGameStatus('playing');
        setTimer(0);
      }
    }
    
    if (!cell || cell.state !== 'hidden') return;

    cell.state = 'revealed';
    newBoard.set(getCellKey(x, y), { ...cell });

    if (cell.isMine) {
      setGameStatus('lost');
      setBoard(newBoard);
      return;
    }

    // Flood fill for empty cells
    if (cell.adjacentMines === 0) {
      const toReveal: Array<{ x: number; y: number }> = [{ x, y }];
      const visited = new Set<string>([getCellKey(x, y)]);

      while (toReveal.length > 0) {
        const current = toReveal.pop()!;
        const adjacent = getAdjacentCoords(current.x, current.y);

        for (const { x: ax, y: ay } of adjacent) {
          if (!isInBounds(ax, ay)) continue;
          const key = getCellKey(ax, ay);
          if (visited.has(key)) continue;
          visited.add(key);

          let adjacentCell = getCell(ax, ay);
          if (!adjacentCell && gameMode === 'infinite') {
            adjacentCell = generateOrGetCell(ax, ay);
          }
          if (!adjacentCell || adjacentCell.state !== 'hidden' || adjacentCell.isMine) continue;

          adjacentCell.state = 'revealed';
          newBoard.set(key, { ...adjacentCell });

          if (adjacentCell.adjacentMines === 0) {
            toReveal.push({ x: ax, y: ay });
          }
        }
      }
    }

    setBoard(newBoard);

    // Check win condition for classic mode
    if (gameMode === 'classic') {
      const allNonMinesRevealed = Array.from(newBoard.values()).every(
        (c) => c.isMine || c.state === 'revealed'
      );
      if (allNonMinesRevealed) {
        setGameStatus('won');
      }
    }
  }, [board, gameStatus, gameMode, isInBounds, getCell, generateOrGetCell, initializeClassicBoard]);

  const toggleFlag = useCallback((x: number, y: number) => {
    if (!isInBounds(x, y)) return;
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    
    let cell = getCell(x, y);
    let newBoard = new Map(board);
    
    // Initialize classic board on first click
    if (gameStatus === 'idle' && gameMode === 'classic') {
      newBoard = initializeClassicBoard(x, y);
      setBoard(newBoard);
      setGameStatus('playing');
      setTimer(0);
      setFlagCount(0);
      cell = newBoard.get(getCellKey(x, y));
    }
    
    // For infinite mode, generate and persist the cell if it doesn't exist
    if (!cell && gameMode === 'infinite') {
      cell = generateOrGetCell(x, y);
      if (gameStatus === 'idle') {
        setGameStatus('playing');
      }
    }
    
    if (!cell || cell.state === 'revealed') return;

    if (cell.state === 'hidden') {
      cell.state = 'flagged';
      setFlagCount((c) => c + 1);
    } else {
      cell.state = 'hidden';
      setFlagCount((c) => c - 1);
    }

    newBoard.set(getCellKey(x, y), { ...cell });
    setBoard(newBoard);
  }, [board, gameStatus, gameMode, isInBounds, getCell, generateOrGetCell, initializeClassicBoard]);

  const handleCellClick = useCallback((x: number, y: number, e: React.MouseEvent | React.TouchEvent) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    
    // Ignore click if we just dragged (for infinite mode panning)
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    
    // Right click is handled by onContextMenu, skip it here
    if ('button' in e && e.button === 2) {
      return;
    }

    e.preventDefault();
    revealCell(x, y);
  }, [gameStatus, revealCell]);

  const handleCellTouchStart = useCallback((x: number, y: number, e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    
    longPressTimer.current = setTimeout(() => {
      toggleFlag(x, y);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, [toggleFlag]);

  const handleCellTouchEnd = useCallback((x: number, y: number, e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      
      if (e.touches.length === 0) {
        revealCell(x, y);
      }
    }
  }, [revealCell]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleBoardTouchStart = useCallback((e: React.TouchEvent) => {
    touchCountRef.current = e.touches.length;
    
    if (e.touches.length === 2 && gameMode === 'infinite') {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      panStartRef.current = { x: centerX - viewport.x, y: centerY - viewport.y };
    }
  }, [gameMode, viewport]);

  const handleBoardTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && panStartRef.current && gameMode === 'infinite') {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      setViewport({
        x: centerX - panStartRef.current.x,
        y: centerY - panStartRef.current.y,
      });
    }
  }, [gameMode]);

  const handleBoardTouchEnd = useCallback(() => {
    panStartRef.current = null;
    touchCountRef.current = 0;
  }, []);

  // Mouse drag support for desktop
  const handleBoardMouseDown = useCallback((e: React.MouseEvent) => {
    if (gameMode === 'infinite' && e.button === 0) {
      isDraggingRef.current = true;
      draggedRef.current = false;
      panStartRef.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
      e.preventDefault();
    }
  }, [gameMode, viewport]);

  const handleBoardMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current && panStartRef.current && gameMode === 'infinite') {
      draggedRef.current = true;
      setViewport({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  }, [gameMode]);

  const handleBoardMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    panStartRef.current = null;
  }, []);

  const handleBoardMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    panStartRef.current = null;
  }, []);

  const handleContextMenu = useCallback((x: number, y: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    toggleFlag(x, y);
  }, [gameStatus, toggleFlag]);

  const newGame = useCallback(() => {
    setBoard(new Map());
    setGameStatus('idle');
    setTimer(0);
    setFlagCount(0);
    setViewport({ x: 0, y: 0 });
  }, []);

  const toggleMode = useCallback(() => {
    setGameMode((mode) => (mode === 'classic' ? 'infinite' : 'classic'));
    newGame();
  }, [newGame]);

  const renderBoard = () => {
    if (gameMode === 'classic') {
      const rows = [];
      for (let y = 0; y < boardConfig.height; y++) {
        const cells = [];
        for (let x = 0; x < boardConfig.width; x++) {
          const cell = getCell(x, y);
          cells.push(
            <div
              key={getCellKey(x, y)}
              className={`cell ${cell?.state || 'hidden'} ${cell?.state === 'revealed' && cell.isMine ? 'mine' : ''}`}
              onMouseDown={(e) => handleCellClick(x, y, e)}
              onContextMenu={(e) => handleContextMenu(x, y, e)}
              onTouchStart={(e) => handleCellTouchStart(x, y, e)}
              onTouchEnd={(e) => handleCellTouchEnd(x, y, e)}
              onTouchMove={handleTouchMove}
            >
              {cell?.state === 'revealed' && !cell.isMine && cell.adjacentMines > 0 && (
                <span className={`number-${cell.adjacentMines}`}>{cell.adjacentMines}</span>
              )}
              {cell?.state === 'revealed' && cell.isMine && '💣'}
              {cell?.state === 'flagged' && '🚩'}
            </div>
          );
        }
        rows.push(
          <div key={y} className="board-row">
            {cells}
          </div>
        );
      }
      return rows;
    } else {
      // Infinite mode rendering
      const viewWidth = Math.ceil((boardRef.current?.clientWidth || 800) / CELL_SIZE);
      const viewHeight = Math.ceil((boardRef.current?.clientHeight || 600) / CELL_SIZE);
      const startX = Math.floor(-viewport.x / CELL_SIZE);
      const startY = Math.floor(-viewport.y / CELL_SIZE);

      const rows = [];
      for (let y = startY; y < startY + viewHeight + 2; y++) {
        const cells = [];
        for (let x = startX; x < startX + viewWidth + 2; x++) {
          const cell = generateOrGetCell(x, y);
          const existingCell = getCell(x, y);
          const displayCell = existingCell || cell;

          cells.push(
            <div
              key={getCellKey(x, y)}
              className={`cell ${displayCell.state} ${displayCell.state === 'revealed' && displayCell.isMine ? 'mine' : ''}`}
              style={{
                position: 'absolute',
                left: x * CELL_SIZE + viewport.x,
                top: y * CELL_SIZE + viewport.y,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
              onMouseDown={(e) => handleCellClick(x, y, e)}
              onContextMenu={(e) => handleContextMenu(x, y, e)}
              onTouchStart={(e) => handleCellTouchStart(x, y, e)}
              onTouchEnd={(e) => handleCellTouchEnd(x, y, e)}
              onTouchMove={handleTouchMove}
            >
              {displayCell.state === 'revealed' && !displayCell.isMine && displayCell.adjacentMines > 0 && (
                <span className={`number-${displayCell.adjacentMines}`}>{displayCell.adjacentMines}</span>
              )}
              {displayCell.state === 'revealed' && displayCell.isMine && '💣'}
              {displayCell.state === 'flagged' && '🚩'}
            </div>
          );
        }
        rows.push(...cells);
      }
      return rows;
    }
  };

  const totalMines = gameMode === 'classic' ? boardConfig.mineCount : '∞';
  const remainingMines = gameMode === 'classic' ? boardConfig.mineCount - flagCount : '∞';

  return (
    <div className="minesweeper-container">
      <div className="game-header">
        <div className="game-info">
          <div className="info-item">
            <span className="info-label">Mines:</span>
            <span className="info-value">{remainingMines}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time:</span>
            <span className="info-value">{timer}s</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value">
              {gameStatus === 'won' && '🎉 Won!'}
              {gameStatus === 'lost' && '💥 Lost!'}
              {gameStatus === 'playing' && '🎮 Playing'}
              {gameStatus === 'idle' && '⏸️ Ready'}
            </span>
          </div>
        </div>
        
        <div className="game-controls">
          <button onClick={newGame} className="btn">New Game</button>
          <button onClick={toggleMode} className="btn">
            {gameMode === 'classic' ? '♾️ Infinite' : '🎯 Classic'}
          </button>
          {gameMode === 'classic' && (
            <select 
              value={difficulty} 
              onChange={(e) => { setDifficulty(e.target.value as Difficulty); newGame(); }}
              className="difficulty-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          )}
        </div>
      </div>

      {gameMode === 'infinite' && (
        <div className="infinite-hint">
          Desktop: Click-drag to pan | Mobile: Two fingers to pan
        </div>
      )}

      <div 
        ref={boardRef}
        className={`board ${gameMode}`}
        onTouchStart={handleBoardTouchStart}
        onTouchMove={handleBoardTouchMove}
        onTouchEnd={handleBoardTouchEnd}
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
        onMouseLeave={handleBoardMouseLeave}
      >
        {renderBoard()}
      </div>
    </div>
  );
};

export default MinesweeperGame;
