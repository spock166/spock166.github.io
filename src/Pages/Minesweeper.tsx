import React from 'react';
import MinesweeperGame from '../Components/Minesweeper/MinesweeperGame';

const Minesweeper: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Minesweeper</h1>
        <p>
          Classic minesweeper with a twist! Try the infinite mode for an endless challenge.
          <br />
          <strong>Controls:</strong> Click/tap to reveal, right-click/long-press to flag.
        </p>
        <MinesweeperGame />
      </div>
    </div>
  );
};

export default Minesweeper;
